package com.example.user.controller;
import com.example.user.entity.User;
import com.example.user.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/users") @CrossOrigin(origins="http://localhost:5173") public class UserController  {
    private final UserRepository repo;
    public UserController(UserRepository repo) {
        this.repo=repo;
    }
    @GetMapping public List<User> all() {
        return repo.findAll();
    }
    @PostMapping public User create(@RequestBody User u) {
        return repo.save(u);
    }
    @GetMapping("/{id}") public User one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow();
    }
}
