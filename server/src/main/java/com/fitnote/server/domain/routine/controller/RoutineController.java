package com.fitnote.server.domain.routine.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fitnote.server.config.security.user.UserPrincipal;
import com.fitnote.server.domain.routine.dto.RoutineRequest;
import com.fitnote.server.domain.routine.dto.RoutineResponse;
import com.fitnote.server.domain.routine.service.RoutineService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @GetMapping
    public ResponseEntity<List<RoutineResponse>> getRoutines(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RoutineResponse> routines = routineService.findAllByUser(principal.getId());
        return ResponseEntity.ok(routines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineResponse> getRoutine(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id) {
        RoutineResponse routine = routineService.findById(principal.getId(), id);
        return ResponseEntity.ok(routine);
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> createRoutine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RoutineRequest request) {
        RoutineResponse created = routineService.create(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineResponse> updateRoutine(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            @Valid @RequestBody RoutineRequest request) {
        RoutineResponse updated = routineService.update(principal.getId(), id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoutine(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id) {
        routineService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
