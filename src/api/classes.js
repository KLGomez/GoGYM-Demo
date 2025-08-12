
import api from './api';

export const deactivateClass = async (id) => {
  const response = await api.patch(`/gym-classes/${id}/deactivate`);
  return response.data;
};

export const reactivateClass = async (id) => {
  const response = await api.patch(`/gym-classes/${id}/reactivate`);
  return response.data;
};

export const getClasses = async () => {
  const response = await api.get('/gym-classes?includeInactive=true');
  return response.data;
};

export const getClassById = async (id) => {
  const response = await api.get(`/gym-classes/${id}`);
  return response.data;
};

export const createClass = async (classData) => {
  const response = await api.post('/gym-classes', classData);
  return response.data;
};

export const updateClass = async (id, classData) => {
  const response = await api.patch(`/gym-classes/${id}`, classData);
  return response.data;
};

export const deleteClass = async (id) => {
  const response = await api.delete(`/gym-classes/${id}`);
  return response.data;
};
