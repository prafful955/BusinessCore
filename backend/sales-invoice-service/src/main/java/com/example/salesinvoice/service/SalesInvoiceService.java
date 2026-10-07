package com.example.salesinvoice.service;
import com.example.salesinvoice.dto.*;
import com.example.salesinvoice.entity.*;
import com.example.salesinvoice.repository.BusinessDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;
import java.time.*;
import java.math.*;
@Service @Transactional
public class SalesInvoiceService {
 private final BusinessDocumentRepository documents;
 private final CustomerService customers;
 private final StatusService statuses;
 private final String currency;
 public SalesInvoiceService(BusinessDocumentRepository d,CustomerService c,StatusService s,
  @Value("${app.dashboard.currency:USD}") String currency){
  documents=d;customers=c;statuses=s;this.currency=Currency.getInstance(currency).getCurrencyCode();
 }
 private void scope(String kind){if(!kind.equals("sales-invoices"))throw new ApiException(400,"Document type belongs to another service");}
 public BusinessDocument get(String kind,Long id){
  scope(kind);
  return documents.findById(id).filter(d->d.kind.equals(kind))
   .orElseThrow(()->new ApiException(404,"Document not found"));
 }
 public DocumentResponse one(String kind,Long id){return DocumentResponse.from(get(kind,id));}
 public List<DocumentResponse> all(String kind){
  scope(kind);
  return documents.findByKindOrderByIdDesc(kind).stream().map(DocumentResponse::from).toList();
 }
 private LocalDate date(String value,boolean required){
  if(value==null||value.isBlank()){
   if(required)throw new ApiException(400,"Document date is required");
   return null;
  }
  try{
   if(!value.matches("\\d{4}-\\d{2}-\\d{2}"))throw new IllegalArgumentException();
   return LocalDate.parse(value);
  }catch(Exception e){throw new ApiException(400,"Dates must be valid YYYY-MM-DD values");}
 }
 public DocumentResponse save(String kind,Long id,DocumentRequest input){
  scope(kind);
  BusinessDocument d=id==null?new BusinessDocument():get(kind,id);
  if(input.number()==null||input.number().isBlank()||input.number().trim().length()>100)
   throw new ApiException(400,"Document number must contain 1 to 100 characters");
  String number=input.number().trim();
  documents.findByKindAndNumberIgnoreCase(kind,number).filter(other->!Objects.equals(other.id,id))
   .ifPresent(other->{throw new ApiException(409,"Document number already exists");});
  if(input.customerId()==null)throw new ApiException(400,"Customer is required");
  Customer customer=customers.get(input.customerId());
  if(d.customer==null||!d.customer.id.equals(customer.id)){
   d.customerName=customer.name;
   d.billingAddress=java.util.stream.Stream.of(customer.streetAddress,customer.city,customer.state,customer.zipCode,customer.country).filter(v->v!=null&&!v.isBlank()).collect(java.util.stream.Collectors.joining(", "));
   d.invoiceName=customer.invoiceName==null||customer.invoiceName.isBlank()?customer.name:customer.invoiceName;
  }
  d.customer=customer;d.status=statuses.resolve(kind,input.statusId());
  d.documentDate=date(input.documentDate(),true);d.dueDate=date(input.dueDate(),false);
  if(d.dueDate!=null&&d.dueDate.isBefore(d.documentDate))throw new ApiException(400,"Due date cannot be before document date");
  BigDecimal tax=input.taxPercent()==null?BigDecimal.ZERO:input.taxPercent();
  if(tax.signum()<0||tax.compareTo(new BigDecimal("100"))>0||tax.scale()>4)
   throw new ApiException(400,"Tax percentage must be 0 to 100 with at most four decimal places");
  if(input.lines()==null||input.lines().isEmpty()||input.lines().size()>500)
   throw new ApiException(400,"Add 1 to 500 line items");
  d.lines.clear();BigDecimal subtotal=BigDecimal.ZERO;
  for(var line:input.lines()){
   if(line==null||line.description()==null||line.description().isBlank()||line.description().length()>255
    ||line.quantity()==null||line.quantity().signum()<=0||line.quantity().scale()>3||line.quantity().precision()-line.quantity().scale()>16
    ||line.unitPrice()==null||line.unitPrice().signum()<0||line.unitPrice().scale()>4||line.unitPrice().precision()-line.unitPrice().scale()>15)
    throw new ApiException(400,"Each item needs a description, positive quantity and nonnegative unit price");
   DocumentLine item=new DocumentLine();item.description=line.description().trim();
   item.quantity=line.quantity();item.unitPrice=line.unitPrice();
   item.lineTotal=item.quantity.multiply(item.unitPrice).setScale(2,RoundingMode.HALF_UP);
   if(item.lineTotal.precision()>19)throw new ApiException(400,"Line total is too large");
   d.lines.add(item);subtotal=subtotal.add(item.lineTotal);
  }
  d.kind=kind;d.number=number;d.subtotal=subtotal.setScale(2);d.taxPercent=tax;
  d.taxAmount=subtotal.multiply(tax).divide(new BigDecimal("100"),2,RoundingMode.HALF_UP);
  d.total=d.subtotal.add(d.taxAmount);
  if(d.total.precision()>19)throw new ApiException(400,"Document total is too large");
  d.currency=currency;d.notes=input.notes()==null?"":input.notes();
  if(d.createdAt==null)d.createdAt=Instant.now();
  return DocumentResponse.from(documents.saveAndFlush(d));
 }
 public void delete(String kind,Long id){documents.delete(get(kind,id));documents.flush();}
}
