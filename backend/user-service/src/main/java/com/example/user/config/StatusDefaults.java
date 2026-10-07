package com.example.user.config;
import com.example.user.entity.Lookup;
import com.example.user.repository.LookupRepository;
import org.springframework.stereotype.Component;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Component
public class StatusDefaults implements ApplicationRunner {
 private final LookupRepository lookups;
 public StatusDefaults(LookupRepository l){lookups=l;}
 @Override @Transactional public void run(ApplicationArguments args){
  Map<String,List<String>> defaults=Map.of("order-status",List.of("Draft","Confirmed","Cancelled","Completed"),"customer-status",List.of("Active","Inactive"),
   "quotation-status",List.of("Draft","Sent","Accepted","Rejected","Expired"),
   "invoice-status",List.of("Draft","Sent","Partially paid","Paid","Overdue","Cancelled"),
   "sales-invoice-status",List.of("Draft","Sent","Partially paid","Paid","Overdue","Cancelled"));
  defaults.forEach((kind,names)->{
   if(!lookups.findByKindOrderByNameAsc(kind).isEmpty())return;
   for(String name:names){Lookup value=new Lookup();value.kind=kind;value.name=name;lookups.save(value);}
  });
 }
}
