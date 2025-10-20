/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

package com.fitnote.server.domain.auth;

import com.fitnote.server.domain.common.BaseTimeEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
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
@Table(name = "user_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserSettings extends BaseTimeEntity {

    @Id
    private Long id; // users.id와 동일(PK=FK)

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private Integer defaultRestSec;      // 기본 휴식(초)
    private Integer roundingStep;        // 예: 2.5 kg
    private Boolean showWarmup;          // 워밍업 세트 표시 여부
}