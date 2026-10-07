package com.example.user;
import com.example.user.dto.*;
import com.example.user.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @Transactional
class BusinessApiIntegrationTest {
 @Autowired CustomerService customers;
 @Autowired DocumentService documents;
 @Autowired StatusService statuses;
 @Autowired LookupValueService lookups;
 private long status(String scope,String name){return statuses.all(scope).stream().filter(s->s.name.equals(name)).findFirst().orElseThrow().id;}
 private CustomerRequest customer(String name,String invoiceName){
  return new CustomerRequest("C001",name,invoiceName,"Company","customer@example.com","+91 9000000000",
   "Street","Mumbai","Maharashtra","India","400001","TAX123","Notes",status("customers","Active"));
 }
 @Test void totalsSnapshotsAndConflicts(){
  var c=customers.save(null,customer("Customer","Invoice customer"));
  var input=new DocumentRequest("INV001",c.id(),status("invoices","Draft"),"2026-10-07","2026-10-20",
   "Notes",new BigDecimal("5"),List.of(new DocumentRequest.LineInput("Item",new BigDecimal("2.5"),new BigDecimal("10.12"))));
  var d=documents.save("invoices",null,input);
  assertEquals(0,new BigDecimal("25.30").compareTo(d.subtotal()));
  assertEquals(0,new BigDecimal("1.27").compareTo(d.taxAmount()));
  assertEquals(0,new BigDecimal("26.57").compareTo(d.total()));
  customers.save(c.id(),customer("Renamed customer","Renamed invoice customer"));
  assertEquals("Invoice customer",documents.one("invoices",d.id()).invoiceName());
  assertEquals(409,assertThrows(ApiException.class,()->customers.delete(c.id())).status);
  assertEquals(409,assertThrows(ApiException.class,()->lookups.delete(d.statusId())).status);
 }
 @Test void scopeValidationAndRename(){
  var c=customers.save(null,customer("Customer",""));
  var invalid=new DocumentRequest("Q001",c.id(),status("customers","Active"),"2026-10-07","",
   "",BigDecimal.ZERO,List.of(new DocumentRequest.LineInput("Item",BigDecimal.ONE,BigDecimal.TEN)));
  assertEquals(400,assertThrows(ApiException.class,()->documents.save("quotations",null,invalid)).status);
  lookups.save(c.statusId(),new LookupValueService.Request("customer-status","Enabled"));
  assertEquals("Enabled",CustomerResponse.from(customers.get(c.id())).status());
 }
 @Test void numberUniquenessAndTypeIsolation(){
  var c=customers.save(null,customer("Customer",""));
  var input=new DocumentRequest("Q001",c.id(),status("quotations","Draft"),"2026-10-07","",
   "",BigDecimal.ZERO,List.of(new DocumentRequest.LineInput("Item",BigDecimal.ONE,BigDecimal.TEN)));
  var d=documents.save("quotations",null,input);
  assertEquals(404,assertThrows(ApiException.class,()->documents.one("invoices",d.id())).status);
  assertEquals(409,assertThrows(ApiException.class,()->documents.save("quotations",null,input)).status);
 }
}
