package com.example.user.repository;
import com.example.user.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
public interface EmployeeRepository extends JpaRepository<Employee,Long> {
    boolean existsByAssignedRoleId(Long id);
    java.util.Optional<Employee> findByEmailIgnoreCase(String email);
}
