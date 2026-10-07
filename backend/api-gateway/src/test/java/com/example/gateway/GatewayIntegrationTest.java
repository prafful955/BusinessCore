package com.example.gateway;

import com.sun.net.httpserver.HttpServer;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

@org.springframework.boot.test.autoconfigure.actuate.observability.AutoConfigureObservability
@org.springframework.test.context.ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "spring.cloud.config.enabled=false",
    "spring.config.import=",
    "eureka.client.enabled=false",
    "spring.cloud.gateway.discovery.locator.enabled=false"
})
class GatewayIntegrationTest {
    private static final AtomicInteger upstreamStatus = new AtomicInteger(200);
    private static final AtomicInteger upstreamCalls = new AtomicInteger();
    private static final HttpServer upstream = startUpstream();

    @LocalServerPort int port;
    @Autowired CircuitBreakerRegistry circuits;
    private WebTestClient client;

    @DynamicPropertySource
    static void upstreamRoute(DynamicPropertyRegistry properties) {
        properties.add("spring.cloud.discovery.client.simple.instances.user-service[0].uri",
                () -> "http://localhost:" + upstream.getAddress().getPort());
    }

    @BeforeEach
    void reset() {
        circuits.circuitBreaker("employeeGatewayCircuit").reset();
        upstreamStatus.set(200);
        upstreamCalls.set(0);
        client = WebTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
    }

    @Test
    void healthyEmployeesPassThrough() {
        client.get().uri("/api/employees").exchange()
                .expectStatus().isOk().expectBody().jsonPath("$.upstream").isEqualTo(true);
    }

    @Test
    void authorizationErrorsPassThroughWithoutFallback() {
        upstreamStatus.set(401);
        client.get().uri("/api/employees/1").exchange()
                .expectStatus().isUnauthorized().expectBody().jsonPath("$.upstream").isEqualTo(true);
    }

    @Test
    void outagesReturnFallbackAndOpenCircuitForAllHttpMethods() {
        upstreamStatus.set(503);
        for (int i = 0; i < 5; i++) {
            client.post().uri("/api/employees").exchange().expectStatus().isEqualTo(503)
                    .expectBody().jsonPath("$.code").isEqualTo("EMPLOYEE_SERVICE_UNAVAILABLE");
        }
        org.junit.jupiter.api.Assertions.assertEquals(5, upstreamCalls.get());
        upstreamStatus.set(200);
        client.get().uri("/api/employees").exchange().expectStatus().isEqualTo(503)
                .expectBody().jsonPath("$.code").isEqualTo("EMPLOYEE_SERVICE_UNAVAILABLE");
        org.junit.jupiter.api.Assertions.assertEquals(5, upstreamCalls.get(),
                "An open circuit must avoid calling the upstream");
    }

    @Test
    void monitoringEndpointsAreAvailable() {
        client.get().uri("/actuator/health").exchange().expectStatus().isOk();
        client.get().uri("/actuator/gateway/routes").exchange().expectStatus().isOk();
        client.get().uri("/actuator/prometheus").exchange().expectStatus().isOk();
    }

    @AfterAll
    static void stopUpstream() {
        upstream.stop(0);
    }

    private static HttpServer startUpstream() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
            server.createContext("/", exchange -> {
                upstreamCalls.incrementAndGet();
                byte[] body = "{\"upstream\":true}".getBytes(StandardCharsets.UTF_8);
                exchange.getRequestBody().readAllBytes();
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(upstreamStatus.get(), body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.start();
            return server;
        } catch (IOException exception) {
            throw new IllegalStateException(exception);
        }
    }
}