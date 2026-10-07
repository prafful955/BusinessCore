package com.example.inventory.repository;
import com.example.inventory.entity.OrganizationUnit;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface OrganizationRepository extends JpaRepository<OrganizationUnit,Long>{
 List<OrganizationUnit> findByKindOrderByNameAsc(String kind);
 boolean existsByParentId(Long id);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select o from OrganizationUnit o where o.id=:id")
 Optional<OrganizationUnit> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
