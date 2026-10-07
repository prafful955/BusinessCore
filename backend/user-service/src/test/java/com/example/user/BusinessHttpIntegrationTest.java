package com.example.user;
import com.example.user.dto.*;
import com.example.user.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.math.BigDecimal;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties="app.auth.enabled=true") @AutoConfigureMockMvc @Transactional
class BusinessHttpIntegrationTest {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;
 @Autowired RoleService roles;
 @Autowired EmployeeService employees;
 @Autowired AuthService auth;
 @Autowired StatusService statuses;
 private String token(List<String> permissions){
  roles.save(null,new RoleRequest("Business tester",permissions));
  EmployeeRequest r=new EmployeeRequest();r.code="BIZTEST";r.name="Tester";r.email="biz@example.com";
  r.status="Active";r.hasLogin=true;r.role="Business tester";r.loginId=r.email;r.password="test-password";
  employees.save(null,r);
  return "Bearer "+auth.login(r.email,r.password).get("accessToken");
 }
 private long status(String scope,String name){
  return statuses.all(scope).stream().filter(s->s.name.equals(name)).findFirst().orElseThrow().id;
 }
 @Test void customerAndDocumentHttpContract() throws Exception {
  String h=token(List.of("customers.view","customers.create","customers.delete",
   "quotations.view","quotations.create","quotations.delete","sales.view","sales.create","sales.delete"));
  CustomerRequest customer=new CustomerRequest("C001","Customer","Billing name","","customer@example.com","",
   "","","","","","","",status("customers","Active"));
  var created=mvc.perform(post("/api/customers").header("Authorization",h).contentType("application/json")
   .content(mapper.writeValueAsString(customer))).andExpect(status().isCreated()).andReturn();
  long id=mapper.readTree(created.getResponse().getContentAsString()).get("id").asLong();
  mvc.perform(get("/api/customers").header("Authorization",h)).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
  for(String kind:List.of("quotations","invoices")){
   var input=new DocumentRequest("DOC001",id,status(kind,"Draft"),"2026-10-07","2026-10-20","",
    new BigDecimal("5"),List.of(new DocumentRequest.LineInput("Item",new BigDecimal("2.5"),new BigDecimal("10.12"))));
   var result=mvc.perform(post("/api/"+kind).header("Authorization",h).contentType("application/json")
    .content(mapper.writeValueAsString(input))).andExpect(status().isCreated())
    .andExpect(jsonPath("$.invoiceName").value("Billing name")).andExpect(jsonPath("$.total").value(26.57)).andReturn();
   long documentId=mapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
   mvc.perform(get("/api/"+kind+"/"+documentId).header("Authorization",h)).andExpect(status().isOk())
    .andExpect(jsonPath("$.lines[0].lineTotal").value(25.30));
   mvc.perform(delete("/api/customers/"+id).header("Authorization",h)).andExpect(status().isConflict());
   mvc.perform(delete("/api/"+kind+"/"+documentId).header("Authorization",h)).andExpect(status().isNoContent());
  }
  mvc.perform(delete("/api/customers/"+id).header("Authorization",h)).andExpect(status().isNoContent());
 }
 @Test void permissionsApplyToStatusesAndLookupMaintenance() throws Exception {
  mvc.perform(get("/api/customers")).andExpect(status().isUnauthorized());
  String h=token(List.of("customers.view"));
  mvc.perform(get("/api/statuses?scope=customers").header("Authorization",h)).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
  mvc.perform(get("/api/statuses?scope=invoices").header("Authorization",h)).andExpect(status().isForbidden());
  mvc.perform(get("/api/lookup-values?kind=customer-status").header("Authorization",h)).andExpect(status().isForbidden());
  mvc.perform(post("/api/customers").header("Authorization",h).contentType("application/json").content("{}")).andExpect(status().isForbidden());
 }
}
