package com.example.user.repository;
import com.example.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RoleRepository extends JpaRepository<Role,Long> {
    java.util.Optional<Role> findByNameIgnoreCase(String name);
}
