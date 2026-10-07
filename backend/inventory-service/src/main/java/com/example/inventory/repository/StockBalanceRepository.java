package com.example.inventory.repository;
import com.example.inventory.entity.StockBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface StockBalanceRepository extends JpaRepository<StockBalance,Long>{
 Optional<StockBalance> findByProductIdAndWarehouseId(Long productId,Long warehouseId);
}
