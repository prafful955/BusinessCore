package com.example.product.service;
public class CategoryException extends RuntimeException {
 public final int status;
 public CategoryException(int status,String message){super(message);this.status=status;}
}
