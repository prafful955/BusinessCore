package com.example.user;
import com.example.user.dto.*;
import com.example.user.service.*;
import com.example.user.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest @Transactional class ApiIntegrationTest  {
    @Autowired RoleService roles;
    @Autowired EmployeeService employees;
    @Autowired AuthService auth;
    @Autowired EmployeeRepository repository;
    @Test void assignmentRenameAndDelete() {
        var role=roles.save(null,new RoleRequest("Manager",List.of("employees.view","employees.view")));
        assertEquals(1,role.permissions().size());
        var r=input();
        r.hasLogin=true;
        r.role="Manager";
        r.loginId=r.email;
        r.password="secure-password";
        var e=employees.save(null,r);
        assertNotEquals(r.password,repository.findById(e.id).orElseThrow().passwordHash);
        roles.save(role.id(),new RoleRequest("Renamed",List.of()));
        assertEquals("Renamed",employees.response(employees.get(e.id)).role);
        assertEquals(409,assertThrows(ApiException.class,()->roles.delete(role.id())).status);
    }
    @Test void validationAndDuplicates() {
        var r=input();
        r.hourlyRate=new java.math.BigDecimal("-1");
        assertEquals(400,assertThrows(ApiException.class,()->employees.save(null,r)).status);
        r.hourlyRate=null;
        employees.save(null,r);
        assertEquals(409,assertThrows(ApiException.class,()->employees.save(null,r)).status);
        assertEquals(400,assertThrows(ApiException.class,()->roles.save(null,new RoleRequest("Invalid",List.of("employees.admin")))).status);
    }
    @Test void loginRevocationAndClearing() {
        roles.save(null,new RoleRequest("Manager",List.of("employees.view")));
        var r=input();
        r.hasLogin=true;
        r.role="Manager";
        r.loginId=r.email;
        r.password="secure-password";
        r.city="Mumbai";
        var e=employees.save(null,r);
        String h="Bearer "+auth.login(r.email,r.password).get("accessToken");
        assertEquals(e.id,auth.authenticate(h).id);
        var u=input();
        u.hasLogin=true;
        u.role="Manager";
        u.loginId=r.email;
        employees.save(e.id,u);
        assertNull(employees.response(employees.get(e.id)).city);
        assertEquals(401,assertThrows(ApiException.class,()->auth.authenticate(h)).status);
    }
    private EmployeeRequest input() {
        var r=new EmployeeRequest();
        r.code="EMP001";
        r.name="Aarav";
        r.email="aarav@example.com";
        r.status="Active";
        r.department="Sales";
        return r;
    }
}
