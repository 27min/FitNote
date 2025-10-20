/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.tag;

import com.fitnote.server.domain.common.BaseTimeEntity;
import com.fitnote.server.domain.workout.Workout;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
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
@Table(name = "workout_tags",
        indexes = @Index(name = "idx_wt_workout", columnList = "workout_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutTag extends BaseTimeEntity {
    
    @EmbeddedId
    private WorkoutTagId id;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("workoutId")
    @JoinColumn(name = "workout_id")
    private Workout workout;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private Tag tag;
    
}
