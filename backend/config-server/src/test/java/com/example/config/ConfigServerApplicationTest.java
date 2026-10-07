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

    @Test
    void suppliesSharedDatabaseSettingsForEveryDatabaseService() throws Exception {
        for (String service : List.of("user-service", "product-service", "order-service",
                "inventory-service", "sales-invoice-service")) {
            Map<String, Object> properties = propertiesFor(service + ",database");
            assertEquals("${DB_URL:jdbc:mysql://localhost:3306/appdb?createDatabaseIfNotExist=true}",
                    properties.get("spring.datasource.url"));
            assertEquals("${DB_USERNAME:root}", properties.get("spring.datasource.username"));
            assertEquals("${DB_PASSWORD:root}", properties.get("spring.datasource.password"));
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