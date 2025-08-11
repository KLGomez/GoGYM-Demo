import api from './api';

export const getMemberships = async () => {
  const response = await api.get('/plans');
  return response.data;
};

export const getMembershipById = async (id) => {
  const response = await api.get(`/plans/${id}`);
  return response.data;
};

export const createMembership = async (membershipData) => {
  const response = await api.post('/plans', membershipData);
  return response.data;
};

export const updateMembership = async (id, membershipData) => {
  const response = await api.patch(`/plans/${id}`, membershipData);
  return response.data;
};

export const deleteMembership = async (id) => {
  const response = await api.delete(`/plans/${id}`);
  return response.data;
};
