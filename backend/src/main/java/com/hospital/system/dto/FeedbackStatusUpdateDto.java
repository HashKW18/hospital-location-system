package com.hospital.system.dto;

import com.hospital.system.entity.FeedbackStatus;
import jakarta.validation.constraints.NotNull;

public class FeedbackStatusUpdateDto {

    @NotNull(message = "Status is required")
    private FeedbackStatus status;

    private String staffResponse;

    public FeedbackStatusUpdateDto() {}

    public FeedbackStatus getStatus() {
        return status;
    }

    public void setStatus(FeedbackStatus status) {
        this.status = status;
    }

    public String getStaffResponse() {
        return staffResponse;
    }

    public void setStaffResponse(String staffResponse) {
        this.staffResponse = staffResponse;
    }
}
