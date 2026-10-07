package com.example.inventory.controller;
import com.example.inventory.dto.*;
import com.example.inventory.service.OrganizationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/business-locations")
public class BusinessLocationController{
 private final OrganizationService service;
 public BusinessLocationController(OrganizationService s){service=s;}
 @GetMapping public List<OrganizationResponse> all(){return service.all("business-locations");}
 @GetMapping("/{id}") public OrganizationResponse one(@PathVariable Long id){return service.one("business-locations",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public OrganizationResponse create(@RequestBody OrganizationRequest r){return service.save("business-locations",null,r);}
 @PutMapping("/{id}") public OrganizationResponse update(@PathVariable Long id,@RequestBody OrganizationRequest r){return service.save("business-locations",id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,@RequestParam Long version){service.delete("business-locations",id,version);}
}
