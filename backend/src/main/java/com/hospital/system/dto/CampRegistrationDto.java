package com.hospital.system.dto;

import com.hospital.system.entity.RegistrationStatus;
import java.time.LocalDateTime;

public class CampRegistrationDto {
    private Long registrationId;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long campId;
    private String campName;
    private String campCategory;
    private String campDate;
    private String campTime;
    private String locationName;
    private LocalDateTime registrationDate;
    private RegistrationStatus registrationStatus;
    private String notes;

    public CampRegistrationDto() {}

    public Long getRegistrationId() {
        return registrationId;
    }

    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Long getCampId() {
        return campId;
    }

    public void setCampId(Long campId) {
        this.campId = campId;
    }

    public String getCampName() {
        return campName;
    }

    public void setCampName(String campName) {
        this.campName = campName;
    }

    public String getCampCategory() {
        return campCategory;
    }

    public void setCampCategory(String campCategory) {
        this.campCategory = campCategory;
    }

    public String getCampDate() {
        return campDate;
    }

    public void setCampDate(String campDate) {
        this.campDate = campDate;
    }

    public String getCampTime() {
        return campTime;
    }

    public void setCampTime(String campTime) {
        this.campTime = campTime;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public RegistrationStatus getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(RegistrationStatus registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
