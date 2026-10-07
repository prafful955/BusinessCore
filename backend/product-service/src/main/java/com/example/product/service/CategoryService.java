package com.example.product.service;
import com.example.product.dto.*;
import com.example.product.entity.Category;
import com.example.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional
public class CategoryService {
 private final CategoryRepository categories;
 public CategoryService(CategoryRepository r){categories=r;}
 private Category find(Long id){return categories.findById(id).orElseThrow(()->new CategoryException(404,"Category not found"));}
 @Transactional(readOnly=true) public List<CategoryResponse> all(){
  return categories.findAllByOrderByNameAsc().stream().map(CategoryResponse::from).toList();
 }
 @Transactional(readOnly=true) public CategoryResponse one(Long id){return CategoryResponse.from(find(id));}
 public CategoryResponse create(CategoryRequest input){
  if(input.version()!=null)throw new CategoryException(400,"Do not supply a version when creating a category");
  return save(new Category(),input);
 }
 public CategoryResponse update(Long id,CategoryRequest input){
  Category category=find(id);checkVersion(category,input.version());return save(category,input);
 }
 private void checkVersion(Category category,Long version){
  if(version==null||version<0)throw new CategoryException(400,"Current category version is required");
  if(!version.equals(category.version))throw new CategoryException(409,"Category changed. Reload it before trying again.");
 }
 private CategoryResponse save(Category category,CategoryRequest input){
  if(input.name()==null||input.name().isBlank()||input.name().trim().length()>100)
   throw new CategoryException(400,"Category name must contain 1 to 100 characters");
  String name=input.name().trim();
  categories.findByNameIgnoreCase(name).filter(c->!Objects.equals(c.id,category.id))
   .ifPresent(c->{throw new CategoryException(409,"Category name already exists");});
  if(!Set.of("Active","Inactive").contains(input.status()==null?"":input.status()))
   throw new CategoryException(400,"Status must be Active or Inactive");
  if(input.description()!=null&&input.description().length()>10000)
   throw new CategoryException(400,"Description must be at most 10000 characters");
  category.name=name;category.description=input.description()==null?"":input.description().trim();
  category.status=input.status();
  return CategoryResponse.from(categories.saveAndFlush(category));
 }
 public void delete(Long id,Long version){
  Category category=find(id);checkVersion(category,version);
  categories.delete(category);categories.flush();
 }
}
