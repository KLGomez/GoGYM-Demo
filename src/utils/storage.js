//src/utils/storage.js

const API_URL = import.meta.env.VITE_API_URL;

// --- Helper para headers con token ---
const getAuthHeaders = (extra = {}) => {
  const token = localStorage.getItem('token');
  return token
    ? { ...extra, Authorization: `Bearer ${token}` }
    : extra;
};

// --- Feedbacks ---
export const getFeedbacks = async () => {
  const res = await fetch(`${API_URL}/feedbacks`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching feedbacks');
  return await res.json();
};
export const saveFeedbacks = async (feedbacks) => {
  const res = await fetch(`${API_URL}/feedbacks`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(feedbacks),
  });
  if (!res.ok) throw new Error('Error saving feedbacks');
  return await res.json();
};

// --- Generic LocalStorage Helper Functions ---
const getFromLocalStorage = (key, defaultValue = []) => {
  try {
    const dataJson = localStorage.getItem(key);
    return dataJson ? JSON.parse(dataJson) : defaultValue;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage key "${key}":`, error);
  }
};

// --- Clients (Alumnos) ---
export const getClients = async () => {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching clients');
  return await res.json();
};
export const saveClients = async (client) => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(client),
  });
  if (!res.ok) throw new Error('Error saving client');
  return await res.json();
};

// --- Gym Classes ---
export const getGymClasses = async () => {
  const res = await fetch(`${API_URL}/gym-classes`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching gym classes');
  return await res.json();
};
export const saveGymClasses = async (gymClass) => {
  const res = await fetch(`${API_URL}/gym-classes`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(gymClass),
  });
  if (!res.ok) throw new Error('Error saving gym class');
  return await res.json();
};

// --- Teachers ---
export const getTeachers = async () => {
  const res = await fetch(`${API_URL}/teachers`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching teachers');
  return await res.json();
};
export const saveTeachers = async (teacher) => {
  const res = await fetch(`${API_URL}/teachers`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(teacher),
  });
  if (!res.ok) throw new Error('Error saving teacher');
  return await res.json();
};

// --- Class Enrollments ---
export const getClassEnrollments = async () => {
  const res = await fetch(`${API_URL}/gym-classes/enrollments`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching enrollments');
  return await res.json();
};
export const saveClassEnrollments = async (enrollment) => {
  const res = await fetch(`${API_URL}/gym-classes/enrollments`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(enrollment),
  });
  if (!res.ok) throw new Error('Error saving enrollment');
  return await res.json();
};

// --- Attendance Records ---
export const getAttendanceRecords = async () => {
  const res = await fetch(`${API_URL}/access-logs`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching attendance records');
  return await res.json();
};
export const saveAttendanceRecords = async (record) => {
  const res = await fetch(`${API_URL}/access-logs`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error('Error saving attendance record');
  return await res.json();
};

// --- Articles ---
export const getArticles = async () => {
  const res = await fetch(`${API_URL}/articles`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Error fetching articles');
  return await res.json();
};
export const saveArticles = async (article) => {
  const res = await fetch(`${API_URL}/articles`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(article),
  });
  if (!res.ok) throw new Error('Error saving article');
  return await res.json();
};

// --- Membership Plans ---
export const getMembershipPlans = async () => {
  // Cambia la ruta a /planes y agrega el parámetro para incluir inactivos
  console.log('[getMembershipPlans] Fetching', `${API_URL}/planes?includeInactive=true`);
  const res = await fetch(`${API_URL}/planes?includeInactive=true`, {
    headers: getAuthHeaders()
  });
  console.log('[getMembershipPlans] Response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[getMembershipPlans] Error response:', errorText);
    throw new Error('Error fetching membership plans');
  }
  const data = await res.json();
  console.log('[getMembershipPlans] Data received:', data);
  return data;
};
export const saveMembershipPlans = async (plan) => {
  const res = await fetch(`${API_URL}/plans`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(plan),
  });
  if (!res.ok) throw new Error('Error saving membership plan');
  return await res.json();
};


// --- User Session ---
// Mantener el token en localStorage para autenticación
const USER_TOKEN_KEY = 'userToken';
const USER_ROLE_KEY = 'userRole';

export const saveUserSession = (token, role) => {
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(USER_ROLE_KEY, role);
};

export const getUserSession = () => ({
  token: localStorage.getItem(USER_TOKEN_KEY),
  role: localStorage.getItem(USER_ROLE_KEY),
});

export const clearUserSession = () => {
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem('currentUserSession');
};