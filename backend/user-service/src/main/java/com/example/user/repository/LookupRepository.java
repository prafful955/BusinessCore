package com.example.user.repository;
import com.example.user.entity.Lookup;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LookupRepository extends JpaRepository<Lookup,Long> {
    java.util.List<Lookup> findByKindOrderByNameAsc(String kind);
}
