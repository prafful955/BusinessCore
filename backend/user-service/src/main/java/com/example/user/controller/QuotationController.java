package com.example.user.controller;
import com.example.user.dto.*;
import com.example.user.service.DocumentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/quotations")
public class QuotationController {
 private final DocumentService service;
 public QuotationController(DocumentService s){service=s;}
 @GetMapping public List<DocumentResponse> all(){return service.all("quotations");}
 @GetMapping("/{id}") public DocumentResponse one(@PathVariable Long id){return service.one("quotations",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public DocumentResponse create(@RequestBody DocumentRequest r){return service.save("quotations",null,r);}
 @PutMapping("/{id}") public DocumentResponse update(@PathVariable Long id,@RequestBody DocumentRequest r){return service.save("quotations",id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete("quotations",id);}
 @GetMapping("/{id}/print") public DocumentResponse print(@PathVariable Long id){return service.one("quotations",id);}
}
