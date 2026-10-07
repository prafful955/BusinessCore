package com.example.user.repository;
import com.example.user.entity.BusinessDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BusinessDocumentRepository extends JpaRepository<BusinessDocument,Long> {
 List<BusinessDocument> findByKindOrderByIdDesc(String kind);
 Optional<BusinessDocument> findByKindAndNumberIgnoreCase(String kind,String number);
 boolean existsByCustomerId(Long id);
 boolean existsByStatusId(Long id);
}
