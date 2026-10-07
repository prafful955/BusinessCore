package com.example.inventory.dto;
public record OrganizationRequest(String code,String name,String address,String status,Long parentId,Long version) {}
