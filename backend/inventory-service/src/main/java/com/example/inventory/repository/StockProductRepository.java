package com.example.inventory.repository;
import com.example.inventory.entity.StockProduct;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StockProductRepository extends JpaRepository<StockProduct,Long>{}
