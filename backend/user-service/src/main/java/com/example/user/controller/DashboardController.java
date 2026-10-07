package com.example.user.controller;
import com.example.user.service.DashboardService;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/dashboard") public class DashboardController  {
    private final DashboardService service;
    public DashboardController(DashboardService s) {
        service=s;
    }
    @GetMapping("/summary") public DashboardService.Summary summary(@RequestParam(defaultValue="Bedding") String category) {
        return service.summary(category);
    }
}
