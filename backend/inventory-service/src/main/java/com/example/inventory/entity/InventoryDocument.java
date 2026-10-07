package com.example.inventory.entity;
import jakarta.persistence.*;
import java.util.*;
import java.time.LocalDate;
import java.math.BigDecimal;
@Entity @Table(name="inventory_documents",uniqueConstraints=@UniqueConstraint(columnNames={"kind","number"}))
public class InventoryDocument{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Version public Long version;
 public String kind;
 public String number;
 public String supplierName;
 public String status="Draft";
 public LocalDate documentDate;
 public String notes;
 public String currency;
 @ManyToOne(optional=false) public OrganizationUnit warehouse;
 @ManyToOne public OrganizationUnit destination;
 @ManyToOne public InventoryDocument purchaseOrder;
 @ElementCollection @CollectionTable(name="inventory_document_lines",joinColumns=@JoinColumn(name="document_id"))
 @OrderColumn(name="line_index") public List<InventoryLine> lines=new ArrayList<>();
 @Column(precision=19,scale=2) public BigDecimal total;
}
