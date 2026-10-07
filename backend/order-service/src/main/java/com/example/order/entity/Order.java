package com.example.order.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="tbl_dyn_orders") public class Order extends com.example.audit.AuditedEntity {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private Long userId;
    private Long productId;
    private Integer quantity;
    private BigDecimal total;
    @Column(name="created_at",updatable=false) private java.time.Instant createdAt;
    private String category;
    @PrePersist void timestamp() {
        createdAt=java.time.Instant.now();
    }
    public java.time.Instant getCreatedAt() {
        return createdAt;
    }
    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        if(category!=null&&!java.util.Set.of("Bedding","Appliances","Electronics").contains(category))throw new IllegalArgumentException("Invalid order category");
        this.category=category;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id=id;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long v) {
        userId=v;
    }
    public Long getProductId() {
        return productId;
    }
    public void setProductId(Long v) {
        productId=v;
    }
    public Integer getQuantity() {
        return quantity;
    }
    public void setQuantity(Integer v) {
        quantity=v;
    }
    public BigDecimal getTotal() {
        return total;
    }
    public void setTotal(BigDecimal v) {
        total=v;
    }
}
