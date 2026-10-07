package com.example.user.controller;
import com.example.user.dto.*;
import com.example.user.service.CustomerService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/customers")
public class CustomerController {
 private final CustomerService service;
 public CustomerController(CustomerService s){service=s;}
 @GetMapping public List<CustomerResponse> all(){return service.all();}
 @GetMapping("/{id}") public CustomerResponse one(@PathVariable Long id){return CustomerResponse.from(service.get(id));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public CustomerResponse create(@RequestBody CustomerRequest r){return service.save(null,r);}
 @PutMapping("/{id}") public CustomerResponse update(@PathVariable Long id,@RequestBody CustomerRequest r){return service.save(id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete(id);}
}
