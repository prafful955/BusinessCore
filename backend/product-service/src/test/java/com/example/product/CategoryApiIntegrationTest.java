package com.example.product;
import com.example.product.dto.*;
import com.example.product.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.system.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @Transactional @ExtendWith(OutputCaptureExtension.class)
class CategoryApiIntegrationTest {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;
 @Autowired CategoryService service;
 @Test void staleUpdatesAndDeletesAreRejected() throws Exception {
  var created=service.create(new CategoryRequest("Bedding","Description","Active",null));
  var updated=service.update(created.id(),new CategoryRequest("New Bedding","","Active",created.version()));
  assertTrue(updated.version()>created.version());
  mvc.perform(put("/api/categories/"+created.id()).contentType("application/json")
   .content(mapper.writeValueAsString(new CategoryRequest("Old edit","","Active",created.version()))))
   .andExpect(status().isConflict());
  mvc.perform(delete("/api/categories/"+created.id()).param("version",created.version().toString()))
   .andExpect(status().isConflict());
  assertEquals("New Bedding",service.one(created.id()).name());
 }
 @Test void httpContractAndAopLogging(CapturedOutput output) throws Exception {
  var result=mvc.perform(post("/api/categories").contentType("application/json")
   .content(mapper.writeValueAsString(new CategoryRequest("Electronics","Devices","Active",null))))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.version").value(0)).andReturn();
  var json=mapper.readTree(result.getResponse().getContentAsString());
  long id=json.get("id").asLong();
  mvc.perform(get("/api/categories")).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
  mvc.perform(get("/api/categories/"+id)).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Electronics"));
  mvc.perform(delete("/api/categories/"+id)).andExpect(status().isBadRequest());
  mvc.perform(delete("/api/categories/"+id).param("version","0")).andExpect(status().isNoContent());
  mvc.perform(get("/api/categories/"+id)).andExpect(status().isNotFound());
  assertTrue(output.getOut().contains("category operation=create result=success"));
  assertTrue(output.getOut().contains("category operation=one result=failure"));
 }
 @Test void validationAndUniqueness(){
  service.create(new CategoryRequest("Bedding","","Active",null));
  assertEquals(409,assertThrows(CategoryException.class,
   ()->service.create(new CategoryRequest("bedding","","Active",null))).status);
  assertEquals(400,assertThrows(CategoryException.class,
   ()->service.create(new CategoryRequest("","","Active",null))).status);
 }
}
