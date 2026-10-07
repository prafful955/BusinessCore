package com.example.user.dto;
public record CustomerRequest(String code,String name,String invoiceName,String company,String email,String phone,
 String streetAddress,String city,String state,String country,String zipCode,String taxNumber,String notes,Long statusId) {}
