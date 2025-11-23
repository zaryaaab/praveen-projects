import api from './api';

export interface CreateMentorshipPayload {
  mentor_id: string;
  skill_area: string;
  program_description: string;
  duration_weeks: number;
  start_date: string; // ISO string
  end_date: string;   // ISO string
}

export const getMyMentorships = async () => {
  const { data } = await api.get('/mentorship/');
  return data;
};

export const requestMentorship = async (payload: CreateMentorshipPayload) => {
  const { data } = await api.post('/mentorship/request', payload);
  return data;
};

export const updateMentorshipStatus = async (id: string, status: 'active' | 'completed' | 'cancelled') => {
  const { data } = await api.patch(`/mentorship/${id}/status`, { status });
  return data;
};