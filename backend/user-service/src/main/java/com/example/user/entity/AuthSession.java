package com.example.user.entity;
import jakarta.persistence.*;
@Entity @Table(name="tbl_dyn_auth_sessions") public class AuthSession extends com.example.audit.AuditedEntity {
    @Id public String tokenHash;
    public Long employeeId;
    public long credentialVersion;
    public java.time.Instant expiresAt;
}
