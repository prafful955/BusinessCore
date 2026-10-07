package com.example.user.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
@Entity @Table(name="business_documents",uniqueConstraints=@UniqueConstraint(columnNames={"kind","number"}))
public class BusinessDocument {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false) public String kind;
 @Column(nullable=false) public String number;
 @ManyToOne(optional=false) @JoinColumn(name="customer_id",nullable=false) public Customer customer;
 public String customerName;
 public String invoiceName;
 @Column(columnDefinition="TEXT") public String billingAddress;
 @ManyToOne(optional=false) @JoinColumn(name="status_id",nullable=false) public Lookup status;
 @Column(nullable=false) public LocalDate documentDate;
 public LocalDate dueDate;
 @Column(columnDefinition="TEXT") public String notes;
 @ElementCollection @CollectionTable(name="business_document_lines",joinColumns=@JoinColumn(name="document_id"))
 @OrderColumn(name="line_index") public List<DocumentLine> lines=new ArrayList<>();
 @Column(precision=19,scale=2) public BigDecimal subtotal;
 @Column(precision=9,scale=4) public BigDecimal taxPercent;
 @Column(precision=19,scale=2) public BigDecimal taxAmount;
 @Column(precision=19,scale=2) public BigDecimal total;
 public String currency;
 public Instant createdAt;
}
