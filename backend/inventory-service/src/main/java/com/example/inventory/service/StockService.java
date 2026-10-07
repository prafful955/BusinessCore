package com.example.inventory.service;
import com.example.inventory.entity.*;
import com.example.inventory.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.math.BigDecimal;
import java.time.Instant;
@Service @Transactional
public class StockService{
 public record Adjustment(Long productId,Long warehouseId,BigDecimal quantity,String reason,Long version){}
 public record Response(Long id,Long productId,String productName,Long warehouseId,String warehouseName,BigDecimal quantity,Long version,String status){
  public static Response from(StockBalance b){return new Response(b.id,b.product.id,b.product.name,b.warehouse.id,b.warehouse.name,b.quantity,b.version,"Available");}
 }
 public record Movement(Long id,BigDecimal quantity,String reason,String source,Long sourceId,Instant occurredAt){}
 private final StockBalanceRepository balances;
 private final StockMovementRepository movements;
 private final OrganizationRepository organizations;
 private final StockProductRepository products;
 public StockService(StockBalanceRepository b,StockMovementRepository m,OrganizationRepository o,StockProductRepository p){balances=b;movements=m;organizations=o;products=p;}
 public List<Response> all(){return balances.findAll().stream().map(Response::from).toList();}
 public Response one(Long id){return Response.from(get(id));}
 private StockBalance get(Long id){return balances.findById(id).orElseThrow(()->new ApiException(404,"Stock record not found"));}
 public List<Movement> history(Long id){get(id);return movements.findByBalanceIdOrderByIdDesc(id).stream().map(m->new Movement(m.id,m.quantity,m.reason,m.source,m.sourceId,m.occurredAt)).toList();}
 public OrganizationUnit lockWarehouse(Long id){
  if(id==null)throw new ApiException(400,"Warehouse is required");
  var w=organizations.lock(id).filter(o->o.kind.equals("warehouses")).orElseThrow(()->new ApiException(404,"Warehouse not found"));
  if(!"Active".equals(w.status)||!"Active".equals(w.parent.status)||!"Active".equals(w.parent.parent.status))throw new ApiException(409,"Warehouse, location and company must be active");
  return w;
 }
 public StockProduct product(Long id){
  if(id==null)throw new ApiException(400,"Product is required");
  return products.findById(id).orElseThrow(()->new ApiException(404,"Product not found"));
 }
 public List<Map<String,Object>> products(){return products.findAll().stream().map(p->Map.<String,Object>of("id",p.id,"name",p.name==null?"":p.name)).toList();}
 public void validateQuantity(BigDecimal quantity,boolean signed){
  if(quantity==null||quantity.signum()==0||!signed&&quantity.signum()<0||quantity.scale()>3||quantity.precision()-quantity.scale()>16)throw new ApiException(400,"Quantity must be nonzero with at most three decimal places");
 }
 public Response adjust(Adjustment r){
  validateQuantity(r.quantity(),true);
  if(r.reason()==null||r.reason().isBlank()||r.reason().length()>255)throw new ApiException(400,"Adjustment reason is required and must be at most 255 characters");
  var warehouse=lockWarehouse(r.warehouseId());var product=product(r.productId());
  var existing=balances.findByProductIdAndWarehouseId(product.id,warehouse.id);
  if(existing.isPresent()&&(r.version()==null||!r.version().equals(existing.get().version)))throw new ApiException(409,"Stock changed; reload before adjusting");
  if(existing.isEmpty()&&r.version()!=null)throw new ApiException(409,"Stock record changed; reload before adjusting");
  return apply(warehouse,product,r.quantity(),r.reason().trim(),"Adjustment",null);
 }
 // Caller holds the warehouse lock; all stock writes use this method.
 public Response apply(OrganizationUnit warehouse,StockProduct product,BigDecimal delta,String reason,String source,Long sourceId){
  StockBalance balance=balances.findByProductIdAndWarehouseId(product.id,warehouse.id).orElseGet(()->{
   var b=new StockBalance();b.warehouse=warehouse;b.product=product;return b;
  });
  BigDecimal next=balance.quantity.add(delta).setScale(3);
  if(next.signum()<0)throw new ApiException(409,"Insufficient stock for "+product.name);
  if(next.precision()>19)throw new ApiException(400,"Stock balance is too large");
  balance.quantity=next;balances.saveAndFlush(balance);
  var movement=new StockMovement();movement.balance=balance;movement.quantity=delta;movement.reason=reason;
  movement.source=source;movement.sourceId=sourceId;movement.occurredAt=Instant.now();movements.save(movement);
  return Response.from(balance);
 }
}
