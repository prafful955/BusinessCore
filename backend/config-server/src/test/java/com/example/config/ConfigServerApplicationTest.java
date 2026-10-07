package com.example.config;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "eureka.client.enabled=false")
@AutoConfigureMockMvc
class ConfigServerApplicationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;

    @org.springframework.test.context.DynamicPropertySource
    static void localGitRepository(org.springframework.test.context.DynamicPropertyRegistry properties) {
        java.nio.file.Path repository = java.nio.file.Path.of("").toAbsolutePath();
        while (repository != null && !java.nio.file.Files.exists(repository.resolve(".git"))) {
            repository = repository.getParent();
        }
        if (repository == null) throw new IllegalStateException("Run tests from the Git checkout");
        String uri;
        try {
            java.nio.file.Path isolated = java.nio.file.Files.createTempDirectory("businesscore-config-git-");
            try (var git = org.eclipse.jgit.api.Git.cloneRepository()
                    .setURI(repository.toUri().toString())
                    .setDirectory(isolated.toFile()).call()) {
                uri = isolated.toUri().toString();
            }
        } catch (Exception exception) {
            throw new IllegalStateException("Cannot create isolated config Git repository", exception);
        }
        properties.add("spring.cloud.config.server.git.uri", () -> uri);
    }

    @Test
    void suppliesServiceSpecificDatabaseSettingsFromGit() throws Exception {
        for (String service : List.of("user-service", "product-service", "order-service",
                "inventory-service", "sales-invoice-service")) {
            Map<String, Object> properties = propertiesFor(service);
            assertEquals("${DB_URL:jdbc:mysql://localhost:3306/" + service.replace('-', '_') + "_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}",
                    properties.get("spring.datasource.url"));
            assertEquals("${DB_USERNAME:root}", properties.get("spring.datasource.username"));
            assertEquals("${DB_PASSWORD}", properties.get("spring.datasource.password"));
            assertEquals("${EUREKA_SERVER_URL:http://localhost:8761/eureka/}",
                    properties.get("eureka.client.service-url.defaultZone"));
            assertFalse(properties.containsKey("spring.jpa.hibernate.ddl-auto"),
                    "Schema ownership settings must remain service-specific");
        }
    }

    @Test
    void gatewayReceivesDiscoverySettingsWithoutDatabaseCredentials() throws Exception {
        Map<String, Object> properties = propertiesFor("api-gateway");
        assertEquals(true, properties.get("eureka.client.register-with-eureka"));
        assertFalse(properties.containsKey("spring.datasource.url"));
        assertFalse(properties.containsKey("spring.datasource.password"));
        assertFalse(properties.containsKey("server.port"));
    }

    private Map<String, Object> propertiesFor(String application) throws Exception {
        var result = mvc.perform(get("/" + application + "/default"))
                .andExpect(status().isOk()).andReturn();
        var environment = mapper.readTree(result.getResponse().getContentAsString());
        Map<String, Object> properties = new java.util.HashMap<>();
        for (var source : environment.get("propertySources")) {
            Map<String, Object> values = mapper.convertValue(source.get("source"),
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
            values.forEach(properties::putIfAbsent);
        }
        return properties;
    }
}