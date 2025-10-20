/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.exercise;

import java.util.List;

import com.fitnote.server.domain.auth.User;
import com.fitnote.server.domain.common.BaseTimeEntity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author sd207naver.com
 */
@Entity
@Table(name = "exercises",
        uniqueConstraints = @UniqueConstraint(name = "uq_ex_name_owner", columnNames = {"name","owner_user_id"}),
        indexes = {
            @Index(name = "idx_ex_owner", columnList = "owner_user_id"),
            @Index(name = "idx_ex_name", columnList = "name")
        })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Exercise extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** null 이면 글로벌(공용 사전), not null 이면 사용자의 커스텀 종목 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private User owner;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MuscleGroup primaryMuscle;

    /** 보조 근육군 목록: 별도 테이블로 매핑 */
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "exercise_secondary_muscles",
        joinColumns = @JoinColumn(name = "exercise_id"))
    @Column(name = "muscle", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private List<MuscleGroup> secondaryMuscles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetricType metricType;

    @Column(nullable = false)
    private Boolean isPublic = Boolean.TRUE;
}
