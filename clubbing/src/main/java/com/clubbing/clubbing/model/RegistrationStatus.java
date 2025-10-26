package com.clubbing.clubbing.model;

public enum RegistrationStatus {
    REGISTERED("Registered"),
    CANCELLED("Cancelled"),
    WAITLISTED("Waitlisted"),
    ATTENDED("Attended"),
    NO_SHOW("No Show");
    
    private final String displayName;
    
    RegistrationStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isActive() {
        return this == REGISTERED || this == WAITLISTED;
    }
    
    public boolean canCancel() {
        return this == REGISTERED || this == WAITLISTED;
    }
    
    public boolean canAttend() {
        return this == REGISTERED;
    }
} 