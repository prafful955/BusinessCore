package com.example.inventory.repository;
import com.example.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface StockMovementRepository extends JpaRepository<StockMovement,Long>{
 List<StockMovement> findByBalanceIdOrderByIdDesc(Long id);
}
