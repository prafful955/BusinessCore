package com.example.salesinvoice.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Embeddable
public class DocumentLine {
 @Column(nullable=false) public String description;
 @Column(nullable=false,precision=19,scale=3) public BigDecimal quantity;
 @Column(nullable=false,precision=19,scale=4) public BigDecimal unitPrice;
 @Column(nullable=false,precision=19,scale=2) public BigDecimal lineTotal;
}
