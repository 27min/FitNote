package com.fitnote.server.domain.history.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Service;

import com.fitnote.server.domain.history.dto.HistoryCreateRequest;
import com.fitnote.server.domain.history.dto.HistoryResponse;

@Service
public class HistoryService {

    private final AtomicLong idGenerator = new AtomicLong(1L);
    private final Map<Long, List<HistoryResponse>> storage = new ConcurrentHashMap<>();

    public List<HistoryResponse> findByUser(Long userId) {
        return storage.getOrDefault(userId, List.of()).stream()
                .sorted(Comparator.comparing(HistoryResponse::startedAt).reversed())
                .toList();
    }

    public HistoryResponse addHistory(Long userId, HistoryCreateRequest request) {
        HistoryResponse response = new HistoryResponse(
                idGenerator.getAndIncrement(),
                request.title(),
                request.startedAt() != null ? request.startedAt() : LocalDateTime.now(),
                request.endedAt(),
                request.notes());

        storage.computeIfAbsent(userId, key -> new ArrayList<>()).add(response);
        return response;
    }
}
