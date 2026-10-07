package com.example.user.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.Instant;
/** Read-only projection of the existing shared order table. */
@Entity @Immutable @Table(name="orders")
public class DashboardOrder  {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    public Long userId;
    public Long productId;
    public Integer quantity;
    public BigDecimal total;
    @Column(name="created_at") public Instant createdAt;
    public String category;
}
