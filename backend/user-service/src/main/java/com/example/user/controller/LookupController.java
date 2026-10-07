package com.example.user.controller;
import com.example.user.repository.LookupRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController public class LookupController  {
    private final LookupRepository repository;
    public LookupController(LookupRepository r) {
        repository=r;
    }
    public record LookupResponse(Long id,String name) {
    }
    @GetMapping( {
        "/api/departments","/api/locations","/api/cash-registers","/api/email-accounts","/api/work-shifts","/api/holiday-schedules"
    }
    ) public List<LookupResponse> all(jakarta.servlet.http.HttpServletRequest r) {
        return repository.findByKindOrderByNameAsc(r.getRequestURI().substring(5)).stream().map(v->new LookupResponse(v.id,v.name)).toList();
    }
}
