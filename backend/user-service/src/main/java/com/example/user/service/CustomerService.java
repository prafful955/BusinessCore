package com.example.user.service;
import com.example.user.dto.*;
import com.example.user.entity.Customer;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional
public class CustomerService {
 private final CustomerRepository customers;
 private final BusinessDocumentRepository documents;
 private final StatusService statuses;
 public CustomerService(CustomerRepository c,BusinessDocumentRepository d,StatusService s){customers=c;documents=d;statuses=s;}
 public Customer get(Long id){return customers.findById(id).orElseThrow(()->new ApiException(404,"Customer not found"));}
 public List<CustomerResponse> all(){return customers.findAll().stream().map(CustomerResponse::from).toList();}
 private String text(String value){return value==null?"":value.trim();}
 private String required(String value,String name){
  String result=text(value);
  if(result.isEmpty()||result.length()>255)throw new ApiException(400,name+" must contain 1 to 255 characters");
  return result;
 }
 public CustomerResponse save(Long id,CustomerRequest input){
  Customer c=id==null?new Customer():get(id);
  String code=required(input.code(),"Code"),name=required(input.name(),"Name"),email=text(input.email()).toLowerCase(Locale.ROOT);
  if(!email.isEmpty()&&(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")||email.length()>255))
   throw new ApiException(400,"Invalid email");
  customers.findByCodeIgnoreCase(code).filter(other->!Objects.equals(other.id,id))
   .ifPresent(other->{throw new ApiException(409,"Customer code already exists");});
  if(!email.isEmpty())customers.findByEmailIgnoreCase(email).filter(other->!Objects.equals(other.id,id))
   .ifPresent(other->{throw new ApiException(409,"Customer email already exists");});
  for(String value:Arrays.asList(input.invoiceName(),input.company(),input.phone(),input.streetAddress(),input.city(),input.state(),input.country(),input.zipCode(),input.taxNumber()))
   if(value!=null&&value.length()>255)throw new ApiException(400,"Customer text fields must be at most 255 characters");
  c.code=code;c.name=name;c.invoiceName=text(input.invoiceName());c.company=text(input.company());
  c.email=email.isEmpty()?null:email;c.phone=text(input.phone());c.streetAddress=text(input.streetAddress());
  c.city=text(input.city());c.state=text(input.state());c.country=text(input.country());
  c.zipCode=text(input.zipCode());c.taxNumber=text(input.taxNumber());c.notes=text(input.notes());
  c.status=statuses.resolve("customers",input.statusId());
  return CustomerResponse.from(customers.saveAndFlush(c));
 }
 public void delete(Long id){
  Customer c=get(id);
  if(documents.existsByCustomerId(id))throw new ApiException(409,"Customer is used by quotations or invoices");
  customers.delete(c);customers.flush();
 }
}
