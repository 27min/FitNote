package com.fitnote.server.domain.history.dto;

import java.time.LocalDateTime;

public record HistoryResponse(
        Long id,
        String title,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        String notes) {
}
