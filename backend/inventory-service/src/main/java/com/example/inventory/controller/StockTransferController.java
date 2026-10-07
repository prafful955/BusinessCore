package com.example.inventory.controller;
import com.example.inventory.dto.*;
import com.example.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/stock-transfers")
public class StockTransferController{
 private final InventoryService service;
 public StockTransferController(InventoryService s){service=s;}
 @GetMapping public List<InventoryResponse> all(){return service.all("stock-transfers");}
 @GetMapping("/{id}") public InventoryResponse one(@PathVariable Long id){return service.one("stock-transfers",id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public InventoryResponse create(@RequestBody InventoryRequest r){return service.save("stock-transfers",null,r);}
 @PutMapping("/{id}") public InventoryResponse update(@PathVariable Long id,@RequestBody InventoryRequest r){return service.save("stock-transfers",id,r);}
 @PostMapping("/{id}/post") public InventoryResponse post(@PathVariable Long id,@RequestParam Long version){return service.post("stock-transfers",id,version);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,@RequestParam Long version){service.delete("stock-transfers",id,version);}
}
