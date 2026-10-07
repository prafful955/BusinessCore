package com.example.user.controller;
import com.example.user.dto.*;
import com.example.user.service.RoleService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/roles") public class RoleController  {
    private final RoleService service;
    public RoleController(RoleService s) {
        service=s;
    }
    @GetMapping public List<RoleResponse> all() {
        return service.all();
    }
    @GetMapping("/{id}") public RoleResponse one(@PathVariable Long id) {
        return RoleResponse.from(service.get(id));
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public RoleResponse create(@RequestBody RoleRequest input) {
        return service.save(null,input);
    }
    @PutMapping("/{id}") public RoleResponse update(@PathVariable Long id,@RequestBody RoleRequest input) {
        return service.save(id,input);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
