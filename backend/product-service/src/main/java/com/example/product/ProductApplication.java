package com.example.product;
import org.springframework.boot.SpringApplication; import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages={"com.example.product","com.example.audit"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages={"com.example.product.entity","com.example.audit"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages={"com.example.product.repository","com.example.audit"}) public class ProductApplication { public static void main(String[] args){ SpringApplication.run(ProductApplication.class,args); } }
