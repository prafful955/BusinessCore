package com.example.product.controller;
import com.example.product.service.CategoryException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.dao.*;
import java.util.Map;
@RestControllerAdvice(assignableTypes=CategoryController.class)
public class CategoryErrors {
 @ExceptionHandler(CategoryException.class) public ResponseEntity<?> domain(CategoryException e){
  return ResponseEntity.status(e.status).body(Map.of("message",e.getMessage()));
 }
 @ExceptionHandler(OptimisticLockingFailureException.class) public ResponseEntity<?> stale(Exception e){
  return ResponseEntity.status(409).body(Map.of("message","Category changed. Reload it before trying again."));
 }
 @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<?> conflict(Exception e){
  return ResponseEntity.status(409).body(Map.of("message","Category name already exists or category is still referenced"));
 }
 @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
  org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
  org.springframework.web.bind.MissingServletRequestParameterException.class})
 public ResponseEntity<?> invalid(Exception e){
  return ResponseEntity.badRequest().body(Map.of("message","Invalid request body or parameter"));
 }
}
