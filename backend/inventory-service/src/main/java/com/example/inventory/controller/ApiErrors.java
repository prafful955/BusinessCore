package com.example.inventory.controller;
import com.example.inventory.service.ApiException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.Map;
@RestControllerAdvice public class ApiErrors  {
    @ExceptionHandler(ApiException.class) public ResponseEntity<?> api(ApiException e) {
        return ResponseEntity.status(e.status).body(Map.of("message",e.getMessage()));
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class) public ResponseEntity<?> conflict(Exception e) {
        return ResponseEntity.status(409).body(Map.of("message","Duplicate value or assigned record conflict"));
    }
    @ExceptionHandler( {
        org.springframework.http.converter.HttpMessageNotReadableException.class,org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,org.springframework.web.bind.MissingServletRequestParameterException.class
    }
    ) public ResponseEntity<?> invalid(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("message","Invalid request body or parameter"));
    }
 @ExceptionHandler(org.springframework.dao.OptimisticLockingFailureException.class)
 public ResponseEntity<?> stale(Exception e){return ResponseEntity.status(409).body(Map.of("message","Record changed; reload before trying again"));}
}
