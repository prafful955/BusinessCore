package com.example.inventory.controller;
import com.example.inventory.service.StockService;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController
public class StockController{
 private final StockService service;
 public StockController(StockService s){service=s;}
 @GetMapping("/api/stocks") public List<StockService.Response> all(){return service.all();}
 @GetMapping("/api/stocks/{id}") public StockService.Response one(@PathVariable Long id){return service.one(id);}
 @GetMapping("/api/stocks/{id}/movements") public List<StockService.Movement> history(@PathVariable Long id){return service.history(id);}
 @PostMapping("/api/stocks/adjustments") public StockService.Response adjust(@RequestBody StockService.Adjustment r){return service.adjust(r);}
 @GetMapping("/api/stock-products") public List<Map<String,Object>> products(){return service.products();}
}
