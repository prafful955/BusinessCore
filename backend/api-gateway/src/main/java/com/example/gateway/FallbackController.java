package com.example.gateway;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FallbackController {
    @RequestMapping("/fallback/employee")
    public ResponseEntity<Map<String, String>> employee() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("code", "EMPLOYEE_SERVICE_UNAVAILABLE",
                        "message", "Employee service is temporarily unavailable. Please try again later."));
    }
}