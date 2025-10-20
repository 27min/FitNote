/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.tag;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *
 * @author sd207naver.com
 */
@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutTagId implements Serializable{
    private Long workoutId;
    private Long tagId;
}
