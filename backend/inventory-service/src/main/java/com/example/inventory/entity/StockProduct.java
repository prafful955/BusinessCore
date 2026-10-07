package com.example.inventory.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;
@Entity @Immutable @Table(name="tbl_dyn_products")
public class StockProduct{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 public String name;
 public java.math.BigDecimal price;
}
