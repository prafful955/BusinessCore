package com.example.user.config;
import com.example.user.service.*;
import com.example.user.entity.Employee;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.*;
@Configuration public class AccessConfig implements WebMvcConfigurer  {
    private final AuthService auth;
    private final boolean enabled;
    public AccessConfig(AuthService a,@Value("${app.auth.enabled:false}") boolean e) {
        auth=a;
        enabled=e;
    }
    @Override public void addInterceptors(InterceptorRegistry r) {
        r.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest q,HttpServletResponse p,Object h) {
                String path=q.getRequestURI();
                if(!enabled||"OPTIONS".equals(q.getMethod())||path.startsWith("/api/auth/"))return true;
                Employee e=auth.authenticate(q.getHeader("Authorization"));
                q.setAttribute(com.example.audit.AuditContext.ACTOR_ATTRIBUTE,"employee:"+e.id);
                String module=path.startsWith("/api/employees")?"employees":path.startsWith("/api/roles")?"roles":path.startsWith("/api/dashboard")?"dashboards":path.startsWith("/api/locations")?"locations":"system";
                
if(path.startsWith("/api/customers"))module="customers";
                else if(path.startsWith("/api/quotations"))module="quotations";
                else if(path.startsWith("/api/invoices")||path.startsWith("/api/sales-invoices"))module="sales";
                else if(path.startsWith("/api/lookup-values"))module="settings";
                else if(path.equals("/api/statuses")){
                    String scope=q.getParameter("scope");
                    module=switch(scope==null?"":scope){
                        case "customers"->"customers";
                        case "sales-orders"->"orders";
                        case "quotations"->"quotations";
                        case "invoices","sales-invoices"->"sales";
                        default->"settings";
                    };
                }
                
if(path.startsWith("/api/sales-orders"))module="orders";
                else if(path.startsWith("/api/purchases")||path.startsWith("/api/purchase-orders"))module="purchases";
                else if(path.startsWith("/api/stocks")||path.startsWith("/api/stock-transfers")||path.startsWith("/api/stock-products"))module="inventory";
                else if(path.startsWith("/api/business-locations")||path.startsWith("/api/warehouses"))module="locations";
                else if(path.startsWith("/api/companies"))module="settings";
                String action=switch(q.getMethod()) {
                    case "POST"->"create";
                    case "PUT","PATCH"->"update";
                    case "DELETE"->"delete";
                    default->"view";
                }
                ;
                if(path.endsWith("/post")||path.equals("/api/stocks/adjustments"))action="update";
                if(!e.assignedRole.permissions.contains(module+"."+action))throw new ApiException(403,"Insufficient permissions");
                return true;
            }
        }
        ).addPathPatterns("/api/**");
    }
}
