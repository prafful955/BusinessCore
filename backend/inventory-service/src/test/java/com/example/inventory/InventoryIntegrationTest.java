package com.example.inventory;
import com.example.inventory.dto.*;
import com.example.inventory.entity.*;
import com.example.inventory.repository.*;
import com.example.inventory.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest
class InventoryIntegrationTest {
 @Autowired OrganizationService organizations;
 @Autowired InventoryService inventory;
 @Autowired StockService stocks;
 @Autowired StockProductRepository products;
 private record Setup(Long source,Long destination,Long product,Long second){}
 private Setup setup(){
  String code=UUID.randomUUID().toString();
  var company=organizations.save("companies",null,new OrganizationRequest(code,"Company","","Active",null,null));
  var location=organizations.save("business-locations",null,new OrganizationRequest(code,"Location","","Active",company.id(),null));
  var source=organizations.save("warehouses",null,new OrganizationRequest(code,"Source","","Active",location.id(),null));
  var destination=organizations.save("warehouses",null,new OrganizationRequest(code+"-2","Destination","","Active",location.id(),null));
  var p=new StockProduct();p.name="Product "+code;p.price=BigDecimal.TEN;products.saveAndFlush(p);
  var q=new StockProduct();q.name="Second "+code;q.price=BigDecimal.ONE;products.saveAndFlush(q);
  return new Setup(source.id(),destination.id(),p.id,q.id);
 }
 private InventoryRequest request(String number,Setup s,Long order,Long destination,List<InventoryRequest.Line> lines){
  return new InventoryRequest(number+"-"+UUID.randomUUID(),"Supplier","2026-10-07","",s.source(),destination,order,null,lines);
 }
 private InventoryRequest.Line line(Long id,String quantity){
  return new InventoryRequest.Line(id,new BigDecimal(quantity),BigDecimal.TEN);
 }
 private BigDecimal quantity(Long warehouse,Long product){
  return stocks.all().stream().filter(r->r.warehouseId().equals(warehouse)&&r.productId().equals(product))
   .map(StockService.Response::quantity).findFirst().orElse(BigDecimal.ZERO);
 }
 @Test void purchaseReceiptsRespectRemainingOrderQuantityAndCannotPostTwice(){
  var s=setup();
  var po=inventory.save("purchase-orders",null,request("PO",s,null,null,List.of(line(s.product(),"5"))));
  var placed=inventory.post("purchase-orders",po.id(),po.version());
  assertEquals("Ordered",placed.status());
  assertEquals(0,quantity(s.source(),s.product()).signum());
  var purchase=inventory.save("purchases",null,request("REC1",s,po.id(),null,List.of(line(s.product(),"3"))));
  var receipt=inventory.post("purchases",purchase.id(),purchase.version());
  assertEquals("Received",receipt.status());
  assertEquals(0,new BigDecimal("3").compareTo(quantity(s.source(),s.product())));
  assertEquals(409,assertThrows(ApiException.class,()->inventory.post("purchases",receipt.id(),receipt.version())).status);
  var excess=inventory.save("purchases",null,request("REC2",s,po.id(),null,List.of(line(s.product(),"3"))));
  assertEquals(409,assertThrows(ApiException.class,()->inventory.post("purchases",excess.id(),excess.version())).status);
  assertEquals("Draft",inventory.one("purchases",excess.id()).status());
  assertEquals(0,new BigDecimal("3").compareTo(quantity(s.source(),s.product())));
 }
 @Test void failedTransferRollsBackEveryLineAndItsMovementHistory(){
  var s=setup();
  var initial=stocks.adjust(new StockService.Adjustment(s.product(),s.source(),new BigDecimal("5"),"Opening",null));
  stocks.adjust(new StockService.Adjustment(s.second(),s.source(),BigDecimal.ONE,"Opening",null));
  var transfer=inventory.save("stock-transfers",null,request("T1",s,null,s.destination(),
   List.of(line(s.product(),"2"),line(s.second(),"2"))));
  assertEquals(409,assertThrows(ApiException.class,()->inventory.post("stock-transfers",transfer.id(),transfer.version())).status);
  assertEquals(0,new BigDecimal("5").compareTo(quantity(s.source(),s.product())));
  assertEquals(0,quantity(s.destination(),s.product()).signum());
  assertEquals(1,stocks.history(initial.id()).size());
  assertEquals("Draft",inventory.one("stock-transfers",transfer.id()).status());
 }
 @Test void transferPreservesCombinedStockAndAdjustmentsCheckVersions(){
  var s=setup();
  var initial=stocks.adjust(new StockService.Adjustment(s.product(),s.source(),new BigDecimal("5"),"Opening",null));
  var transfer=inventory.save("stock-transfers",null,request("T1",s,null,s.destination(),List.of(line(s.product(),"2"))));
  var posted=inventory.post("stock-transfers",transfer.id(),transfer.version());
  assertEquals("Posted",posted.status());
  assertEquals(0,new BigDecimal("5").compareTo(quantity(s.source(),s.product()).add(quantity(s.destination(),s.product()))));
  assertEquals(409,assertThrows(ApiException.class,()->stocks.adjust(
   new StockService.Adjustment(s.product(),s.source(),BigDecimal.ONE,"Stale",initial.version()))).status);
  var current=stocks.one(initial.id());
  assertEquals(409,assertThrows(ApiException.class,()->stocks.adjust(
   new StockService.Adjustment(s.product(),s.source(),new BigDecimal("-10"),"Insufficient",current.version()))).status);
  assertEquals(0,new BigDecimal("3").compareTo(quantity(s.source(),s.product())));
  assertEquals(409,assertThrows(ApiException.class,()->inventory.delete("stock-transfers",posted.id(),posted.version())).status);
 }
}
