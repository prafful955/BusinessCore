package com.example.user.dto;
import com.example.user.entity.Role;
public record RoleResponse(Long id,String name,java.util.Set<String> permissions) {
    public static RoleResponse from(Role r) {
        return new RoleResponse(r.id,r.name,r.permissions);
    }
}
