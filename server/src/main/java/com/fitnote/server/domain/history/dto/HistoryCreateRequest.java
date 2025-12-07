package com.fitnote.server.domain.history.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;

public record HistoryCreateRequest(
        @NotBlank String title,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        String notes) {
}
