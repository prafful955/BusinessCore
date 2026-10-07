package com.example.user;
import com.example.user.dto.*;
import com.example.user.service.*;
import com.example.user.entity.*;
import com.example.user.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.math.BigDecimal;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest(properties="app.auth.enabled=true") @AutoConfigureMockMvc @Transactional
class HttpApiIntegrationTest  {
    @Autowired MockMvc mvc;
    @Autowired RoleService roles;
    @Autowired EmployeeService employees;
    @Autowired AuthService auth;
    @Autowired DashboardEntryRepository ledger;
    @Autowired DashboardService dashboard;
    private String token() {
        roles.save(null,new RoleRequest("Reader",List.of("employees.view","dashboards.view")));
        EmployeeRequest r=new EmployeeRequest();
        r.code="READER";
        r.name="Reader";
        r.email="reader@example.com";
        r.status="Active";
        r.hasLogin=true;
        r.loginId=r.email;
        r.role="Reader";
        r.password="test-password";
        employees.save(null,r);
        return "Bearer "+auth.login(r.email,r.password).get("accessToken");
    }
    @Test void protectedRequestsAndPasswordPrivacy() throws Exception  {
        mvc.perform(get("/api/employees")).andExpect(status().isUnauthorized());
        String header=token();
        mvc.perform(get("/api/employees").header("Authorization",header)).andExpect(status().isOk()).andExpect(jsonPath("$[0].id").isNumber()).andExpect(jsonPath("$[0].password").doesNotExist()).andExpect(jsonPath("$[0].passwordHash").doesNotExist());
        mvc.perform(post("/api/roles").header("Authorization",header).contentType("application/json").content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(Map.of("name","Denied","permissions",List.of())))).andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/logout").header("Authorization",header)).andExpect(status().isNoContent());
        mvc.perform(get("/api/auth/me").header("Authorization",header)).andExpect(status().isUnauthorized());
    }
    @Test void dashboardAggregatesPersistedAmounts() {
        for(String amount:List.of("12.50","7.25")) {
            DashboardEntry e=new DashboardEntry();
            e.category="Sales";
            e.metricKey="sales-total";
            e.label="Total Sales";
            e.amount=new BigDecimal(amount);
            e.occurredAt=Instant.now();
            ledger.saveAndFlush(e);
        }
        var summary=dashboard.summary("Sales");
        assertEquals(1,summary.metrics().size());
        assertEquals(0,new BigDecimal("19.75").compareTo(summary.metrics().get(0).amount()));
        assertEquals(400,assertThrows(ApiException.class,()->dashboard.summary("invalid")).status);
    }
    @Test void roleHttpContract() throws Exception  {
        roles.save(null,new RoleRequest("Admin",List.of("roles.view","roles.create","roles.update","roles.delete","system.view")));
        EmployeeRequest r=new EmployeeRequest();
        r.code="ADMIN";
        r.name="Admin";
        r.email="admin@example.com";
        r.status="Active";
        r.hasLogin=true;
        r.loginId=r.email;
        r.role="Admin";
        r.password="test-password";
        employees.save(null,r);
        String h="Bearer "+auth.login(r.email,r.password).get("accessToken");
        var mapper=new com.fasterxml.jackson.databind.ObjectMapper();
        String body=mapper.writeValueAsString(new RoleRequest("New role",List.of("employees.view")));
        var result=mvc.perform(post("/api/roles").header("Authorization",h).contentType("application/json").content(body)).andExpect(status().isCreated()).andReturn();
        long id=mapper.readTree(result.getResponse().getContentAsString()).get("id").asLong();
        mvc.perform(get("/api/roles").header("Authorization",h)).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
        mvc.perform(post("/api/roles").header("Authorization",h).contentType("application/json").content(body)).andExpect(status().isConflict());
        mvc.perform(put("/api/roles/"+id).header("Authorization",h).contentType("application/json").content(mapper.writeValueAsString(new RoleRequest("Updated",List.of())))).andExpect(status().isOk()).andExpect(jsonPath("$.permissions").isEmpty());
        mvc.perform(delete("/api/roles/"+id).header("Authorization",h)).andExpect(status().isNoContent()).andExpect(content().string(""));
        mvc.perform(get("/api/roles/"+id).header("Authorization",h)).andExpect(status().isNotFound());
        mvc.perform(get("/api/departments").header("Authorization",h)).andExpect(status().isOk()).andExpect(jsonPath("$").isArray());
    }
    @Test void lookupListsAreArraysAndRequirePermissions() throws Exception  {
        mvc.perform(get("/api/departments").header("Authorization",token())).andExpect(status().isForbidden());
    }
}
