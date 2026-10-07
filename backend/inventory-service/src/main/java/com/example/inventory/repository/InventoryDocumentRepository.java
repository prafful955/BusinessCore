package com.example.inventory.repository;
import com.example.inventory.entity.InventoryDocument;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface InventoryDocumentRepository extends JpaRepository<InventoryDocument,Long>{
 List<InventoryDocument> findByKindOrderByIdDesc(String kind);
 boolean existsByPurchaseOrderId(Long id);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select d from InventoryDocument d where d.id=:id")
 Optional<InventoryDocument> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
