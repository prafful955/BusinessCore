package com.example.inventory.dto;
import com.example.inventory.entity.InventoryDocument;
import java.util.List;
import java.math.BigDecimal;
public record InventoryResponse(Long id,String kind,String number,String supplierName,String documentDate,String notes,
 Long warehouseId,String warehouseName,Long destinationId,String destinationName,Long purchaseOrderId,
 String status,Long version,BigDecimal total,String currency,List<Line> lines){
 public record Line(Long productId,String productName,BigDecimal quantity,BigDecimal unitCost,BigDecimal lineTotal){}
 public static InventoryResponse from(InventoryDocument d){
  return new InventoryResponse(d.id,d.kind,d.number,d.supplierName,d.documentDate.toString(),d.notes,d.warehouse.id,
   d.warehouse.name,d.destination==null?null:d.destination.id,d.destination==null?"":d.destination.name,
   d.purchaseOrder==null?null:d.purchaseOrder.id,d.status,d.version,d.total,d.currency==null?"USD":d.currency,
   d.lines.stream().map(l->new Line(l.product.id,l.product.name,l.quantity,l.unitCost,l.quantity.multiply(l.unitCost).setScale(2,java.math.RoundingMode.HALF_UP))).toList());
 }
}
