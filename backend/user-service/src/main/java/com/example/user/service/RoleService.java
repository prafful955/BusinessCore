package com.example.user.service;
import com.example.user.entity.Role;
import com.example.user.dto.*;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional
public class RoleService
{
    public static final Set<String> MODULES=Set.of("dashboards","locations","employees","roles","products","customers","quotations","orders","sales","purchases","inventory","manufacturing","deliveries","finance","appointments","tasks","system","settings");
    private final RoleRepository roles;
    private final EmployeeRepository employees;
    public RoleService(RoleRepository r,EmployeeRepository e) {
        roles=r;
        employees=e;
    }
    public Role get(Long id) {
        return roles.findById(id).orElseThrow(()->new ApiException(404,"Role not found"));
    }
    public List<RoleResponse> all() {
        return roles.findAll().stream().map(RoleResponse::from).toList();
    }
    public RoleResponse save(Long id,RoleRequest input)
    {
        if(input.name()==null||input.name().isBlank()||input.name().trim().length()>100)throw new ApiException(400,"Role name must contain 1 to 100 characters");
        Role role=id==null?new Role():get(id);
        String name=input.name().trim();
        roles.findByNameIgnoreCase(name).filter(r->!Objects.equals(r.id,id)).ifPresent(r-> {
            throw new ApiException(409,"Role name already exists");
        }
        );
        Set<String> grants=new LinkedHashSet<>();
        if(input.permissions()!=null)for(String p:input.permissions()) {
            if(p==null)throw new ApiException(400,"Invalid permission");
            String[] parts=p.split("\\.",-1);
            if(parts.length!=2||!MODULES.contains(parts[0])||!Set.of("view","create","update","delete").contains(parts[1]))throw new ApiException(400,"Invalid permission: "+p);
            grants.add(p);
        }
        role.name=name;
        role.permissions.clear();
        role.permissions.addAll(grants);
        return RoleResponse.from(roles.saveAndFlush(role));
    }
    public void delete(Long id) {
        Role r=get(id);
        if(employees.existsByAssignedRoleId(id))throw new ApiException(409,"Role is assigned to employees");
        roles.delete(r);
        roles.flush();
    }
}
