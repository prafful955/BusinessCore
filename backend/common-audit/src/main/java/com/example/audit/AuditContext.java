package com.example.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class AuditContext {
    public static final String ACTOR_ATTRIBUTE = "businesscore.audit.actor";
    private final String service;

    public AuditContext(@Value("${spring.application.name:unknown-service}") String service) {
        this.service = service;
    }

    public String service() { return service; }

    public HttpServletRequest request() {
        var attributes = RequestContextHolder.getRequestAttributes();
        return attributes instanceof ServletRequestAttributes servlet ? servlet.getRequest() : null;
    }

    public String actor() {
        var request = request();
        if (request == null) return "system";
        Object actor = request.getAttribute(ACTOR_ATTRIBUTE);
        if (actor != null) return limit(actor.toString(), 255);
        return request.getUserPrincipal() == null ? "anonymous" :
                limit(request.getUserPrincipal().getName(), 255);
    }

    public String clientAddress() {
        var request = request();
        return request == null ? null : limit(request.getRemoteAddr(), 64);
    }

    public String action() {
        var request = request();
        if (request == null) return "SYSTEM";
        return switch (request.getMethod()) {
            case "POST" -> request.getRequestURI().endsWith("/post") ||
                    request.getRequestURI().endsWith("/adjustments") ? "UPDATE" : "CREATE";
            case "PUT", "PATCH" -> "UPDATE";
            case "DELETE" -> "DELETE";
            default -> "VIEW";
        };
    }

    public static String limit(String value, int max) {
        return value == null || value.length() <= max ? value : value.substring(0, max);
    }
}
