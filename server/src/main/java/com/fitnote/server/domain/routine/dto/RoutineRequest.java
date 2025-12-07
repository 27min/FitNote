package com.fitnote.server.domain.routine.dto;

import jakarta.validation.constraints.NotBlank;

public record RoutineRequest(
        @NotBlank String name,
        String description) {
}
