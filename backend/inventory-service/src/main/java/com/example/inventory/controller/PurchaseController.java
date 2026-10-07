package com.example.inventory.controller;
import com.example.inventory.dto.*;
import com.example.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/purchases")
public class PurchaseController{
 private final InventoryService service;
 public PurchaseController(InventoryService s){service=s;}
 @GetMapping public List<InventoryResponse> all(){return service.all("purchases");}
 @GetMapping("/{id}") public InventoryResponse one(@PathVariable Long id){return service.one("purchases",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public InventoryResponse create(@RequestBody InventoryRequest r){return service.save("purchases",null,r);}
 @PutMapping("/{id}") public InventoryResponse update(@PathVariable Long id,@RequestBody InventoryRequest r){return service.save("purchases",id,r);}
 @PostMapping("/{id}/post") public InventoryResponse post(@PathVariable Long id,@RequestParam Long version){return service.post("purchases",id,version);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,@RequestParam Long version){service.delete("purchases",id,version);}
 @GetMapping("/{id}/print") public InventoryResponse print(@PathVariable Long id){return service.one("purchases",id);}
}
