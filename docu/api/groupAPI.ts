import { api } from './api';
import { GroupType } from '../types';

type CreateGroupPayload = {
  name: string;
  isPublic: boolean;
};

export const GroupsAPI = {
  getAll: () => api.get<GroupType[]>('/groups'),
  create: (payload: CreateGroupPayload) => api.post<GroupType>('/groups', payload),
  getById: (groupId: number) => api.get<GroupType>(`/groups/${groupId}`),
};