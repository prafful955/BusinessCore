package com.example.user.controller;
import com.example.user.dto.*;
import com.example.user.service.EmployeeService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;
@RestController @RequestMapping("/api/employees") public class EmployeeController  {
    private final EmployeeService service;
    public EmployeeController(EmployeeService s) {
        service=s;
    }
    @GetMapping public List<EmployeeResponse> all() {
        return service.all();
    }
    @GetMapping("/{id}") public EmployeeResponse one(@PathVariable Long id) {
        return service.response(service.get(id));
    }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public EmployeeResponse create(@RequestBody EmployeeRequest input) {
        return service.save(null,input);
    }
    @PutMapping("/{id}") public EmployeeResponse update(@PathVariable Long id,@RequestBody EmployeeRequest input) {
        return service.save(id,input);
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
