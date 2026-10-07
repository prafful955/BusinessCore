package com.example.audittest;

import com.example.audit.*;
import jakarta.persistence.*;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes=AuditIntegrationTest.TestApplication.class, properties={
    "spring.datasource.url=jdbc:h2:mem:audit;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.application.name=audit-test-service",
    "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
class AuditIntegrationTest {
    @SpringBootConfiguration @EnableAutoConfiguration
    @ComponentScan(basePackages={"com.example.audit","com.example.audittest"})
    @EntityScan(basePackageClasses={AuditEvent.class, Record.class})
    @EnableJpaRepositories(basePackageClasses=AuditEventRepository.class)
    static class TestApplication {}

    @Entity(name="AuditTestRecord") @Table(name="tbl_dyn_test_records")
    public static class Record extends AuditedEntity {
        @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
        public String name;
    }

    @RestController
    public static class RecordsController {
        @PersistenceContext EntityManager entityManager;

        @PostMapping("/api/records") @Transactional
        public Map<String, Long> create(@RequestBody Map<String, String> input) {
            Record record = new Record();
            record.name = input.get("name");
            entityManager.persist(record);
            entityManager.flush();
            return Map.of("id", record.id);
        }

        @PutMapping("/api/records/{id}") @Transactional
        public Map<String, Long> update(@PathVariable Long id) {
            Record record = entityManager.find(Record.class, id);
            record.name = "updated";
            entityManager.flush();
            return Map.of("id", id);
        }

        @DeleteMapping("/api/records/{id}") @Transactional
        public void delete(@PathVariable Long id) {
            entityManager.remove(entityManager.find(Record.class, id));
            entityManager.flush();
        }

        @PostMapping("/api/records/fail") @Transactional
        public void fail() {
            Record record = new Record();
            record.name = "must roll back";
            entityManager.persist(record);
            throw new IllegalStateException("test rollback");
        }
    }

    @RestControllerAdvice
    public static class ErrorHandler {
        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<Void> failed() { return ResponseEntity.internalServerError().build(); }
    }

    private static final com.sun.net.httpserver.HttpServer identityServer = startIdentityServer();

    @org.springframework.test.context.DynamicPropertySource
    static void identityEndpoint(org.springframework.test.context.DynamicPropertyRegistry properties) {
        properties.add("app.audit.user-service-url",
                () -> "http://localhost:" + identityServer.getAddress().getPort());
    }

    @org.junit.jupiter.api.AfterAll
    static void stopIdentityServer() { identityServer.stop(0); }

    private static com.sun.net.httpserver.HttpServer startIdentityServer() {
        try {
            var server = com.sun.net.httpserver.HttpServer.create(new java.net.InetSocketAddress("localhost", 0), 0);
            server.createContext("/api/auth/me", exchange -> {
                boolean valid = "Bearer valid-session".equals(exchange.getRequestHeaders().getFirst("Authorization"));
                byte[] body = (valid ? "{\"id\":42}" : "{}").getBytes(java.nio.charset.StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(valid ? 200 : 401, body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.start();
            return server;
        } catch (java.io.IOException failure) {
            throw new IllegalStateException(failure);
        }
    }

    @Autowired MockMvc mvc;
    @Autowired AuditEventRepository events;
    @Autowired PlatformTransactionManager transactions;
    @PersistenceContext EntityManager entityManager;

    @BeforeEach
    void clean() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            entityManager.createQuery("delete from AuditEvent").executeUpdate();
            entityManager.createQuery("delete from AuditTestRecord").executeUpdate();
        });
    }

    private long create(String actor) throws Exception {
        var result = mvc.perform(post("/api/records").requestAttr(AuditContext.ACTOR_ATTRIBUTE, actor)
                .contentType("application/json").content("{\"name\":\"test\"}"))
                .andExpect(status().isOk()).andReturn();
        return new com.fasterxml.jackson.databind.ObjectMapper()
                .readTree(result.getResponse().getContentAsString()).get("id").asLong();
    }

    private Record find(long id) {
        return new TransactionTemplate(transactions).execute(status -> entityManager.find(Record.class, id));
    }

    @Test
    void recordsCreatorAndModifierWithoutChangingOriginalCreator() throws Exception {
        long id = create("employee:10");
        Record created = find(id);
        assertEquals("employee:10", created.createdBy);
        assertEquals("audit-test-service", created.createdService);
        assertEquals("CREATE", created.lastAction);
        assertNotNull(created.auditCreatedAt);

        mvc.perform(put("/api/records/" + id).requestAttr(AuditContext.ACTOR_ATTRIBUTE, "employee:20"))
                .andExpect(status().isOk());
        Record updated = find(id);
        assertEquals("employee:10", updated.createdBy);
        assertEquals(created.auditCreatedAt, updated.auditCreatedAt);
        assertEquals("employee:20", updated.lastModifiedBy);
        assertEquals("UPDATE", updated.lastAction);
        assertFalse(updated.auditModifiedAt.isBefore(updated.auditCreatedAt));
        assertEquals(2, events.count());
        assertTrue(events.findAll().stream().allMatch(event -> Long.toString(id).equals(event.recordId)));
    }

    @Test
    void retainsDeleteHistoryAfterDeletingTheRecord() throws Exception {
        long id = create("employee:10");
        mvc.perform(delete("/api/records/" + id).requestAttr(AuditContext.ACTOR_ATTRIBUTE, "employee:30"))
                .andExpect(status().isOk());
        assertNull(find(id));
        AuditEvent deletion = events.findAll().stream().filter(event -> event.action.equals("DELETE"))
                .findFirst().orElseThrow();
        assertEquals("employee:30", deletion.actor);
        assertEquals("SUCCESS", deletion.outcome);
        assertEquals("/api/records/" + id, deletion.resourcePath);
        assertNotNull(deletion.clientAddress);
    }

    @Test
    void failuresRollBackBusinessDataButKeepFailureHistory() throws Exception {
        mvc.perform(post("/api/records/fail").requestAttr(AuditContext.ACTOR_ATTRIBUTE, "employee:10"))
                .andExpect(status().isInternalServerError());
        long count = new TransactionTemplate(transactions).execute(status ->
                entityManager.createQuery("select count(r) from AuditTestRecord r", Long.class)
                        .getSingleResult());
        assertEquals(0, count);
        AuditEvent failure = events.findAll().getFirst();
        assertEquals("FAILURE", failure.outcome);
        assertEquals("IllegalStateException", failure.failureType);
    }

    @Test
    void identityHeadersCannotImpersonateAnAuthenticatedUser() throws Exception {
        mvc.perform(post("/api/records").header("X-User-Id", "employee:admin")
                .contentType("application/json").content("{\"name\":\"test\"}"))
                .andExpect(status().isOk());
        assertEquals("anonymous", events.findAll().getFirst().actor);
    }
    @Test
    void bearerIdentityIsVerifiedWithUserService() throws Exception {
        mvc.perform(post("/api/records").header("Authorization", "Bearer valid-session")
                .contentType("application/json").content("{\"name\":\"test\"}"))
                .andExpect(status().isOk());
        AuditEvent event = events.findAll().getFirst();
        assertEquals("employee:42", event.actor);
        assertEquals("employee:42", find(Long.parseLong(event.recordId)).createdBy);
    }

    @Test
    void invalidBearerCannotClaimAnIdentity() throws Exception {
        mvc.perform(post("/api/records").header("Authorization", "Bearer invalid-session")
                .header("X-User-Id", "employee:42")
                .contentType("application/json").content("{\"name\":\"test\"}"))
                .andExpect(status().isOk());
        assertEquals("anonymous", events.findAll().getFirst().actor);
    }
}
