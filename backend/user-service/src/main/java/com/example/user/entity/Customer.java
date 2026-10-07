package com.example.user.entity;
import jakarta.persistence.*;
@Entity @Table(name="customers")
public class Customer {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Column(nullable=false,unique=true) public String code;
 @Column(nullable=false) public String name;
 public String invoiceName;
 public String company;
 @Column(unique=true) public String email;
 public String phone;
 public String streetAddress;
 public String city;
 public String state;
 public String country;
 public String zipCode;
 public String taxNumber;
 @Column(columnDefinition="TEXT") public String notes;
 @ManyToOne(optional=false) @JoinColumn(name="status_id",nullable=false) public Lookup status;
}
