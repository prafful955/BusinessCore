package com.example.audit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Identity enrichment for auditing; authorization remains the responsibility of each service. */
@Component
public class AuditIdentityInterceptor implements WebMvcConfigurer {
    private static final Logger LOG = LoggerFactory.getLogger(AuditIdentityInterceptor.class);
    private final boolean enabled;
    private final RestClient client;

    public AuditIdentityInterceptor(
            @Value("${app.audit.resolve-bearer:true}") boolean enabled,
            @Value("${app.audit.user-service-url:${app.auth.user-service-url:http://localhost:8081}}") String url) {
        this.enabled = enabled;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(3000);
        client = RestClient.builder().baseUrl(url).requestFactory(factory).build();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                if (!enabled || request.getAttribute(AuditContext.ACTOR_ATTRIBUTE) != null ||
                        request.getUserPrincipal() != null) return true;
                String authorization = request.getHeader("Authorization");
                if (authorization == null || !authorization.startsWith("Bearer ")) return true;
                try {
                    Map<?, ?> user = client.get().uri("/api/auth/me").header("Authorization", authorization)
                            .retrieve().body(Map.class);
                    if (user != null && user.get("id") instanceof Number id && id.longValue() > 0) {
                        request.setAttribute(AuditContext.ACTOR_ATTRIBUTE, "employee:" + id.longValue());
                    }
                } catch (RuntimeException failure) {
                    // Never attribute an invalid/unverified session to a user.
                    LOG.warn("Audit identity could not be verified failureType={}", failure.getClass().getSimpleName());
                }
                return true;
            }
        }).addPathPatterns("/api/**").excludePathPatterns("/api/auth/**")
                .order(org.springframework.core.Ordered.LOWEST_PRECEDENCE);
    }
}
