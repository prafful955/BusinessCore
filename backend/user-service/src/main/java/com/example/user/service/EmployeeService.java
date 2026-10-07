package com.example.user.service;
import com.example.user.entity.*;
import com.example.user.dto.*;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.time.*;
import java.math.BigDecimal;
import java.util.*;
@Service @Transactional public class EmployeeService  {
    private final EmployeeRepository employees;
    private final RoleRepository roles;
    private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
    public EmployeeService(EmployeeRepository e,RoleRepository r) {
        employees=e;
        roles=r;
    }
    public Employee get(Long id) {
        return employees.findById(id).orElseThrow(()->new ApiException(404,"Employee not found"));
    }
    public List<EmployeeResponse> all() {
        return employees.findAll().stream().map(this::response).toList();
    }
    private String required(String v,String field) {
        if(v==null||v.isBlank())throw new ApiException(400,field+" is required");
        return v.trim();
    }
    private LocalDate date(String v) {
        if(v==null||v.isBlank())return null;
        try {
            if(!v.matches("\\d{4}-\\d{2}-\\d{2}"))throw new IllegalArgumentException();
            return LocalDate.parse(v);
        }
        catch(Exception e) {
            throw new ApiException(400,"Dates must be valid YYYY-MM-DD values");
        }
    }
    public EmployeeResponse save(Long id,EmployeeRequest input) {
        Employee employee=id==null?new Employee():get(id);
        String code=required(input.code,"Employee code"),name=required(input.name,"Employee name"),email=required(input.email,"Email").toLowerCase(Locale.ROOT);
        if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))throw new ApiException(400,"Invalid email");
        if(!Set.of("Active","Inactive").contains(input.status==null?"":input.status))throw new ApiException(400,"Status must be Active or Inactive");
        if(input.maximumDailyServices!=null&&input.maximumDailyServices<0||input.hourlyRate!=null&&input.hourlyRate.signum()<0||input.salesCommissionPercent!=null&&(input.salesCommissionPercent.signum()<0||input.salesCommissionPercent.compareTo(new BigDecimal("100"))>0))throw new ApiException(400,"Invalid numeric limits");
        for(Employee other:employees.findAll())if(!Objects.equals(other.id,id)) {
            if(code.equalsIgnoreCase(other.code))throw new ApiException(409,"Employee code already exists");
            if(email.equalsIgnoreCase(other.email))throw new ApiException(409,"Employee email already exists");
            if(input.hasLogin&&input.loginId!=null&&input.loginId.trim().equalsIgnoreCase(other.loginId))throw new ApiException(409,"Login ID already exists");
        }
        Role role=null;
        String loginId=null;
        if(input.hasLogin) {
            loginId=required(input.loginId,"Login ID").toLowerCase(Locale.ROOT);
            role=roles.findByNameIgnoreCase(required(input.role,"Role")).orElseThrow(()->new ApiException(400,"Role does not exist"));
            if(employee.passwordHash==null&&input.password==null)throw new ApiException(400,"Password required for a new login account");
        }
        if(input.password!=null&&(input.password.length()<8||input.password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72))throw new ApiException(400,"Password must contain at least 8 characters and at most 72 UTF-8 bytes");
        employee.credentialVersion++;
        employee.code=input.code;
        employee.name=input.name;
        employee.email=input.email;
        employee.department=input.department;
        employee.status=input.status;
        employee.firstName=input.firstName;
        employee.lastName=input.lastName;
        employee.photoUrl=input.photoUrl;
        employee.gender=input.gender;
        employee.phone=input.phone;
        employee.businessLocation=input.businessLocation;
        employee.cashRegister=input.cashRegister;
        employee.reportsTo=input.reportsTo;
        employee.associatedEmailAccount=input.associatedEmailAccount;
        employee.streetAddress=input.streetAddress;
        employee.streetAddressLine2=input.streetAddressLine2;
        employee.city=input.city;
        employee.state=input.state;
        employee.county=input.county;
        employee.country=input.country;
        employee.zipCode=input.zipCode;
        employee.loginId=input.loginId;
        employee.thirdPartyLoginEmails=input.thirdPartyLoginEmails;
        employee.warehouse=input.warehouse;
        employee.workShift=input.workShift;
        employee.holidaySchedule=input.holidaySchedule;
        employee.customFields=input.customFields;
        employee.hasLogin=input.hasLogin;
        employee.maintainLoginHistory=input.maintainLoginHistory;
        employee.viewOthersTimeCaptures=input.viewOthersTimeCaptures;
        employee.requireMfa=input.requireMfa;
        employee.preventOthersTimeCapture=input.preventOthersTimeCapture;
        employee.notAnEmployee=input.notAnEmployee;
        employee.assignedToServices=input.assignedToServices;
        employee.captureInvoiceSignature=input.captureInvoiceSignature;
        employee.captureOrderSignature=input.captureOrderSignature;
        employee.deliverOrders=input.deliverOrders;
        employee.canHaveAppointments=input.canHaveAppointments;
        employee.performServices=input.performServices;
        employee.seeRepeatServices=input.seeRepeatServices;
        employee.serviceLaborTimer=input.serviceLaborTimer;
        employee.maximumDailyServices=input.maximumDailyServices;
        employee.hourlyRate=input.hourlyRate;
        employee.salesCommissionPercent=input.salesCommissionPercent;
        employee.code=code;
        employee.name=name;
        employee.email=email;
        employee.loginId=loginId;
        employee.assignedRole=role;
        employee.dateOfBirth=date(input.dateOfBirth);
        employee.joiningDate=date(input.joiningDate);
        if(input.password!=null&&input.hasLogin)employee.passwordHash=encoder.encode(input.password);
        return response(employees.saveAndFlush(employee));
    }
    public EmployeeResponse response(Employee employee) {
        EmployeeResponse response=new EmployeeResponse();
        response.id=employee.id;
        response.code=employee.code;
        response.name=employee.name;
        response.email=employee.email;
        response.department=employee.department;
        response.status=employee.status;
        response.firstName=employee.firstName;
        response.lastName=employee.lastName;
        response.photoUrl=employee.photoUrl;
        response.gender=employee.gender;
        response.phone=employee.phone;
        response.businessLocation=employee.businessLocation;
        response.cashRegister=employee.cashRegister;
        response.reportsTo=employee.reportsTo;
        response.associatedEmailAccount=employee.associatedEmailAccount;
        response.streetAddress=employee.streetAddress;
        response.streetAddressLine2=employee.streetAddressLine2;
        response.city=employee.city;
        response.state=employee.state;
        response.county=employee.county;
        response.country=employee.country;
        response.zipCode=employee.zipCode;
        response.loginId=employee.loginId;
        response.thirdPartyLoginEmails=employee.thirdPartyLoginEmails;
        response.warehouse=employee.warehouse;
        response.workShift=employee.workShift;
        response.holidaySchedule=employee.holidaySchedule;
        response.customFields=employee.customFields;
        response.hasLogin=employee.hasLogin;
        response.maintainLoginHistory=employee.maintainLoginHistory;
        response.viewOthersTimeCaptures=employee.viewOthersTimeCaptures;
        response.requireMfa=employee.requireMfa;
        response.preventOthersTimeCapture=employee.preventOthersTimeCapture;
        response.notAnEmployee=employee.notAnEmployee;
        response.assignedToServices=employee.assignedToServices;
        response.captureInvoiceSignature=employee.captureInvoiceSignature;
        response.captureOrderSignature=employee.captureOrderSignature;
        response.deliverOrders=employee.deliverOrders;
        response.canHaveAppointments=employee.canHaveAppointments;
        response.performServices=employee.performServices;
        response.seeRepeatServices=employee.seeRepeatServices;
        response.serviceLaborTimer=employee.serviceLaborTimer;
        response.maximumDailyServices=employee.maximumDailyServices;
        response.hourlyRate=employee.hourlyRate;
        response.salesCommissionPercent=employee.salesCommissionPercent;
        response.loginId=employee.loginId==null?"":employee.loginId;
        response.role=employee.assignedRole==null?"":employee.assignedRole.name;
        response.dateOfBirth=employee.dateOfBirth==null?"":employee.dateOfBirth.toString();
        response.joiningDate=employee.joiningDate==null?"":employee.joiningDate.toString();
        return response;
    }
    public void delete(Long id) {
        employees.delete(get(id));
        employees.flush();
    }
}
