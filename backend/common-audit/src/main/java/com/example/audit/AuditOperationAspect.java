package com.example.audit;

import java.time.Instant;
import java.util.concurrent.TimeUnit;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 100)
public class AuditOperationAspect {
    private static final Logger LOG = LoggerFactory.getLogger(AuditOperationAspect.class);
    private final AuditContext context;
    private final AuditEventWriter writer;

    public AuditOperationAspect(AuditContext context, AuditEventWriter writer) {
        this.context = context;
        this.writer = writer;
    }

    @Around("@within(org.springframework.web.bind.annotation.RestController) && execution(public * *(..)) && !within(com.example.audit..*)")
    public Object audit(ProceedingJoinPoint call) throws Throwable {
        var request = context.request();
        if (request == null || !request.getRequestURI().startsWith("/api/") ||
                request.getRequestURI().startsWith("/api/auth/")) return call.proceed();
        long start = System.nanoTime();
        Throwable failure = null;
        Object result = null;
        try {
            result = call.proceed();
            return result;
        } catch (Throwable exception) {
            failure = exception;
            throw exception;
        } finally {
            AuditEvent event = new AuditEvent();
            event.occurredAt = Instant.now();
            event.actor = context.actor();
            event.serviceName = AuditContext.limit(context.service(), 128);
            event.action = context.action();
            event.httpMethod = AuditContext.limit(request.getMethod(), 16);
            event.resourcePath = AuditContext.limit(request.getRequestURI(), 2048);
            event.clientAddress = context.clientAddress();
            event.recordId = recordId(result, request.getRequestURI());
            event.controllerMethod = AuditContext.limit(call.getSignature().toShortString(), 512);
            boolean responseFailed = result instanceof ResponseEntity<?> response &&
                    response.getStatusCode().isError();
            event.outcome = failure == null && !responseFailed ? "SUCCESS" : "FAILURE";
            event.failureType = failure == null ? null :
                    AuditContext.limit(failure.getClass().getSimpleName(), 255);
            event.durationMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - start);
            try {
                writer.write(event);
            } catch (RuntimeException auditFailure) {
                // Preserve the original response: controller/service transactions may have committed already.
                LOG.error("Audit persistence failed service={} action={} failureType={}",
                        event.serviceName, event.action, auditFailure.getClass().getSimpleName());
            }
        }
    }
    private String recordId(Object result, String path) {
        Object body = result instanceof ResponseEntity<?> response ? response.getBody() : result;
        Object id = null;
        if (body instanceof java.util.Map<?, ?> map) id = map.get("id");
        else if (body != null && !(body instanceof java.util.Collection<?>)) {
            for (String accessor : java.util.List.of("id", "getId")) {
                try {
                    id = body.getClass().getMethod(accessor).invoke(body);
                    break;
                } catch (ReflectiveOperationException ignored) { }
            }
            if (id == null) {
                try { id = body.getClass().getField("id").get(body); }
                catch (ReflectiveOperationException ignored) { }
            }
        }
        if (id instanceof Number || id instanceof String) return AuditContext.limit(id.toString(), 255);
        for (String segment : path.split("/")) {
            if (segment.matches("[0-9]+")) return AuditContext.limit(segment, 255);
        }
        return null;
    }
}
