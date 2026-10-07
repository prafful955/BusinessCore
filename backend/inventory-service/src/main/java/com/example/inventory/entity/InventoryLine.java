package com.example.inventory.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Embeddable
public class InventoryLine{
 @ManyToOne(optional=false) public StockProduct product;
 @Column(precision=19,scale=3) public BigDecimal quantity;
 @Column(precision=19,scale=4) public BigDecimal unitCost;
}
