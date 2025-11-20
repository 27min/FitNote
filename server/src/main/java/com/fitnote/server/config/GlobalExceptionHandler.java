package com.fitnote.server.config;

import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import com.fitnote.server.common.dto.ErrorResponse;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

/**
 * 전역 예외 처리기
 * 모든 컨트롤러에서 발생하는 예외를 일관성 있게 처리합니다.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * ResponseStatusException 처리 (명시적인 HTTP 상태 코드와 함께 던져진 예외)
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex,
            WebRequest request) {

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());

        ErrorResponse errorResponse = new ErrorResponse(
                ex.getStatusCode().value(),
                status != null ? status.getReasonPhrase() : "Error",
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                path);

        logger.warn("ResponseStatusException: {} - {} at {}",
                ex.getStatusCode(), ex.getReason(), path);

        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    /**
     * 유효성 검증 실패 처리 (@Valid 어노테이션을 사용한 DTO 검증)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            WebRequest request) {

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "유효성 검증에 실패했습니다.",
                path);

        // 필드별 에러 메시지 추가
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errorResponse.addValidationError(fieldName, errorMessage);
        });

        logger.warn("Validation failed at {}: {}", path,
                errorResponse.getValidationErrors().stream()
                        .map(ve -> ve.getField() + "=" + ve.getMessage())
                        .collect(Collectors.joining(", ")));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Constraint 위반 처리 (경로 변수나 요청 파라미터 검증)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException ex,
            WebRequest request) {

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "요청 파라미터 검증에 실패했습니다.",
                path);

        // 제약조건 위반 상세 정보 추가
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String propertyPath = violation.getPropertyPath().toString();
            String message = violation.getMessage();
            errorResponse.addValidationError(propertyPath, message);
        }

        logger.warn("Constraint violation at {}: {}", path,
                errorResponse.getValidationErrors().stream()
                        .map(ve -> ve.getField() + "=" + ve.getMessage())
                        .collect(Collectors.joining(", ")));

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * IllegalArgumentException 처리 (잘못된 인자)
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            WebRequest request) {

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                ex.getMessage(),
                path);

        logger.warn("IllegalArgumentException at {}: {}", path, ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * 모든 예외에 대한 기본 처리
     * 예상치 못한 예외를 잡아서 일관성 있는 응답을 제공하고 스택 트레이스가 클라이언트에 노출되지 않도록 합니다.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex,
            WebRequest request) {

        String path = ((ServletWebRequest) request).getRequest().getRequestURI();

        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
                "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
                path);

        // 내부 서버 오류는 상세 정보를 로그에만 기록
        logger.error("Unexpected error at {}: {}", path, ex.getMessage(), ex);

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
