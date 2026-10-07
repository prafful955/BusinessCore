package com.example.user.service;
import com.example.user.entity.Lookup;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional
public class LookupValueService {
 public static final Set<String> KINDS=Set.of("order-status","customer-status","quotation-status","invoice-status","sales-invoice-status",
  "departments","locations","cash-registers","email-accounts","warehouses","work-shifts","holiday-schedules");
 public record Request(String kind,String name) {}
 public record Response(Long id,String kind,String name){
  public static Response from(Lookup l){return new Response(l.id,l.kind,l.name);}
 }
 private final LookupRepository lookups;
 private final CustomerRepository customers;
 private final BusinessDocumentRepository documents;
 public LookupValueService(LookupRepository l,CustomerRepository c,BusinessDocumentRepository d){lookups=l;customers=c;documents=d;}
 public List<Response> all(String kind){
  if(!KINDS.contains(kind))throw new ApiException(400,"Unknown lookup kind");
  return lookups.findByKindOrderByNameAsc(kind).stream().map(Response::from).toList();
 }
 public Lookup get(Long id){return lookups.findById(id).orElseThrow(()->new ApiException(404,"Lookup value not found"));}
 private boolean used(Long id){return customers.existsByStatusId(id)||documents.existsByStatusId(id);}
 public Response save(Long id,Request r){
  if(r.kind()==null||!KINDS.contains(r.kind()))throw new ApiException(400,"Unknown lookup kind");
  if(r.name()==null||r.name().isBlank()||r.name().trim().length()>100)throw new ApiException(400,"Lookup name must contain 1 to 100 characters");
  Lookup value=id==null?new Lookup():get(id);
  if(id!=null&&!r.kind().equals(value.kind)&&used(id))throw new ApiException(409,"Cannot change the scope of an assigned status");
  String name=r.name().trim();
  for(Lookup other:lookups.findByKindOrderByNameAsc(r.kind()))
   if(!Objects.equals(other.id,id)&&name.equalsIgnoreCase(other.name))throw new ApiException(409,"Lookup value already exists");
  value.kind=r.kind();value.name=name;return Response.from(lookups.saveAndFlush(value));
 }
 public void delete(Long id){
  Lookup value=get(id);
  if(used(id))throw new ApiException(409,"Status is assigned to customers or documents");
  lookups.delete(value);lookups.flush();
 }
}
