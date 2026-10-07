package com.example.user.controller;
import com.example.user.service.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Map;
@RestController @RequestMapping("/api/auth") public class AuthController  {
    public record LoginRequest(String email,String password) {
    }
    private final AuthService auth;
    public AuthController(AuthService a) {
        auth=a;
    }
    @PostMapping("/login") public Map<String,Object> login(@RequestBody LoginRequest r) {
        return auth.login(r.email(),r.password());
    }
    @GetMapping("/me") public Map<String,Object> me(@RequestHeader(value="Authorization",required=false) String h) {
        return auth.me(auth.authenticate(h));
    }
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(@RequestHeader(value="Authorization",required=false) String h) {
        auth.logout(h);
    }
}
