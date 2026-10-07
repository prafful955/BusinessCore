package com.example.audit;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="tbl_dyn_audit_events", indexes={
    @Index(name="idx_audit_service_time", columnList="service_name,occurred_at"),
    @Index(name="idx_audit_actor_time", columnList="actor,occurred_at")
})
public class AuditEvent {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(name="occurred_at", nullable=false) public Instant occurredAt;
    @Column(nullable=false, length=255) public String actor;
    @Column(name="service_name", nullable=false, length=128) public String serviceName;
    @Column(nullable=false, length=16) public String action;
    @Column(name="http_method", length=16) public String httpMethod;
    @Column(name="resource_path", length=2048) public String resourcePath;
    @Column(name="record_id", length=255) public String recordId;
    @Column(name="client_address", length=64) public String clientAddress;
    @Column(name="controller_method", length=512) public String controllerMethod;
    @Column(nullable=false, length=16) public String outcome;
    @Column(name="failure_type", length=255) public String failureType;
    @Column(name="duration_ms") public long durationMs;
}
