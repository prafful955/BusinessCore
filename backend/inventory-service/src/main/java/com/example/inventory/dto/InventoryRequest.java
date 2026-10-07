package com.example.inventory.dto;
import java.util.List;
import java.math.BigDecimal;
public record InventoryRequest(String number,String supplierName,String documentDate,String notes,Long warehouseId,
 Long destinationId,Long purchaseOrderId,Long version,List<Line> lines){
 public record Line(Long productId,BigDecimal quantity,BigDecimal unitCost){}
}
