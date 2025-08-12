
import api from './api';

export const getMemberships = async () => {
  const response = await api.get('/planes');
  // Mapear _id a id en cada plan
  return Array.isArray(response.data)
    ? response.data.map(plan => ({ ...plan, id: plan._id }))
    : [];
};

export const getMembershipById = async (id) => {
  const response = await api.get(`/planes/${id}`);
  const plan = response.data;
  return plan ? { ...plan, id: plan._id } : null;
};

export const createMembership = async (membershipData) => {
  const response = await api.post('/planes', membershipData);
  const plan = response.data;
  return plan ? { ...plan, id: plan._id } : null;
};

export const updateMembership = async (id, membershipData) => {
  const response = await api.patch(`/planes/${id}`, membershipData);
  const plan = response.data;
  return plan ? { ...plan, id: plan._id } : null;
};

export const deleteMembership = async (id) => {
  const response = await api.delete(`/planes/${id}`);
  return response.data;
};
