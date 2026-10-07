package com.example.inventory.service;
import com.example.inventory.entity.OrganizationUnit;
import com.example.inventory.repository.OrganizationRepository;
import com.example.inventory.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional
public class OrganizationService{
 private final OrganizationRepository repo;
 public OrganizationService(OrganizationRepository r){repo=r;}
 public OrganizationUnit get(String kind,Long id){return repo.findById(id).filter(o->kind.equals(o.kind)).orElseThrow(()->new ApiException(404,"Organization record not found"));}
 public List<OrganizationResponse> all(String kind){return repo.findByKindOrderByNameAsc(kind).stream().map(OrganizationResponse::from).toList();}
 public OrganizationResponse one(String kind,Long id){return OrganizationResponse.from(get(kind,id));}
 public OrganizationResponse save(String kind,Long id,OrganizationRequest r){
  OrganizationUnit o=id==null?new OrganizationUnit():get(kind,id);
  if(id!=null&&(r.version()==null||!r.version().equals(o.version)))throw new ApiException(409,"Record changed; reload before saving");
  if(r.code()==null||r.code().isBlank()||r.name()==null||r.name().isBlank()||r.code().length()>100||r.name().length()>255)throw new ApiException(400,"Code and name are required");
  if(!Set.of("Active","Inactive").contains(r.status()==null?"":r.status()))throw new ApiException(400,"Invalid status");
  for(var other:repo.findByKindOrderByNameAsc(kind))if(!Objects.equals(other.id,id)&&other.code.equalsIgnoreCase(r.code().trim()))throw new ApiException(409,"Code already exists");
  OrganizationUnit parent=null;
  if(!kind.equals("companies")){
   if(r.parentId()==null)throw new ApiException(400,"Parent organization is required");
   parent=get(kind.equals("warehouses")?"business-locations":"companies",r.parentId());
   if(id!=null&&o.parent!=null&&!Objects.equals(o.parent.id,parent.id))throw new ApiException(409,"Parent cannot be changed after creation");
  }
  o.kind=kind;o.code=r.code().trim();o.name=r.name().trim();o.address=r.address()==null?"":r.address();o.status=r.status();o.parent=parent;
  if(o.address.length()>255)throw new ApiException(400,"Address must be at most 255 characters");
  return OrganizationResponse.from(repo.saveAndFlush(o));
 }
 public void delete(String kind,Long id,Long version){
  var o=get(kind,id);if(version==null||!version.equals(o.version))throw new ApiException(409,"Record changed; reload before deleting");
  if(repo.existsByParentId(id))throw new ApiException(409,"Organization has child records");repo.delete(o);repo.flush();
 }
}
