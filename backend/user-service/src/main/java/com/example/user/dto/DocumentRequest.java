package com.example.user.dto;
import java.math.BigDecimal;
import java.util.List;
public record DocumentRequest(String number,Long customerId,Long statusId,String documentDate,String dueDate,
 String notes,BigDecimal taxPercent,List<LineInput> lines) {
 public record LineInput(String description,BigDecimal quantity,BigDecimal unitPrice) {}
}
