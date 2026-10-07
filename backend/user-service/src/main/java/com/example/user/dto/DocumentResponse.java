package com.example.user.dto;
import com.example.user.entity.BusinessDocument;
import java.math.BigDecimal;
import java.util.List;
import java.time.Instant;
public record DocumentResponse(Long id,String kind,String number,Long customerId,String customerName,String invoiceName,String billingAddress,
 Long statusId,String status,String documentDate,String dueDate,String notes,BigDecimal taxPercent,
 List<LineResponse> lines,BigDecimal subtotal,BigDecimal taxAmount,BigDecimal total,String currency,Instant createdAt) {
 public record LineResponse(String description,BigDecimal quantity,BigDecimal unitPrice,BigDecimal lineTotal) {}
 public static DocumentResponse from(BusinessDocument d){
  return new DocumentResponse(d.id,d.kind,d.number,d.customer.id,d.customerName,d.invoiceName,d.billingAddress,d.status.id,
   d.status.name,d.documentDate.toString(),d.dueDate==null?"":d.dueDate.toString(),d.notes,d.taxPercent,
   d.lines.stream().map(l->new LineResponse(l.description,l.quantity,l.unitPrice,l.lineTotal)).toList(),
   d.subtotal,d.taxAmount,d.total,d.currency,d.createdAt);
 }
}
