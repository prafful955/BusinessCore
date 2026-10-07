package com.example.user.repository;
import com.example.user.entity.DashboardOrder;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.data.repository.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface DashboardOrderRepository extends Repository<DashboardOrder,Long>  {
    @Query("select coalesce(sum(o.total),0) from DashboardOrder o where (:category is null or o.category = :category)")
    BigDecimal total(@Param("category") String category);
    @Query("select coalesce(sum(o.total),0) from DashboardOrder o where (:category is null or o.category = :category) and o.createdAt >= :start and o.createdAt < :end")
    BigDecimal periodTotal(@Param("category") String category,@Param("start") Instant start,@Param("end") Instant end);
}
