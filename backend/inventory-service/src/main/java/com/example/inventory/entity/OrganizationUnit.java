package com.example.inventory.entity;
import jakarta.persistence.*;
@Entity @Table(name="organization_units",uniqueConstraints=@UniqueConstraint(columnNames={"kind","code"}))
public class OrganizationUnit {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Version public Long version;
 @Column(nullable=false) public String kind;
 @Column(nullable=false) public String code;
 @Column(nullable=false) public String name;
 public String address;
 public String status;
 @ManyToOne public OrganizationUnit parent;
}
