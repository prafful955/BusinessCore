package com.example.audit;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class AuditEntityListener {
    private final AuditContext context;

    public AuditEntityListener(AuditContext context) { this.context = context; }

    @PrePersist
    public void create(AuditedEntity entity) {
        entity.createdBy = context.actor();
        entity.createdService = context.service();
        entity.auditCreatedAt = Instant.now();
        modify(entity, "CREATE");
    }

    @PreUpdate
    public void update(AuditedEntity entity) { modify(entity, "UPDATE"); }

    private void modify(AuditedEntity entity, String action) {
        entity.lastModifiedBy = context.actor();
        entity.lastModifiedService = context.service();
        entity.auditModifiedAt = Instant.now();
        entity.lastAction = action;
        entity.lastClientAddress = context.clientAddress();
    }
}
