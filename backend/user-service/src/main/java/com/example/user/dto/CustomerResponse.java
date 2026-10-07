package com.example.user.dto;
import com.example.user.entity.Customer;
public record CustomerResponse(Long id,String code,String name,String invoiceName,String company,String email,String phone,
 String streetAddress,String city,String state,String country,String zipCode,String taxNumber,String notes,Long statusId,String status) {
 public static CustomerResponse from(Customer c){
  return new CustomerResponse(c.id,c.code,c.name,c.invoiceName,c.company,c.email,c.phone,c.streetAddress,
   c.city,c.state,c.country,c.zipCode,c.taxNumber,c.notes,c.status.id,c.status.name);
 }
}
