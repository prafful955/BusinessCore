package com.example.salesinvoice.controller;
import com.example.salesinvoice.dto.*;
import com.example.salesinvoice.service.SalesInvoiceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/sales-invoices")
public class SalesInvoiceController {
 private final SalesInvoiceService service;
 public SalesInvoiceController(SalesInvoiceService s){service=s;}
 @GetMapping public List<DocumentResponse> all(){return service.all("sales-invoices");}
 @GetMapping("/{id}") public DocumentResponse one(@PathVariable Long id){return service.one("sales-invoices",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public DocumentResponse create(@RequestBody DocumentRequest r){return service.save("sales-invoices",null,r);}
 @PutMapping("/{id}") public DocumentResponse update(@PathVariable Long id,@RequestBody DocumentRequest r){return service.save("sales-invoices",id,r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){service.delete("sales-invoices",id);}
 @GetMapping("/{id}/print") public DocumentResponse print(@PathVariable Long id){return service.one("sales-invoices",id);}
}
