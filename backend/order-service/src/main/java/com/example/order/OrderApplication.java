package com.example.order;
import org.springframework.boot.SpringApplication; import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages={"com.example.order","com.example.audit"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages={"com.example.order.entity","com.example.audit"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages={"com.example.order.repository","com.example.audit"}) public class OrderApplication { public static void main(String[] args){ SpringApplication.run(OrderApplication.class,args); } }
