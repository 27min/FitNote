/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.workout;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

import com.fitnote.server.domain.common.BaseTimeEntity;

@Entity
@Table(name = "sets",
       indexes = @Index(name = "idx_set_we_order", columnList = "workout_exercise_id, setIndex"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutSet extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(nullable = false)
    private Integer setIndex;

    // 가변 메트릭: metricType에 따라 null 허용
    @Column(precision = 6, scale = 2)
    private BigDecimal weight;     // kg/lb

    private Integer reps;

    private Integer durationSec;   // 런/버피 등

    private Integer distanceM;     // 러닝/로잉 등

    @Column(precision = 3, scale = 1)
    private BigDecimal rpe;

    private Integer rir;

    @Column(nullable = false)
    private Boolean isWarmup = Boolean.FALSE;

    private Integer restSec;

    @Column(length = 20)
    private String tempo;          // e.g. "3-1-1"

    @Column(length = 255)
    private String note;
}
