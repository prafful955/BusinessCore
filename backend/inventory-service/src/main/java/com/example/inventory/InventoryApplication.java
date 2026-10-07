package com.example.inventory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages={"com.example.inventory","com.example.audit"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages={"com.example.inventory.entity","com.example.audit"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages={"com.example.inventory.repository","com.example.audit"}) public class InventoryApplication {public static void main(String[] args){SpringApplication.run(InventoryApplication.class,args);}}
