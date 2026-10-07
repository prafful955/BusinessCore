package com.example.inventory.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
@Entity @Table(name="stock_balances",uniqueConstraints=@UniqueConstraint(columnNames={"product_id","warehouse_id"}))
public class StockBalance{
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @Version public Long version;
 @ManyToOne(optional=false) @JoinColumn(name="product_id") public StockProduct product;
 @ManyToOne(optional=false) @JoinColumn(name="warehouse_id") public OrganizationUnit warehouse;
 @Column(nullable=false,precision=19,scale=3) public BigDecimal quantity=BigDecimal.ZERO;
}
