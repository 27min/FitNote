package com.fitnote.server.domain.workout;

import java.util.ArrayList;
import java.util.List;

import com.fitnote.server.domain.common.BaseTimeEntity;
import com.fitnote.server.domain.exercise.Exercise;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workout_exercises",
       indexes = @Index(name = "idx_we_workout_order", columnList = "workout_id, orderIndex"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutExercise extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "workout_id", nullable = false)
    private Workout workout;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private Integer orderIndex;

    @Lob
    private String notes;

    @Column(length = 32)
    private String supersetGroup; // 예: "A", "B"

    @OneToMany(mappedBy = "workoutExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("setIndex ASC")
    @Builder.Default
    private List<WorkoutSet> sets = new ArrayList<>();
}
