
// Definición mínima para evitar error en producción
const initialSimulatedTeachers = [
  {
    id: 'teach_1',
    nombre: 'María',
    apellido: 'Pérez',
    dni: '30011222',
    email: 'maria.perez@gogym.com',
    telefono: '555-1234',
    especialidad: 'Yoga',
    especialidades: 'Yoga, Meditación',
    descripcion: 'Especialista en yoga y meditación con 10 años de experiencia.',
    activo: true
  }
];
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getClients, saveClients,
  getTeachers, saveTeachers,
  getGymClasses, saveGymClasses,
  getClassEnrollments, saveClassEnrollments,
  getAttendanceRecords, saveAttendanceRecords,
  getArticles, saveArticles,
  getFeedbacks, saveFeedbacks,
  getMembershipPlans, saveMembershipPlans
} from '../utils/storage';
import { showSuccess, showError, showWarning } from '../utils/alerts';
import { generateClientCode } from '../utils/codeUtils';

export const SharedDataContext = createContext(null);




const initialSimulatedClasses = [
  { id: 'class1', nombre: 'Yoga Matutino', profesor: 'teach_1', especialidad: 'Yoga', dia: 'Lunes', horaInicio: '08:00', horaFin: '09:00', capacidad: 20, activo: true },
  { id: 'class2', nombre: 'HIIT Intenso', profesor: 'teach_2', especialidad: 'HIIT', dia: 'Martes', horaInicio: '18:00', horaFin: '18:45', capacidad: 15, activo: true },
  { id: 'class3', nombre: 'Pilates Suave', profesor: 'teach_3', especialidad: 'Pilates', dia: 'Miércoles', horaInicio: '10:00', horaFin: '11:00', capacidad: 18, activo: true },
  { id: 'class4', nombre: 'Spinning Nocturno', profesor: 'teach_4', especialidad: 'Spinning', dia: 'Jueves', horaInicio: '20:00', horaFin: '21:00', capacidad: 22, activo: true },
  { id: 'class5', nombre: 'Funcional Express', profesor: 'teach_2', especialidad: 'Funcional', dia: 'Viernes', horaInicio: '17:00', horaFin: '17:45', capacidad: 16, activo: true },
];

const initialSimulatedMembershipPlans = [
  { id: 'plan_1', name: 'Básico', durationDays: 30, price: 25, description: 'Acceso a clases generales y zona de pesas.' },
  { id: 'plan_2', name: 'Premium', durationDays: 365, price: 220, description: 'Acceso total, incluye clases premium y asesoría.' },
  { id: 'plan_3', name: 'Clases Ilimitadas', durationDays: 90, price: 80, description: 'Acceso ilimitado a todas las clases grupales.' },
];

const initialSimulatedClients = [
  { id: 'client_1', firstName: 'Ana', lastName: 'López', email: 'ana.lopez@gogym.com', password: '12345678', role: 'user', dni: '12345678', alphanumericCode: generateClientCode('Ana', 'López', '12345678'), membership: { planName: 'Básico', membershipStartDate: '2025-07-01', membershipDurationDays: 30, autoRenew: false } },
  { id: 'client_2', firstName: 'Pedro', lastName: 'Ramírez', email: 'pedro.ramirez@gogym.com', password: '87654321', role: 'user', dni: '87654321', alphanumericCode: generateClientCode('Pedro', 'Ramírez', '87654321'), membership: { planName: 'Premium', membershipStartDate: '2025-01-15', membershipDurationDays: 365, autoRenew: true } },

];

const initialSimulatedEnrollments = [
  { id: 'enr_1', userId: 'client_1', classId: 'class1', enrollmentDate: '2025-08-01T08:00:00' },
  { id: 'enr_2', userId: 'client_2', classId: 'class2', enrollmentDate: '2025-08-05T18:00:00' },
  { id: 'enr_3', userId: 'client_3', classId: 'class3', enrollmentDate: '2025-08-06T10:00:00' },
  { id: 'enr_4', userId: 'client_4', classId: 'class4', enrollmentDate: '2025-08-07T20:00:00' },
  { id: 'enr_5', userId: 'client_1', classId: 'class5', enrollmentDate: '2025-08-08T17:00:00' },
];



export const SharedDataProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [gymClasses, setGymClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [articles, setArticles] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]); // Estado para tipos de membresía
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);


  // --- Carga Inicial de Datos ---

  useEffect(() => {
    console.log("SharedDataContext: Cargando datos iniciales...");
    let storedClients = getClients();
    const storedGymClasses = getGymClasses();
    const storedTeachers = getTeachers();
    const storedEnrollments = getClassEnrollments();
    const storedAttendance = getAttendanceRecords();
    const storedArticles = getArticles();
    const storedFeedbacks = getFeedbacks();
    const storedMembershipPlans = getMembershipPlans();
    let storedCurrentUser = null;
    try {
      const raw = localStorage.getItem('currentUserSession');
      storedCurrentUser = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error parsing currentUserSession from localStorage:', error);
      localStorage.removeItem('currentUserSession');
      storedCurrentUser = null;
    }

    // Si no hay clientes en localStorage, forzar borrado y cargar simulados
    if (!storedClients || storedClients.length === 0) {
      localStorage.removeItem('clients');
      storedClients = initialSimulatedClients;
    }

    setClients(storedClients);
    setGymClasses(Array.isArray(storedGymClasses) && storedGymClasses.length > 0 ? storedGymClasses : initialSimulatedClasses);
    setTeachers(Array.isArray(storedTeachers) && storedTeachers.length > 0 ? storedTeachers : initialSimulatedTeachers);
    setEnrollments(storedEnrollments.length > 0 ? storedEnrollments : initialSimulatedEnrollments);
    setAttendanceRecords(storedAttendance);
    setArticles(storedArticles);
    setFeedbacks(Array.isArray(storedFeedbacks) ? storedFeedbacks : []);
    setMembershipPlans(Array.isArray(storedMembershipPlans) && storedMembershipPlans.length > 0 ? storedMembershipPlans : initialSimulatedMembershipPlans);

    // Asegurar usuarios por defecto si no existen
    let finalClients = [...storedClients];
    const adminExists = finalClients.some(c => c.role === 'admin' && c.email === 'admin@gogym.com');

    if (!adminExists) {
      const adminUser = {
        id: 'admin_default_001',
        firstName: 'Admin',
        lastName: 'GoGym',
        email: 'admin@gogym.com',
        password: 'adminpass',
        role: 'admin',
        dni: '00000000',
        alphanumericCode: generateClientCode('Admin', 'GoGym', '00000000'),
        membership: { planName: 'Premium', membershipStartDate: new Date().toISOString(), membershipDurationDays: 365, autoRenew: true }
      };
      finalClients.push(adminUser);
    }

    const testUserExists = finalClients.some(c => c.email === 'user@gogym.com');
    if (!testUserExists) {
      const testUser = {
        id: 'user_default_001',
        firstName: 'Test', lastName: 'User', email: 'user@gogym.com', password: 'userpass', role: 'user',
        dni: '11111111', alphanumericCode: generateClientCode('Test', 'User', '11111111'),
        membership: { planName: 'Básico', membershipStartDate: new Date().toISOString(), membershipDurationDays: 30, autoRenew: false }
      };
      finalClients.push(testUser);
    }

    if (finalClients.length > storedClients.length) {
      setClients(finalClients);
    } else {
      setClients(storedClients);
    }

    if (storedCurrentUser) {
      const liveClientData = finalClients.find(c => c.id === storedCurrentUser.id);
      if (liveClientData) {
        setCurrentUser(liveClientData);
        localStorage.setItem('currentUserSession', JSON.stringify(liveClientData));
      } else {
        localStorage.removeItem('currentUserSession');
        setCurrentUser(null);
      }
    }

    setIsLoading(false);
    console.log("SharedDataContext: Datos cargados.", { storedClients, storedGymClasses, storedTeachers, storedEnrollments, storedAttendance, storedCurrentUser, storedFeedbacks });
  }, []);

  // --- Persistencia en localStorage ---
  useEffect(() => { if (!isLoading) saveClients(clients); }, [clients, isLoading]);
  useEffect(() => { if (!isLoading) saveGymClasses(gymClasses); }, [gymClasses, isLoading]);
  useEffect(() => { if (!isLoading) saveTeachers(teachers); }, [teachers, isLoading]);
  useEffect(() => { if (!isLoading) saveClassEnrollments(enrollments); }, [enrollments, isLoading]);
  useEffect(() => { if (!isLoading) saveAttendanceRecords(attendanceRecords); }, [attendanceRecords, isLoading]);
  useEffect(() => { if (!isLoading) saveFeedbacks(feedbacks); }, [feedbacks, isLoading]);
  useEffect(() => { if (!isLoading) saveArticles(articles); }, [articles, isLoading]);
  useEffect(() => { if (!isLoading) saveClients(clients); }, [clients, isLoading]);
  useEffect(() => { if (!isLoading) saveMembershipPlans(membershipPlans); }, [membershipPlans, isLoading]);


  // --- NOTIFICACIONES ---
  const addNotification = useCallback((notification) => {
    const { title, message, type = 'info', forUserId = null, isGlobal = false } = notification;
    const newNotif = {
      id: `notif_${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      forUserId,
      isGlobal
    };
    setNotifications(prev => [...prev, newNotif]);
    console.log("Notificación añadida:", newNotif);

    // Lógica para mostrar alerta si es para el usuario actual y está logueado
    if (currentUser && forUserId === currentUser.id && !isGlobal) {
      if (type === 'success') showSuccess(notification.actionType || 'notification', notification.data || { title, text: message });
      else if (type === 'error') showError(notification.actionType || 'notification', notification.data || { title, text: message });
      else showSuccess(notification.actionType || 'notification', notification.data || { title, text: message }); // Default to success type for display
    }
    // Las notificaciones globales o para otros usuarios/admin se gestionarán en sus respectivos paneles.
  }, [currentUser]);

  // --- MANEJO DE CURRENTUSER (LOGIN/LOGOUT) ---
  const loginUser = useCallback((userData) => {
    const clientData = clients.find(c => c.email === userData.email); // Asumiendo login por email
    if (!clientData) {
      showError('errorLogin');
      return null;
    }
    // Admin y usuario de prueba: contraseña hardcodeada
    if (
      (clientData.email === 'admin@gogym.com' && userData.password === 'admin123') ||
      (clientData.email === 'user@gogym.com' && userData.password === 'user123')
    ) {
      setCurrentUser(clientData);
      localStorage.setItem('currentUserSession', JSON.stringify(clientData));
      showSuccess('successLogin', clientData);
      addNotification({
        title: 'Inicio de Sesión Exitoso',
        message: `Bienvenido/a ${clientData.firstName || clientData.email}!`, 
        type: 'success', 
        forUserId: clientData.id, 
        isGlobal: true
      });
      return clientData;
    }
    // Para otros clientes: contraseña = dni
    if (clientData.role !== 'admin' && clientData.role !== 'user') {
      if (userData.password === String(clientData.dni)) {
        setCurrentUser(clientData);
        localStorage.setItem('currentUserSession', JSON.stringify(clientData));
        showSuccess('successLogin', clientData);
        addNotification({
          title: 'Inicio de Sesión Exitoso',
          message: `Bienvenido/a ${clientData.firstName || clientData.email}!`, 
          type: 'success', 
          forUserId: clientData.id, 
          isGlobal: true
        });
        return clientData;
      }
    }
    showError('errorLogin');
    return null;
  }, [clients, addNotification]);

  const logoutUser = useCallback(() => {
    const userName = currentUser?.firstName;
    setIsLoggingOut(true); // 
    setCurrentUser(null);
    localStorage.removeItem('currentUserSession');
  showSuccess('logout', { firstName: userName });
  }, [currentUser]);



  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const clearUserNotifications = useCallback((userId) => {
    setNotifications(prev => prev.filter(n => !(n.forUserId === userId && !n.isGlobal)));
  }, []);


  // --- CRUD Clientes ---
  const addClient = useCallback((clientDataFromForm) => {
    // Generar código alfanumérico aquí antes de guardar
    const clientWithCode = {
      ...clientDataFromForm,
      alphanumericCode: generateClientCode(clientDataFromForm.firstName, clientDataFromForm.lastName, clientDataFromForm.dni)
    };
    setClients(prev => [...prev, clientWithCode]);
    showSuccess('addClient', clientWithCode);
    addNotification({
      title: 'Cliente Agregado exitosamente',
      message: `El cliente ${clientWithCode.firstName} ha sido agregado exitosamente con código ${clientWithCode.alphanumericCode}.`,
      type: 'success',
      forUserId: 'admin',
      isGlobal: false
    });
  }, [addNotification]);

  const updateClient = useCallback((updatedClientData) => {
    // Si se actualizan los datos que componen el alphanumericCode, se debería regenerar.
    // Por ahora, asumimos que el alphanumericCode es fijo una vez creado o se actualiza manualmente si es necesario.
    // Si el DNI, nombre o apellido cambian, el código alfanumérico basado en ellos también debería cambiar.
    // Podríamos añadir lógica aquí para regenerarlo si es necesario.
    const originalClient = clients.find(c => c.id === updatedClientData.id);
    if (originalClient &&
      (originalClient.firstName !== updatedClientData.firstName ||
        originalClient.lastName !== updatedClientData.lastName ||
        originalClient.dni !== updatedClientData.dni)) {
      updatedClientData.alphanumericCode = generateClientCode(updatedClientData.firstName, updatedClientData.lastName, updatedClientData.dni);
      showSuccess('updateClient', updatedClientData);
      addNotification({
        title: 'Código de Cliente Regenerado',
        message: `Código de cliente para "${updatedClientData.firstName}" regenerado a ${updatedClientData.alphanumericCode} debido a cambio de datos.`,
        type: 'info',
        forUserId: 'admin',
        isGlobal: false
      });
    }
  }, [clients, addNotification]);

  const deleteClient = useCallback((clientId) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    if (clientToDelete) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      showWarning('deleteClient', clientToDelete);
      addNotification({
        title: 'Cliente Eliminado',
        message: `Cliente "${clientToDelete.firstName}" eliminado.`,
        type: 'warning',
        forUserId: 'admin',
        isGlobal: false
      });
    }
  }, [clients, addNotification]);

  const addGymClass = useCallback((classData) => {
    const newClass = { ...classData, id: `class_${Date.now()}` };
    setGymClasses(prev => [...prev, newClass]);
    showSuccess('addClass', newClass);
    addNotification({
      title: 'Clase Creada',
      message: `Nueva clase "${newClass.nombre}" creada.`,
      type: 'success',
      forUserId: 'admin',
      isGlobal: false
    });
  }, [addNotification]);

  const updateGymClass = useCallback((updatedClassData) => {
    setGymClasses(prev => prev.map(c => c.id === updatedClassData.id ? updatedClassData : c));
    showSuccess('updateClass', updatedClassData);
    addNotification({
      title: 'Clase Actualizada',
      message: `Clase "${updatedClassData.nombre}" actualizada.`,
      type: 'info',
      forUserId: 'admin',
      isGlobal: false
    });
  }, [addNotification]);

  const deleteGymClass = useCallback((classId) => {
    const classToDelete = gymClasses.find(c => c.id === classId);
    setGymClasses(prev => prev.filter(c => c.id !== classId));
    setEnrollments(prev => prev.filter(e => e.classId !== classId));
    if (classToDelete) {
      showWarning('deleteClass', classToDelete);
      addNotification({
        title: 'Clase Eliminada',
        message: `Clase "${classToDelete.nombre || classToDelete.name}" eliminada. Inscripciones asociadas también eliminadas.`,
        type: 'warning',
        forUserId: 'admin',
        isGlobal: false
      });
      const enrolledUsers = enrollments.filter(e => e.classId === classId).map(e => e.userId);
      enrolledUsers.forEach(userId => {
        addNotification({
          title: 'Clase Cancelada',
          message: `La clase "${classToDelete.nombre || classToDelete.name}" ha sido cancelada por el administrador.`,
          type: 'warning',
          forUserId: userId,
          isGlobal: false
        });
      });
    }
  }, [gymClasses, enrollments, addNotification]);


  // --- CRUD Inscripciones (Usuario y Admin) ---
  const enrollToClass = useCallback((userId, classId) => {
    const clase = gymClasses.find(c => c.id === classId);
    const user = clients.find(u => u.id === userId);

    if (!clase || !user) {
      showError('error', { message: 'Usuario o clase no encontrados.' });
      return false;
    }
    if (clase.enrolled >= clase.capacity) {
      showError('error', { message: `La clase "${clase.name}" no tiene cupos disponibles.` });
      return false;
    }
    // TODO: Verificar membresía activa del usuario (requiere estructura de membresía en el objeto client)
    // if (user.membershipStatus !== 'active') {
    //   showError("Membresía Inactiva", "Tu membresía no está activa para inscribirte.");
    //   return false;
    // }

    const newEnrollment = { id: `enr_${Date.now()}`, userId, classId, enrollmentDate: new Date().toISOString() };
    setEnrollments(prev => [...prev, newEnrollment]);
    setGymClasses(prevClasses =>
      prevClasses.map(c => c.id === classId ? { ...c, enrolled: c.enrolled + 1 } : c)
    );
    showSuccess('addEnrollment', { className: clase.nombre });
    addNotification({
      title: 'Inscripción Exitosa',
      message: `Inscripción exitosa a "${clase.nombre}".`,
      type: 'success',
      forUserId: userId,
      isGlobal: false
    });
    if (currentUser?.id !== userId) { // Si un admin inscribe a otro usuario
      addNotification({
        title: 'Inscripción de Usuario',
        message: `Has inscrito a ${user.firstName} en "${clase.nombre}".`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
    }
    return true;
  }, [gymClasses, clients, currentUser, addNotification]);

  const cancelEnrollment = useCallback((enrollmentId) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) {
      showError('error', { message: 'Inscripción no encontrada.' });
      return false;
    }
    const clase = gymClasses.find(c => c.id === enrollment.classId);

    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    if (clase) {
      setGymClasses(prevClasses =>
        prevClasses.map(c => c.id === enrollment.classId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c)
      );
      showSuccess('cancelEnrollment', { className: clase.name });
      addNotification({
        title: 'Inscripción Cancelada',
        message: `Has cancelado tu inscripción a "${clase.name}".`,
        type: 'info',
        forUserId: enrollment.userId,
        isGlobal: false
      });
      if (currentUser?.id !== enrollment.userId && currentUser?.role === 'admin') { // Si un admin cancela para otro
        const user = clients.find(u => u.id === enrollment.userId);
        addNotification({
          title: 'Inscripción de Usuario Cancelada',
          message: `Cancelaste la inscripción de ${user?.firstName || 'un usuario'} a "${clase.name}".`,
          type: 'info',
          forUserId: 'admin',
          isGlobal: false
        });
      }
    }
    return true;
  }, [enrollments, gymClasses, currentUser, addNotification, clients]);

  // --- CRUD Membresías (Admin - actualiza cliente) ---
  // La gestión de membresías se hace actualizando el objeto cliente.
  // Ejemplo: updateClientMembership(clientId, membershipDetails)
  const updateClientMembership = useCallback((clientId, membershipDetails) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      showError('error', { message: 'Cliente no encontrado para actualizar membresía.' });
      if (
        (clientData.email === 'admin@gogym.com' && userData.password === 'admin123') ||
        (clientData.email === 'user@gogym.com' && userData.password === 'user123')
      ) {
        setCurrentUser(clientData);
        localStorage.setItem('currentUserSession', JSON.stringify(clientData));
        showSuccess('successLogin', clientData);
        addNotification({
          title: 'Inicio de Sesión Exitoso',
          message: `Bienvenido/a ${clientData.firstName || clientData.email}!`, 
          type: 'success', 
          forUserId: clientData.id, 
          isGlobal: true
        });
        return clientData;
      }
      // Para todos los usuarios que no sean admin, permitir login con DNI
      if (clientData.role !== 'admin') {
        if (userData.password === String(clientData.dni)) {
          setCurrentUser(clientData);
          localStorage.setItem('currentUserSession', JSON.stringify(clientData));
          showSuccess('successLogin', clientData);
          addNotification({
            title: 'Inicio de Sesión Exitoso',
            message: `Bienvenido/a ${clientData.firstName || clientData.email}!`, 
            type: 'success', 
            forUserId: clientData.id, 
            isGlobal: true
          });
          return clientData;
        }
      }

      
    }
  }, [clients, updateClient, currentUser, addNotification]);


  // --- Feedback (Usuario) ---
  const submitFeedback = useCallback((feedbackData) => {
    // feedbackData: { classId, className, rating, comment, userId, user, date }
    const newFeedback = {
      ...feedbackData,
      id: `fb_${Date.now()}_${Math.floor(Math.random()*10000)}`
    };
    setFeedbacks(prev => [...prev, newFeedback]);
    showSuccess('addFeedback', feedbackData);
    addNotification({
      title: 'Feedback Enviado',
      message: `Gracias por tu feedback sobre "${feedbackData.className}".`,
      type: 'success',
      forUserId: feedbackData.userId,
      isGlobal: false
    });
  }, [addNotification]);




  const contextValue = useMemo(() => ({
    clients,
    gymClasses,
    teachers,
    enrollments,
    attendanceRecords,
    articles,
    membershipPlans, // Exponer membershipPlans
    currentUser,
    notifications,
    isLoading,
    loginUser,
    logoutUser,
    addNotification,
    markNotificationAsRead,
    clearUserNotifications,
    addClient,
    updateClient,
    deleteClient,
    addGymClass,
    updateGymClass,
    deleteGymClass,
    enrollToClass,
    cancelEnrollment,
    updateClientMembership,
  submitFeedback,
  feedbacks,
    isLoggingOut, 
    setIsLoggingOut,
    addTeacher: (teacherData) => {
      setTeachers(prev => [...prev, { ...teacherData, id: teacherData.id || `teach_${Date.now()}` }]);
      showSuccess('addTeacher', teacherData);
      addNotification({
        title: 'Profesor Agregado',
        message: `Profesor "${teacherData.nombre} ${teacherData.apellido}" agregado.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    updateTeacher: (updatedTeacherData) => {
      setTeachers(prev => prev.map(t => t.id === updatedTeacherData.id ? updatedTeacherData : t));
      showSuccess('updateTeacher', updatedTeacherData);
      addNotification({
        title: 'Profesor Actualizado',
        message: `Profesor "${updatedTeacherData.nombre} ${updatedTeacherData.apellido}" actualizado.`,
        type: 'info',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    deleteTeacher: (teacherId) => {
      const teacherToDelete = teachers.find(t => t.id === teacherId);
      if (teacherToDelete) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        showWarning('deleteTeacher', teacherToDelete);
        addNotification({
          title: 'Profesor eliminado',
          message: `Profesor "${teacherToDelete.nombre} ${teacherToDelete.apellido}" eliminado.`,
          type: 'warning',
          forUserId: 'admin',
          isGlobal: false
        });
      }
    },
    // CRUD MembershipPlans
    addMembershipPlan: (planData) => {
      const newPlan = { ...planData, id: `plan_${Date.now()}` };
      const planName = newPlan.name || 'Nuevo plan'; // Utilizar un valor por defecto si el nombre es undefined
      setMembershipPlans(prev => [...prev, newPlan]);
      showSuccess('addMembership', newPlan);
      addNotification({
        title: 'Nuevo Tipo de Membresía Creado',
        message: `Nuevo tipo de membresía "${planName}" creado.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    updateMembershipPlan: (updatedPlanData) => {
      setMembershipPlans(prev => prev.map(p => p.id === updatedPlanData.id ? updatedPlanData : p));
      showSuccess('updateMembership', updatedPlanData);
      addNotification({
        title: 'Tipo de membresía actualizado',
        message: `Tipo de membresía "${updatedPlanData.name}" actualizado.`,
        type: 'info',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    deleteMembershipPlan: (planId) => {
      const planToDelete = membershipPlans.find(p => p.id === planId);
      if (planToDelete) {
        setMembershipPlans(prev => prev.filter(p => p.id !== planId));
        showWarning('deleteMembership', planToDelete);
        addNotification({
          title: 'Tipo de Membresía Eliminado',
          message: `Tipo de membresía "${planToDelete.name}" eliminado.`,
          type: 'warning',
          forUserId: 'admin',
          isGlobal: false
        });
        // TODO: Considerar qué sucede con los clientes que tienen este plan asignado.
      }
    },
    // Attendance Records
    addAttendanceRecord: (newRecord) => {
      setAttendanceRecords(prevRecords => {
        const existingRecordIndex = prevRecords.findIndex(
          r => r.clientId === newRecord.clientId &&
            r.classId === newRecord.classId &&
            r.date === newRecord.date
        );

        if (existingRecordIndex > -1) {
          const updatedRecords = [...prevRecords];
          updatedRecords[existingRecordIndex] = {
            ...updatedRecords[existingRecordIndex],
            status: newRecord.status,
            recordedAt: newRecord.recordedAt
          };
          console.log("Registro de asistencia actualizado:", updatedRecords[existingRecordIndex]);
          return updatedRecords;
        } else {
          const recordWithId = { ...newRecord, id: `att_${Date.now()}_${newRecord.clientId}` };
          console.log("Nuevo registro de asistencia:", recordWithId);
          return [...prevRecords, recordWithId];
        }
      });
    },
    // CRUD Artículos
    addArticle: (articleData) => {
      const newArticle = { ...articleData, id: `art_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      setArticles(prev => [...prev, newArticle]);
      showSuccess('addArticle', newArticle);
      addNotification({
        title: 'Artículo Creado',
        message: `Artículo "${newArticle.title}" creado.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    updateArticle: (updatedArticleData) => {
      const articleWithUpdateDate = { ...updatedArticleData, updatedAt: new Date().toISOString() };
      setArticles(prev => prev.map(a => a.id === articleWithUpdateDate.id ? articleWithUpdateDate : a));
      showSuccess('updateArticle', articleWithUpdateDate);
      addNotification({
        title: 'Artículo actualizado',
        message: `Artículo "${articleWithUpdateDate.title}" actualizado.`,
        type: 'info',
        forUserId: 'admin',
        isGlobal: false
      });
    },
    deleteArticle: (articleId) => {
      const articleToDelete = articles.find(a => a.id === articleId);
      if (articleToDelete) {
        setArticles(prev => prev.filter(a => a.id !== articleId));
        showWarning('deleteArticle', articleToDelete);
        addNotification({
          title: 'Artículo Eliminado',
          message: `Artículo "${articleToDelete.title}" eliminado.`,
          type: 'warning',
          forUserId: 'admin',
          isGlobal: false
        });
      }
    }
  }), [clients, gymClasses, teachers, enrollments, attendanceRecords, articles, membershipPlans, currentUser, notifications, isLoading, loginUser, logoutUser, addNotification, markNotificationAsRead, clearUserNotifications, addClient, updateClient, deleteClient, addGymClass, updateGymClass, deleteGymClass, enrollToClass, cancelEnrollment, updateClientMembership, submitFeedback, isLoggingOut, setIsLoggingOut]);

  return (
    <SharedDataContext.Provider value={contextValue}>
      {children}
    </SharedDataContext.Provider>
  );
};
