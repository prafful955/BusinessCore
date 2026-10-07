package com.example.inventory.dto;
import com.example.inventory.entity.OrganizationUnit;
public record OrganizationResponse(Long id,String kind,String code,String name,String address,String status,Long parentId,String parentName,Long version){
 public static OrganizationResponse from(OrganizationUnit o){return new OrganizationResponse(o.id,o.kind,o.code,o.name,o.address,o.status,o.parent==null?null:o.parent.id,o.parent==null?"":o.parent.name,o.version);}
}
