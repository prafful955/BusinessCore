package com.example.product.aop;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;
import org.slf4j.*;
import java.util.concurrent.TimeUnit;
@Aspect @Component
public class CategoryOperationAspect {
 private static final Logger LOG=LoggerFactory.getLogger(CategoryOperationAspect.class);
 @Around("execution(public * com.example.product.controller.CategoryController.*(..))")
 public Object logOperation(ProceedingJoinPoint call) throws Throwable {
  long start=System.nanoTime();
  String operation=call.getSignature().getName();
  try {
   Object result=call.proceed();
   LOG.info("category operation={} result=success durationMs={}",operation,
    TimeUnit.NANOSECONDS.toMillis(System.nanoTime()-start));
   return result;
  }catch(Throwable failure){
   LOG.warn("category operation={} result=failure exception={} durationMs={}",operation,
    failure.getClass().getSimpleName(),TimeUnit.NANOSECONDS.toMillis(System.nanoTime()-start));
   throw failure;
  }
 }
}
