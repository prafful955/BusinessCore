package com.example.user.service;
import com.example.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;
import java.math.BigDecimal;
import java.time.*;
@Service
public class DashboardService  {
    private static final Set<String> CATEGORIES=Set.of("Bedding","Appliances","Electronics","Sales","Orders","Deliveries","Collection","Purchase");
    private final DashboardEntryRepository repository;
    private final DashboardOrderRepository orders;
    private final String currency;
    private final ZoneId zone;
    public record Metric(String key,String label,BigDecimal amount)  {
    }
    public record Summary(String currency,Instant updatedAt,List<Metric> metrics)  {
    }
    public DashboardService(DashboardEntryRepository r,DashboardOrderRepository o,@Value("${app.dashboard.currency:USD}") String c,@Value("${app.dashboard.zone:Asia/Kolkata}") String z) {
        repository=r;
        orders=o;
        currency=Currency.getInstance(c).getCurrencyCode();
        zone=ZoneId.of(z);
    }
    public Summary summary(String category) {
        if(!CATEGORIES.contains(category))throw new ApiException(400,"Unknown dashboard category");
        Instant now=Instant.now();
        Map<String,Metric> metrics=new LinkedHashMap<>();
        if(Set.of("Bedding","Appliances","Electronics","Orders").contains(category)) {
            String filter=category.equals("Orders")?null:category;
            LocalDate today=now.atZone(zone).toLocalDate();
            Instant dayStart=today.atStartOfDay(zone).toInstant(),dayEnd=today.plusDays(1).atStartOfDay(zone).toInstant();
            Instant monthStart=today.withDayOfMonth(1).atStartOfDay(zone).toInstant(),monthEnd=today.withDayOfMonth(1).plusMonths(1).atStartOfDay(zone).toInstant();
            metrics.put("orders-today",new Metric("orders-today","Orders Today",orders.periodTotal(filter,dayStart,dayEnd)));
            metrics.put("orders-month",new Metric("orders-month","Orders This Month",orders.periodTotal(filter,monthStart,monthEnd)));
            metrics.put("orders-total",new Metric("orders-total","Orders All Time",orders.total(filter)));
        }
        Map<String,Metric> ledger=new LinkedHashMap<>();
        for(var entry:repository.findByCategory(category)) {
            if(metrics.containsKey(entry.metricKey))continue;
            // Order keys are derived exclusively from order records.
            Metric old=ledger.get(entry.metricKey);
            ledger.put(entry.metricKey,new Metric(entry.metricKey,entry.label,entry.amount.add(old==null?BigDecimal.ZERO:old.amount())));
        }
        metrics.putAll(ledger);
        return new Summary(currency,now,new ArrayList<>(metrics.values()));
    }
}
