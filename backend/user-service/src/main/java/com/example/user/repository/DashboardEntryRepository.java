package com.example.user.repository;
import com.example.user.entity.DashboardEntry;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DashboardEntryRepository extends JpaRepository<DashboardEntry,Long> {
    java.util.List<DashboardEntry> findByCategory(String category);
}
