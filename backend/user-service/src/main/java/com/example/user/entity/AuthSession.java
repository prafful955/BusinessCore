package com.example.user.entity;
import jakarta.persistence.*;
@Entity @Table(name="auth_sessions") public class AuthSession  {
    @Id public String tokenHash;
    public Long employeeId;
    public long credentialVersion;
    public java.time.Instant expiresAt;
}
