package com.example.product.repository;
import com.example.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface CategoryRepository extends JpaRepository<Category,Long> {
 Optional<Category> findByNameIgnoreCase(String name);
 List<Category> findAllByOrderByNameAsc();
}
