package com.example.salesinvoice.service;
import com.example.salesinvoice.entity.Customer;
import com.example.salesinvoice.repository.CustomerRepository;
import org.springframework.stereotype.Service;
@Service public class CustomerService {private final CustomerRepository repo;public CustomerService(CustomerRepository r){repo=r;}public Customer get(Long id){return repo.findById(id).orElseThrow(()->new ApiException(404,"Customer not found"));}}
