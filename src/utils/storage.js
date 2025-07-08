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
