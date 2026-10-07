package com.example.audit;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditEntityListener.class)
public abstract class AuditedEntity {
    @JsonIgnore @Column(name="created_by", updatable=false, length=255)
    public String createdBy;
    @JsonIgnore @Column(name="last_modified_by", length=255)
    public String lastModifiedBy;
    @JsonIgnore @Column(name="created_service", updatable=false, length=128)
    public String createdService;
    @JsonIgnore @Column(name="last_modified_service", length=128)
    public String lastModifiedService;
    @JsonIgnore @Column(name="audit_created_at", updatable=false)
    public Instant auditCreatedAt;
    @JsonIgnore @Column(name="audit_modified_at")
    public Instant auditModifiedAt;
    @JsonIgnore @Column(name="last_action", length=16)
    public String lastAction;
    @JsonIgnore @Column(name="last_client_address", length=64)
    public String lastClientAddress;
}
