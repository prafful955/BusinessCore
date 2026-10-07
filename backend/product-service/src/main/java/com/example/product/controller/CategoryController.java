package com.example.product.controller;
import com.example.product.dto.*;
import com.example.product.service.CategoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/categories")
public class CategoryController {
 private final CategoryService service;
 public CategoryController(CategoryService s){service=s;}
 @GetMapping public List<CategoryResponse> all(){return service.all();}
 @GetMapping("/{id}") public CategoryResponse one(@PathVariable Long id){return service.one(id);}
 @PostMapping @ResponseStatus(HttpStatus.CREATED)
 public CategoryResponse create(@RequestBody CategoryRequest input){return service.create(input);}
 @PutMapping("/{id}") public CategoryResponse update(@PathVariable Long id,@RequestBody CategoryRequest input){
  return service.update(id,input);
 }
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
 public void delete(@PathVariable Long id,@RequestParam Long version){service.delete(id,version);}
}
