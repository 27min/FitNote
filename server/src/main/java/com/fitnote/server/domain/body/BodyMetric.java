/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.body;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fitnote.server.domain.auth.User;
import com.fitnote.server.domain.common.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "body_metrics",
        indexes = @Index(name = "idx_body_user_time", columnList = "user_id, measuredAt DESC"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BodyMetric extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime measuredAt;

    @Column(precision = 6, scale = 2)
    private BigDecimal weight;

    @Column(precision = 5, scale = 2)
    private BigDecimal bodyFatPct;

    // 선택 측정값들
    @Column(precision = 6, scale = 2) private BigDecimal neck;
    @Column(precision = 6, scale = 2) private BigDecimal chest;
    @Column(precision = 6, scale = 2) private BigDecimal waist;
    @Column(precision = 6, scale = 2) private BigDecimal hip;

    @Column(length = 255)
    private String notes;
}
