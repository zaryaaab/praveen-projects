package com.clubbing.clubbing.model;

public enum UserRole {
    SYSTEM_ADMIN("System Admin"),
    CLUB_ADMIN("Club Admin"),
    STUDENT("Student");
    
    private final String displayName;
    
    UserRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
} 