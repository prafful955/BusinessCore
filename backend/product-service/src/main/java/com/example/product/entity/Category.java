package com.example.product.entity;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="product_categories")
public class Category {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Version @Column(nullable=false) public Long version;
 @Column(nullable=false,unique=true,length=100) public String name;
 @Column(columnDefinition="TEXT") public String description;
 @Column(nullable=false,length=10) public String status;
 @Column(nullable=false,updatable=false) public Instant createdAt;
 @Column(nullable=false) public Instant updatedAt;
 @PrePersist void create(){createdAt=Instant.now();updatedAt=createdAt;}
 @PreUpdate void update(){updatedAt=Instant.now();}
}
