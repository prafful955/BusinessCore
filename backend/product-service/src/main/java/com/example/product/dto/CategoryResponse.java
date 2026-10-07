package com.example.product.dto;
import com.example.product.entity.Category;
import java.time.Instant;
public record CategoryResponse(Long id,String name,String description,String status,Long version,Instant createdAt,Instant updatedAt){
 public static CategoryResponse from(Category c){
  return new CategoryResponse(c.id,c.name,c.description,c.status,c.version,c.createdAt,c.updatedAt);
 }
}
