package com.example.user.service;
import com.example.user.entity.Lookup;
import com.example.user.repository.LookupRepository;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class StatusService {
 public static final Map<String,String> KINDS=Map.of("sales-orders","order-status","customers","customer-status","quotations","quotation-status",
  "invoices","invoice-status","sales-invoices","sales-invoice-status");
 private final LookupRepository lookups;
 public StatusService(LookupRepository l){lookups=l;}
 public String kind(String scope){
  String kind=KINDS.get(scope);
  if(kind==null)throw new ApiException(400,"Unknown status scope");
  return kind;
 }
 public Lookup resolve(String scope,Long id){
  if(id==null)throw new ApiException(400,"Status is required");
  Lookup l=lookups.findById(id).orElseThrow(()->new ApiException(400,"Status does not exist"));
  if(!kind(scope).equals(l.kind))throw new ApiException(400,"Status belongs to another module");
  return l;
 }
 public List<Lookup> all(String scope){return lookups.findByKindOrderByNameAsc(kind(scope));}
}
