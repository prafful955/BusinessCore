package com.example.inventory.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
@Entity @Table(name="tbl_dyn_stock_movements")
public class StockMovement{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(optional=false) public StockBalance balance;
 @Column(nullable=false,precision=19,scale=3) public BigDecimal quantity;
 public String reason;
 public String source;
 public Long sourceId;
 public Instant occurredAt;
}
