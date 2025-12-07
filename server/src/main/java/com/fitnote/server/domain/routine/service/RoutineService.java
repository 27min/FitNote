package com.fitnote.server.domain.routine.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fitnote.server.domain.routine.dto.RoutineRequest;
import com.fitnote.server.domain.routine.dto.RoutineResponse;

@Service
public class RoutineService {

    private final AtomicLong idGenerator = new AtomicLong(1L);
    private final Map<Long, Map<Long, RoutineResponse>> storage = new ConcurrentHashMap<>();

    public List<RoutineResponse> findAllByUser(Long userId) {
        return storage.getOrDefault(userId, Map.of()).values().stream()
                .sorted(Comparator.comparing(RoutineResponse::id))
                .toList();
    }

    public RoutineResponse findById(Long userId, Long routineId) {
        RoutineResponse routine = storage.getOrDefault(userId, Map.of()).get(routineId);
        if (routine == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "루틴을 찾을 수 없습니다.");
        }
        return routine;
    }

    public RoutineResponse create(Long userId, RoutineRequest request) {
        RoutineResponse response = new RoutineResponse(
                idGenerator.getAndIncrement(),
                request.name(),
                request.description());

        storage.computeIfAbsent(userId, key -> new HashMap<>())
                .put(response.id(), response);
        return response;
    }

    public RoutineResponse update(Long userId, Long routineId, RoutineRequest request) {
        Map<Long, RoutineResponse> userRoutines = storage.get(userId);
        if (userRoutines == null || !userRoutines.containsKey(routineId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "루틴을 찾을 수 없습니다.");
        }

        RoutineResponse updated = new RoutineResponse(routineId, request.name(), request.description());
        userRoutines.put(routineId, updated);
        return updated;
    }

    public void delete(Long userId, Long routineId) {
        Map<Long, RoutineResponse> userRoutines = storage.get(userId);
        if (userRoutines == null || userRoutines.remove(routineId) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "루틴을 찾을 수 없습니다.");
        }
    }
}
