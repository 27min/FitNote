/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.auth.service;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fitnote.server.config.security.jwt.JwtTokenProvider;
import com.fitnote.server.config.security.user.UserPrincipal;
import com.fitnote.server.domain.auth.UnitSystem;
import com.fitnote.server.domain.auth.User;
import com.fitnote.server.domain.auth.dto.JwtResponse;
import com.fitnote.server.domain.auth.dto.LoginRequest;
import com.fitnote.server.domain.auth.dto.RegisterRequest;
import com.fitnote.server.domain.auth.repository.UserRepository;

/**
 *
 * @author sd207naver.com
 */
@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다.");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .unitSystem(request.unitSystem() != null ? request.unitSystem() : UnitSystem.KG)
                .timezone(request.timezone() != null ? request.timezone() : "Asia/Seoul")
                .build();

        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public JwtResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateAccessToken(principal);
        String refreshToken = jwtTokenProvider.generateRefreshToken(principal);

        long accessExpiresInSeconds = 
                Duration.ofMillis(jwtTokenProvider.getAccessTokenValidityMs()).toSeconds();
        long refreshExpiresInSeconds = 
                Duration.ofMillis(jwtTokenProvider.getRefreshTokenValidityMs()).toSeconds();

        return new JwtResponse(accessToken, accessExpiresInSeconds, refreshToken, refreshExpiresInSeconds);
    }

    @Transactional(readOnly = true)
    public JwtResponse refreshAccessToken(String refreshToken) {
        boolean isValid = jwtTokenProvider.validateToken(refreshToken);
        if (!isValid) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다.");
        }
        String email = jwtTokenProvider.getUsername(refreshToken);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "사용자를 찾을 수 없습니다."));
        
        UserPrincipal principal = UserPrincipal.from(user);
        String newAccessToken = jwtTokenProvider.generateAccessToken(principal);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(principal);

        long accessExpiresInSeconds =
                Duration.ofMillis(jwtTokenProvider.getAccessTokenValidityMs()).toSeconds();
        long refreshExpiresInSeconds =
                Duration.ofMillis(jwtTokenProvider.getRefreshTokenValidityMs()).toSeconds();

        return new JwtResponse(
                newAccessToken,
                accessExpiresInSeconds,
                newRefreshToken,
                refreshExpiresInSeconds);
    }

}
