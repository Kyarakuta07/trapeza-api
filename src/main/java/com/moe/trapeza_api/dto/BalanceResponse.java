package com.moe.trapeza_api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BalanceResponse {
    private boolean success;
    private int balance;
    private String message;

    // Factory method untuk sukses
    public static BalanceResponse success(int balance) {
        return new BalanceResponse(true, balance, "Balance retrieved");
    }
}