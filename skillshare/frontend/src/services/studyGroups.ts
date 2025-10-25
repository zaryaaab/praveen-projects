import api from './api';
import { StudyGroup } from '../types';

interface CreateStudyGroupData {
  group_name: string;
  description: string;
  category: string;
}

export const studyGroupService = {
  async createGroup(data: CreateStudyGroupData): Promise<StudyGroup> {
    const response = await api.post<StudyGroup>('/study-groups', data);
    return response.data;
  },

  async getAllGroups(): Promise<StudyGroup[]> {
    const response = await api.get<StudyGroup[]>('/study-groups');
    return response.data;
  },

  async getGroupById(id: string): Promise<StudyGroup> {
    const response = await api.get<StudyGroup>(`/study-groups/${id}`);
    return response.data;
  },

  async updateGroup(id: string, data: CreateStudyGroupData): Promise<StudyGroup> {
    const response = await api.put<StudyGroup>(`/study-groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: string): Promise<void> {
    await api.delete(`/study-groups/${id}`);
  },

  async joinGroup(id: string): Promise<void> {
    await api.post(`/study-groups/${id}/join`);
  }
}; 