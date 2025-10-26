package com.clubbing.clubbing.model;

public enum MemberRole {
    MEMBER("Member"),
    OFFICER("Officer"),
    VICE_PRESIDENT("Vice President"),
    PRESIDENT("President");
    
    private final String displayName;
    
    MemberRole(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public boolean isLeadership() {
        return this == OFFICER || this == VICE_PRESIDENT || this == PRESIDENT;
    }
    
    public boolean isExecutive() {
        return this == VICE_PRESIDENT || this == PRESIDENT;
    }
} 