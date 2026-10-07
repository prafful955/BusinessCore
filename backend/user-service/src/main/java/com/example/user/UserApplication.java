package com.example.user;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages={"com.example.user","com.example.audit"})
@org.springframework.boot.autoconfigure.domain.EntityScan(basePackages={"com.example.user.entity","com.example.audit"})
@org.springframework.data.jpa.repository.config.EnableJpaRepositories(basePackages={"com.example.user.repository","com.example.audit"}) public class UserApplication  {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class,args);
    }
}
