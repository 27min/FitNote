/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Record.java to edit this template
 */

package com.fitnote.server.domain.auth.dto;

public record JwtResponse(String accessToken, long expiresInSeconds, String tokenType) {
    public JwtResponse(String accessToken, long expiresInSeconds) {
        this(accessToken, expiresInSeconds, "Bearer");
    }
}
