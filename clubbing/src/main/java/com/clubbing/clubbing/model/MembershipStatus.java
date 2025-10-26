package com.clubbing.clubbing.model;

public enum MembershipStatus {
    PENDING("Pending Review"),
    APPROVED("Approved"),
    REJECTED("Rejected"),
    LEFT("Left Club"),
    SUSPENDED("Suspended");
    
    private final String displayName;
    
    MembershipStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isActive() {
        return this == APPROVED;
    }
    
    public boolean isPending() {
        return this == PENDING;
    }
    
    public boolean isProcessed() {
        return this == APPROVED || this == REJECTED;
    }
} 