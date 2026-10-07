package com.example.user.controller;
import com.example.user.dto.*;
import com.example.user.service.DocumentService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/invoices")
public class InvoiceController {
 private final DocumentService service;
 public InvoiceController(DocumentService s){service=s;}
 @GetMapping public List<DocumentResponse> all(){return service.all("invoices");}
 @GetMapping("/{id}") public DocumentResponse one(@PathVariable Long id){return service.one("invoices",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public DocumentResponse create(@RequestBody DocumentRequest r){return service.save("invoices",null,r);}
 @PutMapping("/{id}") public DocumentResponse update(@PathVariable Long id,@RequestBody DocumentRequest r){return service.save("invoices",id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete("invoices",id);}
 @GetMapping("/{id}/print") public DocumentResponse print(@PathVariable Long id){return service.one("invoices",id);}
}
