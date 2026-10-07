package com.example.user.service;
public class ApiException extends RuntimeException  {
    public final int status;
    public ApiException(int s,String m) {
        super(m);
        status=s;
    }
}
