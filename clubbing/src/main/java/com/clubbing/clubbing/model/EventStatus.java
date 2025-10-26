package com.clubbing.clubbing.model;

public enum EventStatus {
    DRAFT("Draft"),
    PUBLISHED("Published"),
    CANCELLED("Cancelled"),
    COMPLETED("Completed");
    
    private final String displayName;
    
    EventStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isActive() {
        return this == PUBLISHED;
    }
    
    public boolean canRegister() {
        return this == PUBLISHED;
    }
    
    public boolean canEdit() {
        return this == DRAFT || this == PUBLISHED;
    }
    
    public boolean isCompleted() {
        return this == COMPLETED;
    }
} 