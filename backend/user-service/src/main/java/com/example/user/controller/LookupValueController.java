package com.example.user.controller;
import com.example.user.service.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.*;
@RestController
public class LookupValueController {
 public record StatusResponse(Long id,String name) {}
 private final LookupValueService service;
 private final StatusService statuses;
 public LookupValueController(LookupValueService s,StatusService t){service=s;statuses=t;}
 @GetMapping("/api/statuses") public List<StatusResponse> statuses(@RequestParam String scope){
  return statuses.all(scope).stream().map(l->new StatusResponse(l.id,l.name)).toList();
 }
 @GetMapping("/api/lookup-values") public List<LookupValueService.Response> all(@RequestParam String kind){return service.all(kind);}
 @GetMapping("/api/lookup-values/{id}") public LookupValueService.Response one(@PathVariable Long id){return LookupValueService.Response.from(service.get(id));}
 @PostMapping("/api/lookup-values") @ResponseStatus(HttpStatus.CREATED)
 public LookupValueService.Response create(@RequestBody LookupValueService.Request r){return service.save(null,r);}
 @PutMapping("/api/lookup-values/{id}") public LookupValueService.Response update(@PathVariable Long id,@RequestBody LookupValueService.Request r){return service.save(id,r);}
 @DeleteMapping("/api/lookup-values/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
 public void delete(@PathVariable Long id){service.delete(id);}
}
