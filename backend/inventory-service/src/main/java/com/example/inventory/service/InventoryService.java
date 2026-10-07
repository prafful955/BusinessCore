package com.example.inventory.service;
import com.example.inventory.entity.*;
import com.example.inventory.repository.*;
import com.example.inventory.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.time.LocalDate;
import java.math.*;
@Service @Transactional
public class InventoryService{
 private final InventoryDocumentRepository documents;
 private final OrganizationService organizations;
 private final StockService stocks;
 private final String currency;
 public InventoryService(InventoryDocumentRepository d,OrganizationService o,StockService s,@org.springframework.beans.factory.annotation.Value("${app.dashboard.currency:USD}") String currency){documents=d;organizations=o;stocks=s;this.currency=java.util.Currency.getInstance(currency).getCurrencyCode();}
 private InventoryDocument get(String kind,Long id){return documents.findById(id).filter(d->kind.equals(d.kind)).orElseThrow(()->new ApiException(404,"Inventory document not found"));}
 public List<InventoryResponse> all(String kind){return documents.findByKindOrderByIdDesc(kind).stream().map(InventoryResponse::from).toList();}
 public InventoryResponse one(String kind,Long id){return InventoryResponse.from(get(kind,id));}
 private void version(InventoryDocument d,Long v){if(v==null||!v.equals(d.version))throw new ApiException(409,"Document changed; reload before saving or posting");}
 public InventoryResponse save(String kind,Long id,InventoryRequest r){
  InventoryDocument d=id==null?new InventoryDocument():get(kind,id);
  if(id!=null){version(d,r.version());if(!d.status.equals("Draft"))throw new ApiException(409,"Posted documents cannot be edited");}
  if(r.number()==null||r.number().isBlank()||r.number().length()>100)throw new ApiException(400,"Number is required and must be at most 100 characters");
  for(var other:documents.findByKindOrderByIdDesc(kind))if(!Objects.equals(other.id,id)&&other.number.equalsIgnoreCase(r.number().trim()))throw new ApiException(409,"Number already exists");
  if(r.warehouseId()==null)throw new ApiException(400,"Warehouse is required");
  d.warehouse=organizations.get("warehouses",r.warehouseId());
  if(kind.equals("stock-transfers")){
   if(r.destinationId()==null||r.destinationId().equals(r.warehouseId()))throw new ApiException(400,"Choose a different destination warehouse");
   d.destination=organizations.get("warehouses",r.destinationId());
   if(!d.warehouse.parent.parent.id.equals(d.destination.parent.parent.id))throw new ApiException(400,"Transfers must stay within the same company");
  }else{
   if(r.supplierName()==null||r.supplierName().isBlank()||r.supplierName().length()>255)throw new ApiException(400,"Supplier name is required");
   d.supplierName=r.supplierName().trim();
  }
  if(r.documentDate()==null||!r.documentDate().matches("\\d{4}-\\d{2}-\\d{2}"))throw new ApiException(400,"Valid document date is required");
  try{d.documentDate=LocalDate.parse(r.documentDate());}catch(Exception e){throw new ApiException(400,"Invalid date");}
  d.purchaseOrder=null;
  if(r.purchaseOrderId()!=null){
   if(!kind.equals("purchases"))throw new ApiException(400,"Only purchases may reference a purchase order");
   var po=get("purchase-orders",r.purchaseOrderId());
   if(!po.status.equals("Ordered")||!po.warehouse.id.equals(d.warehouse.id)||!po.supplierName.equalsIgnoreCase(d.supplierName))throw new ApiException(400,"Purchase order must be ordered with the same warehouse and supplier");
   d.purchaseOrder=po;
  }
  if(r.lines()==null||r.lines().isEmpty()||r.lines().size()>500)throw new ApiException(400,"Add 1 to 500 product lines");
  d.lines.clear();BigDecimal total=BigDecimal.ZERO;
  for(var line:r.lines()){
   if(line==null)throw new ApiException(400,"Invalid line");
   stocks.validateQuantity(line.quantity(),false);
   BigDecimal cost=kind.equals("stock-transfers")?BigDecimal.ZERO:line.unitCost();
   if(cost==null||cost.signum()<0||cost.scale()>4||cost.precision()-cost.scale()>15)throw new ApiException(400,"Unit cost must be nonnegative with at most four decimal places");
   var item=new InventoryLine();item.product=stocks.product(line.productId());item.quantity=line.quantity();item.unitCost=cost;
   d.lines.add(item);total=total.add(cost.multiply(item.quantity).setScale(2,RoundingMode.HALF_UP));
  }
  if(total.precision()>19)throw new ApiException(400,"Total is too large");
  if(d.currency==null)d.currency=currency;
  d.total=total;d.kind=kind;d.number=r.number().trim();d.notes=r.notes()==null?"":r.notes();
  if(d.notes.length()>255)throw new ApiException(400,"Notes must be at most 255 characters");
  return InventoryResponse.from(documents.saveAndFlush(d));
 }
 public InventoryResponse post(String kind,Long id,Long v){
  var d=documents.lock(id).filter(doc->kind.equals(doc.kind)).orElseThrow(()->new ApiException(404,"Document not found"));
  version(d,v);if(!d.status.equals("Draft"))throw new ApiException(409,"Document has already been posted");
  if(kind.equals("purchase-orders")){d.status="Ordered";return InventoryResponse.from(documents.saveAndFlush(d));}
  if(kind.equals("purchases")&&d.purchaseOrder!=null){
   var po=documents.lock(d.purchaseOrder.id).orElseThrow();
   if(!po.status.equals("Ordered"))throw new ApiException(409,"Purchase order is not ordered");
   Map<Long,BigDecimal> remaining=new HashMap<>();
   for(var l:po.lines)remaining.merge(l.product.id,l.quantity,BigDecimal::add);
   for(var receipt:documents.findByKindOrderByIdDesc("purchases")){
    if(receipt.status.equals("Received")&&receipt.purchaseOrder!=null&&receipt.purchaseOrder.id.equals(po.id))
     for(var l:receipt.lines)remaining.merge(l.product.id,l.quantity.negate(),BigDecimal::add);
   }
   for(var l:d.lines){
    BigDecimal next=remaining.getOrDefault(l.product.id,BigDecimal.ZERO).subtract(l.quantity);
    if(next.signum()<0)throw new ApiException(409,"Receipt exceeds purchase order quantity");
    remaining.put(l.product.id,next);
   }
  }
  OrganizationUnit source,destination=null;
  if(kind.equals("stock-transfers")){
   // Consistent lock order avoids transfer deadlocks.
   var first=stocks.lockWarehouse(Math.min(d.warehouse.id,d.destination.id));
   var second=stocks.lockWarehouse(Math.max(d.warehouse.id,d.destination.id));
   source=first.id.equals(d.warehouse.id)?first:second;destination=first.id.equals(d.destination.id)?first:second;
  }else source=stocks.lockWarehouse(d.warehouse.id);
  for(var l:d.lines){
   if(destination!=null){
    stocks.apply(source,l.product,l.quantity.negate(),"Transfer "+d.number,"Transfer",d.id);
    stocks.apply(destination,l.product,l.quantity,"Transfer "+d.number,"Transfer",d.id);
   }else stocks.apply(source,l.product,l.quantity,"Purchase "+d.number,"Purchase",d.id);
  }
  d.status=destination==null?"Received":"Posted";return InventoryResponse.from(documents.saveAndFlush(d));
 }
 public void delete(String kind,Long id,Long v){
  var d=get(kind,id);version(d,v);
  if(!d.status.equals("Draft")||documents.existsByPurchaseOrderId(id))throw new ApiException(409,"Only unreferenced draft documents can be deleted");
  documents.delete(d);documents.flush();
 }
}
