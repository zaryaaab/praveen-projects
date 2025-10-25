export interface User {
  id: string;
  email: string;
  name: string;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface StudyGroup {
  _id: string;
  group_name: string;
  description: string;
  category: string;
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  _id: string;
  group_id: string;
  user_id: User;
  role: 'admin' | 'member';
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, skills: string[]) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: User;
  studyGroupId: string;
  createdAt: Date;
  updatedAt: Date;
  replies: ForumReply[];
  upvotes: number;
  isResolved: boolean;
  tags: string[];
}

export interface ForumReply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  upvotes: number;
  isAccepted: boolean;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'notes' | 'link';
  url: string;
  uploadedBy: User;
  createdAt: Date;
  downloadCount: number;
  rating: number;
  tags: string[];
  subject: string;
  studyGroupId?: string;
}

export interface MentorSession {
  id: string;
  mentor: User;
  mentee: User;
  subject: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  feedback?: string;
  rating?: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}