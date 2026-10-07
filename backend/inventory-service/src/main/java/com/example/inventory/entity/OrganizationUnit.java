package com.example.inventory.entity;
import jakarta.persistence.*;
@Entity @Table(name="tbl_dyn_organization_units",uniqueConstraints=@UniqueConstraint(columnNames={"kind","code"}))
public class OrganizationUnit extends com.example.audit.AuditedEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Version public Long version;
 @Column(nullable=false) public String kind;
 @Column(nullable=false) public String code;
 @Column(nullable=false) public String name;
 public String address;
 public String status;
 @ManyToOne public OrganizationUnit parent;
}
