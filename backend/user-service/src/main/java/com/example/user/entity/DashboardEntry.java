package com.example.user.entity;
import jakarta.persistence.*;
@Entity @Table(name="tbl_dyn_dashboard_entries") public class DashboardEntry extends com.example.audit.AuditedEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false) public String category;
    @Column(nullable=false) public String metricKey;
    @Column(nullable=false) public String label;
    @Column(nullable=false,precision=19,scale=4) public java.math.BigDecimal amount;
    @Column(nullable=false) public java.time.Instant occurredAt;
}
