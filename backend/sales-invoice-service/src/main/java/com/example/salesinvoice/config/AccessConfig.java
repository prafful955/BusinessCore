package com.example.salesinvoice.config;
import com.example.salesinvoice.service.ApiException;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.client.*;
import jakarta.servlet.http.*;
import java.util.Set;
@Configuration
public class AccessConfig implements WebMvcConfigurer {
 private final boolean enabled;
 private final RestClient client;
 public record CurrentUser(Long id,String name,String email,String role,Set<String> permissions){}
 public AccessConfig(@Value("${app.auth.enabled:false}") boolean enabled,
  @Value("${app.auth.user-service-url:http://localhost:8081}") String url){
  this.enabled=enabled;this.client=RestClient.create(url);
 }
 @Override public void addInterceptors(InterceptorRegistry registry){
  registry.addInterceptor(new HandlerInterceptor(){
   @Override public boolean preHandle(HttpServletRequest request,HttpServletResponse response,Object handler){
    if(!enabled||request.getMethod().equals("OPTIONS"))return true;
    String header=request.getHeader("Authorization");
    if(header==null||!header.startsWith("Bearer "))throw new ApiException(401,"Bearer authentication required");
    CurrentUser user;
    try{user=client.get().uri("/api/auth/me").header("Authorization",header).retrieve().body(CurrentUser.class);}
    catch(RestClientResponseException e){
     int code=e.getStatusCode().value();
     if(code==401||code==403)throw new ApiException(code,"Session is invalid or access is denied");
     throw new ApiException(503,"Authentication service is unavailable");
    }catch(RestClientException e){throw new ApiException(503,"Authentication service is unavailable");}
    if(user==null||user.permissions()==null)throw new ApiException(401,"Invalid session");
    request.setAttribute(com.example.audit.AuditContext.ACTOR_ATTRIBUTE,"employee:"+user.id());
    String path=request.getRequestURI();
    String module="sales";
    String action=switch(request.getMethod()){case "POST"->"create";case "PUT","PATCH"->"update";case "DELETE"->"delete";default->"view";};
    if(path.endsWith("/post")||path.equals("/api/stocks/adjustments"))action="update";
    if(!user.permissions().contains(module+"."+action))throw new ApiException(403,"Insufficient permissions");
    return true;
   }
  }).addPathPatterns("/api/**");
 }
}
