import api from './api';

export interface UploadResourcePayload {
  title: string;
  description: string;
  file_base64: string;
  group_id: string;
  category?: string;
  tags?: string[];
}

export const resourcesService = {
  async getGroupResources(groupId: string) {
    const response = await api.get(`/resources/group/${groupId}`);
    return response.data;
  },

  async getResourceById(id: string) {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  async uploadResource(payload: UploadResourcePayload) {
    const response = await api.post('/resources', payload);
    return response.data;
  }
};