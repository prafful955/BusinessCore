package com.example.user.service;
import com.example.user.entity.*;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.*;
import java.time.*;
import java.security.*;
import java.nio.charset.StandardCharsets;
@Service @Transactional public class AuthService  {
    private final EmployeeRepository employees;
    private final AuthSessionRepository sessions;
    public AuthService(EmployeeRepository e,AuthSessionRepository s) {
        employees=e;
        sessions=s;
    }
    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));
        }
        catch(NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
    public Map<String,Object> login(String email,String password) {
        if(email==null||password==null)throw new ApiException(400,"Email and password are required");
        Employee e=employees.findByEmailIgnoreCase(email.trim()).orElseThrow(()->new ApiException(401,"Invalid credentials"));
        if(!e.hasLogin||!"Active".equals(e.status)||e.assignedRole==null||e.passwordHash==null||!new BCryptPasswordEncoder().matches(password,e.passwordHash))throw new ApiException(401,"Invalid credentials");
        if(e.requireMfa)throw new ApiException(403,"MFA verification required; MFA workflow is not implemented");
        byte[] bytes=new byte[32];
        new SecureRandom().nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        AuthSession s=new AuthSession();
        s.tokenHash=hash(token);
        s.employeeId=e.id;
        s.credentialVersion=e.credentialVersion;
        s.expiresAt=Instant.now().plus(Duration.ofHours(8));
        sessions.save(s);
        return Map.of("accessToken",token,"tokenType","Bearer","expiresAt",s.expiresAt,"user",me(e));
    }
    public Employee authenticate(String header) {
        if(header==null||!header.startsWith("Bearer "))throw new ApiException(401,"Bearer authentication required");
        AuthSession s=sessions.findById(hash(header.substring(7))).orElseThrow(()->new ApiException(401,"Invalid session"));
        Employee e=employees.findById(s.employeeId).orElseThrow(()->new ApiException(401,"Invalid session"));
        if(!s.expiresAt.isAfter(Instant.now())||s.credentialVersion!=e.credentialVersion||!e.hasLogin||!"Active".equals(e.status)||e.requireMfa||e.assignedRole==null)throw new ApiException(401,"Session expired or revoked");
        return e;
    }
    public Map<String,Object> me(Employee e) {
        return Map.of("id",e.id,"name",e.name,"email",e.email,"role",e.assignedRole.name,"permissions",e.assignedRole.permissions);
    }
    public void logout(String header) {
        authenticate(header);
        sessions.deleteById(hash(header.substring(7)));
    }
}
