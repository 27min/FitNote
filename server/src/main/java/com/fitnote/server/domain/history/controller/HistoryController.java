package com.fitnote.server.domain.history.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitnote.server.config.security.user.UserPrincipal;
import com.fitnote.server.domain.history.dto.HistoryCreateRequest;
import com.fitnote.server.domain.history.dto.HistoryResponse;
import com.fitnote.server.domain.history.service.HistoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final HistoryService historyService;

    public HistoryController(HistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<HistoryResponse>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<HistoryResponse> history = historyService.findByUser(principal.getId());
        return ResponseEntity.ok(history);
    }

    @PostMapping
    public ResponseEntity<HistoryResponse> addHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HistoryCreateRequest request) {
        HistoryResponse saved = historyService.addHistory(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
