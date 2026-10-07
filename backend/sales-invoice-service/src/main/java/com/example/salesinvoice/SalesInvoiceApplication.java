package com.example.salesinvoice;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages={"com.example.salesinvoice","com.example.audit"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages={"com.example.salesinvoice.entity","com.example.audit"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages={"com.example.salesinvoice.repository","com.example.audit"}) public class SalesInvoiceApplication {public static void main(String[] args){SpringApplication.run(SalesInvoiceApplication.class,args);}}
