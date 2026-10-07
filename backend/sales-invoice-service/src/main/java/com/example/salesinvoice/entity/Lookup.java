package com.example.salesinvoice.entity;
import jakarta.persistence.*;
@org.hibernate.annotations.Immutable
@Entity @Table(name="lookup_values",uniqueConstraints=@UniqueConstraint(columnNames= {
    "kind","name"
}
)) public class Lookup  {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(nullable=false) public String kind;
    @Column(nullable=false) public String name;
}
