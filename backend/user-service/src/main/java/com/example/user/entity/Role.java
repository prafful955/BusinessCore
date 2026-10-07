package com.example.user.entity;
import jakarta.persistence.*;
import java.util.*;
@Entity @Table(name="employee_roles") public class Role  {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
    @Column(unique=true,nullable=false,length=100) public String name;
    @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="role_permissions",joinColumns=@JoinColumn(name="role_id")) @Column(name="permission") public Set<String> permissions=new LinkedHashSet<>();
}
