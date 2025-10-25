import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudyGroup, ForumPost, Resource, MentorSession, Notification } from '../types';

interface AppContextType {
  studyGroups: StudyGroup[];
  forumPosts: ForumPost[];
  resources: Resource[];
  mentorSessions: MentorSession[];
  notifications: Notification[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addStudyGroup: (group: StudyGroup) => void;
  joinStudyGroup: (groupId: string) => void;
  leaveStudyGroup: (groupId: string) => void;
  addForumPost: (post: ForumPost) => void;
  addResource: (resource: Resource) => void;
  scheduleMentorSession: (session: MentorSession) => void;
  markNotificationAsRead: (notificationId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data
  const [studyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'React Developers',
      description: 'Learn and discuss React.js concepts, best practices, and latest updates.',
      subject: 'Web Development',
      members: [],
      createdBy: '1',
      createdAt: new Date('2024-01-15'),
      isPrivate: false,
      maxMembers: 50,
      tags: ['React', 'JavaScript', 'Frontend'],
      image: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      name: 'Data Science Fundamentals',
      description: 'Explore data science concepts, Python libraries, and machine learning algorithms.',
      subject: 'Data Science',
      members: [],
      createdBy: '2',
      createdAt: new Date('2024-01-10'),
      isPrivate: false,
      maxMembers: 30,
      tags: ['Python', 'Machine Learning', 'Statistics'],
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Cross-platform mobile development with React Native and Flutter.',
      subject: 'Mobile Development',
      members: [],
      createdBy: '3',
      createdAt: new Date('2024-01-20'),
      isPrivate: false,
      maxMembers: 25,
      tags: ['React Native', 'Flutter', 'Mobile'],
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ]);

  const [forumPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'How to optimize React component re-renders?',
      content: 'I\'m having performance issues with my React app. Components are re-rendering too frequently.',
      author: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        skills: [],
        interests: [],
        joinedAt: new Date(),
        isMentor: false,
        studyGroups: [],
        mentorshipSessions: 0,
      },
      studyGroupId: '1',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22'),
      replies: [],
      upvotes: 12,
      isResolved: false,
      tags: ['React', 'Performance'],
    },
  ]);

  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'React Hooks Cheat Sheet',
      description: 'Comprehensive guide to all React hooks with examples.',
      type: 'pdf',
      url: '#',
      uploadedBy: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: [],
        interests: [],
        joinedAt: new Date(),
        isMentor: true,
        studyGroups: [],
        mentorshipSessions: 0,
      },
      createdAt: new Date('2024-01-20'),
      downloadCount: 245,
      rating: 4.8,
      tags: ['React', 'Hooks', 'Cheat Sheet'],
      subject: 'Web Development',
    },
    {
      id: '2',
      title: 'Introduction to Machine Learning',
      description: 'Beginner-friendly video series covering ML fundamentals.',
      type: 'video',
      url: '#',
      uploadedBy: {
        id: '2',
        name: 'Dr. Sarah Johnson',
        email: 'sarah@example.com',
        skills: [],
        interests: [],
        joinedAt: new Date(),
        isMentor: true,
        studyGroups: [],
        mentorshipSessions: 0,
      },
      createdAt: new Date('2024-01-18'),
      downloadCount: 189,
      rating: 4.9,
      tags: ['Machine Learning', 'Python', 'Beginner'],
      subject: 'Data Science',
    },
  ]);

  const [mentorSessions] = useState<MentorSession[]>([
    {
      id: '1',
      mentor: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: [],
        interests: [],
        joinedAt: new Date(),
        isMentor: true,
        studyGroups: [],
        mentorshipSessions: 0,
      },
      mentee: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        skills: [],
        interests: [],
        joinedAt: new Date(),
        isMentor: false,
        studyGroups: [],
        mentorshipSessions: 0,
      },
      subject: 'React Development',
      scheduledAt: new Date('2024-01-25T14:00:00'),
      duration: 60,
      status: 'scheduled',
    },
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      userId: '1',
      title: 'New member joined your study group',
      message: 'Alice Johnson joined "React Developers" group.',
      type: 'info',
      isRead: false,
      createdAt: new Date('2024-01-23T10:30:00'),
    },
    {
      id: '2',
      userId: '1',
      title: 'Upcoming mentor session',
      message: 'Your session with Jane Smith starts in 1 hour.',
      type: 'warning',
      isRead: false,
      createdAt: new Date('2024-01-25T13:00:00'),
    },
  ]);

  const addStudyGroup = (group: StudyGroup) => {
    // Implementation would update state
    console.log('Adding study group:', group);
  };

  const joinStudyGroup = (groupId: string) => {
    console.log('Joining study group:', groupId);
  };

  const leaveStudyGroup = (groupId: string) => {
    console.log('Leaving study group:', groupId);
  };

  const addForumPost = (post: ForumPost) => {
    console.log('Adding forum post:', post);
  };

  const addResource = (resource: Resource) => {
    console.log('Adding resource:', resource);
  };

  const scheduleMentorSession = (session: MentorSession) => {
    console.log('Scheduling mentor session:', session);
  };

  const markNotificationAsRead = (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
  };

  const value = {
    studyGroups,
    forumPosts,
    resources,
    mentorSessions,
    notifications,
    searchQuery,
    setSearchQuery,
    addStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    addForumPost,
    addResource,
    scheduleMentorSession,
    markNotificationAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};