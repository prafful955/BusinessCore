package com.example.salesinvoice;
import com.example.salesinvoice.dto.*;
import com.example.salesinvoice.entity.*;
import com.example.salesinvoice.repository.*;
import com.example.salesinvoice.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @Transactional
class SalesInvoiceIntegrationTest {
 @Autowired SalesInvoiceService service;
 @Autowired CustomerRepository customers;
 @Autowired LookupRepository lookups;
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;
 @Test void standaloneCrudAndPrintUseCalculatedAmountsAndBillingSnapshots() throws Exception {
  var active=new Lookup();active.kind="customer-status";active.name="Active";lookups.saveAndFlush(active);
  var draft=new Lookup();draft.kind="sales-invoice-status";draft.name="Draft";lookups.saveAndFlush(draft);
  var customer=new Customer();customer.code="C001";customer.name="Customer";customer.invoiceName="Billing name";
  customer.streetAddress="Main Road";customer.city="Mumbai";customer.status=active;customers.saveAndFlush(customer);
  var request=new DocumentRequest("SI001",customer.id,draft.id,"2026-10-07","2026-10-20","Notes",
   new BigDecimal("10"),List.of(new DocumentRequest.LineInput("Item",new BigDecimal("2"),new BigDecimal("10"))));
  var result=mvc.perform(post("/api/sales-invoices").contentType("application/json").content(mapper.writeValueAsString(request)))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.total").value(22.0)).andReturn();
  long id=mapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
  mvc.perform(get("/api/sales-invoices/"+id+"/print")).andExpect(status().isOk())
   .andExpect(jsonPath("$.invoiceName").value("Billing name"))
   .andExpect(jsonPath("$.billingAddress").value("Main Road, Mumbai"))
   .andExpect(jsonPath("$.lines[0].lineTotal").value(20.0));
  mvc.perform(get("/api/sales-invoices")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
  assertEquals(409,assertThrows(ApiException.class,()->service.save("sales-invoices",null,request)).status);
  mvc.perform(delete("/api/sales-invoices/"+id)).andExpect(status().isNoContent());
 }
}
