package com.example.salesinvoice.repository;
import com.example.salesinvoice.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CustomerRepository extends JpaRepository<Customer,Long> {
 Optional<Customer> findByCodeIgnoreCase(String code);
 Optional<Customer> findByEmailIgnoreCase(String email);
 boolean existsByStatusId(Long id);
}
