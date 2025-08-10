//src/utils/storage.js

// --- Feedbacks ---
const FEEDBACKS_STORAGE_KEY = 'feedbacks';
export const getFeedbacks = () => getFromLocalStorage(FEEDBACKS_STORAGE_KEY);
export const saveFeedbacks = (feedbacks) => saveToLocalStorage(FEEDBACKS_STORAGE_KEY, feedbacks);

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
const CLIENTS_STORAGE_KEY = 'clients';
export const getClients = () => getFromLocalStorage(CLIENTS_STORAGE_KEY);
export const saveClients = (clients) => saveToLocalStorage(CLIENTS_STORAGE_KEY, clients);

// --- Gym Classes ---
const GYM_CLASSES_STORAGE_KEY = 'gymClasses';
export const getGymClasses = () => getFromLocalStorage(GYM_CLASSES_STORAGE_KEY);
export const saveGymClasses = (classes) => saveToLocalStorage(GYM_CLASSES_STORAGE_KEY, classes);

// --- Teachers ---
const GYM_TEACHERS_STORAGE_KEY = 'gymTeachers';
export const getTeachers = () => getFromLocalStorage(GYM_TEACHERS_STORAGE_KEY);
export const saveTeachers = (teachers) => saveToLocalStorage(GYM_TEACHERS_STORAGE_KEY, teachers);

// --- Class Enrollments ---
const CLASS_ENROLLMENTS_STORAGE_KEY = 'classEnrollments';
export const getClassEnrollments = () => getFromLocalStorage(CLASS_ENROLLMENTS_STORAGE_KEY);
export const saveClassEnrollments = (enrollments) => saveToLocalStorage(CLASS_ENROLLMENTS_STORAGE_KEY, enrollments);

// --- Attendance Records ---
const ATTENDANCE_RECORDS_STORAGE_KEY = 'attendanceRecords';
export const getAttendanceRecords = () => getFromLocalStorage(ATTENDANCE_RECORDS_STORAGE_KEY);
export const saveAttendanceRecords = (records) => saveToLocalStorage(ATTENDANCE_RECORDS_STORAGE_KEY, records);

// --- Articles ---
const ARTICLES_STORAGE_KEY = 'articles';
export const getArticles = () => getFromLocalStorage(ARTICLES_STORAGE_KEY);
export const saveArticles = (articles) => saveToLocalStorage(ARTICLES_STORAGE_KEY, articles);


// --- User Session ---
// Aunque el objeto currentUser completo se guarda en 'currentUserSession' desde el contexto,
// estas funciones podrían ser útiles si se necesita manejar el token o rol por separado en algún momento.
// Por ahora, el contexto maneja la sesión de forma más integral.
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
  localStorage.removeItem('currentUserSession'); // Asegurar que se limpie la sesión del contexto
};
