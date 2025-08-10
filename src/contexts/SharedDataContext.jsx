import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getClients, saveClients,
  getTeachers, saveTeachers,
  getGymClasses, saveGymClasses,
  getClassEnrollments, saveClassEnrollments,
  getAttendanceRecords, saveAttendanceRecords,
  getArticles, saveArticles,
  getFeedbacks, saveFeedbacks
} from '../utils/storage';
import { showSuccess, showError } from '../utils/alerts';
import { generateClientCode } from '../utils/codeUtils';

export const SharedDataContext = createContext(null);

// Datos iniciales simulados si localStorage está vacío
const initialSimulatedClasses = [
  { id: 'class1', nombre: 'Yoga Matutino', profesor: 'teach_1', dia: 'Lunes', horaInicio: '08:00', horaFin: '09:00', capacidad: 20, activo: true },
  { id: 'class2', nombre: 'HIIT Intenso', profesor: 'teach_2', dia: 'Martes', horaInicio: '18:00', horaFin: '18:45', capacidad: 15, activo: true },
];

const initialSimulatedEnrollments = [
  // { userId: 'client_17...', classId: 'class1', enrollmentDate: '2024-07-28T...' }
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
    const storedClients = getClients();
    const storedGymClasses = getGymClasses();
    const storedTeachers = getTeachers();
    const storedEnrollments = getClassEnrollments();
    const storedAttendance = getAttendanceRecords();
    const storedArticles = getArticles();
    const storedFeedbacks = getFeedbacks();
    let storedCurrentUser = null;
    try {
      const raw = localStorage.getItem('currentUserSession');
      storedCurrentUser = raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error parsing currentUserSession from localStorage:', error);
      localStorage.removeItem('currentUserSession');
      storedCurrentUser = null;
    }

    setClients(storedClients);
    setGymClasses(Array.isArray(storedGymClasses) ? storedGymClasses : initialSimulatedClasses);
    setTeachers(Array.isArray(storedTeachers) ? storedTeachers : []);
    setEnrollments(storedEnrollments.length > 0 ? storedEnrollments : initialSimulatedEnrollments);
    setAttendanceRecords(storedAttendance);
    setArticles(storedArticles);
    setFeedbacks(Array.isArray(storedFeedbacks) ? storedFeedbacks : []);

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
      if (type === 'success') showSuccess(title, message);
      else if (type === 'error') showError(title, message);
      else showSuccess(title, message); // Default to success type for display
    }
    // Las notificaciones globales o para otros usuarios/admin se gestionarán en sus respectivos paneles.
  }, [currentUser]);

  // --- MANEJO DE CURRENTUSER (LOGIN/LOGOUT) ---
  const loginUser = useCallback((userData) => {
    const clientData = clients.find(c => c.email === userData.email); // Asumiendo login por email
    if (!clientData) {
      showError("Error de Inicio de Sesión", "Email o contraseña incorrectos.");
      return null;
    }
    // Admin y usuario de prueba: contraseña hardcodeada
    if (
      (clientData.email === 'admin@gogym.com' && userData.password === 'admin123') ||
      (clientData.email === 'user@gogym.com' && userData.password === 'user123')
    ) {
      setCurrentUser(clientData);
      localStorage.setItem('currentUserSession', JSON.stringify(clientData));
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
    showError("Error de Inicio de Sesión", "Email o contraseña incorrectos.");
    return null;
  }, [clients, addNotification]);

  const logoutUser = useCallback(() => {
    const userName = currentUser?.firstName;
    setIsLoggingOut(true); // 
    setCurrentUser(null);
    localStorage.removeItem('currentUserSession');
    if (userName) showSuccess("Sesión Cerrada", `¡Hasta pronto, ${userName}!`);
    else showSuccess("Sesión Cerrada", "Has cerrado sesión exitosamente.");
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
      showError("Error de Inscripción", "Usuario o clase no encontrados.");
      return false;
    }
    if (clase.enrolled >= clase.capacity) {
      showError("Clase Llena", `La clase "${clase.name}" no tiene cupos disponibles.`);
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
    addNotification({
      title: 'Inscripción Exitosa',
      message: `Inscripción exitosa a "${clase.name}".`,
      type: 'success',
      forUserId: userId,
      isGlobal: false
    });
    if (currentUser?.id !== userId) { // Si un admin inscribe a otro usuario
      addNotification({
        title: 'Inscripción de Usuario',
        message: `Has inscrito a ${user.firstName} en "${clase.name}".`,
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
      showError("Error", "Inscripción no encontrada.");
      return false;
    }
    const clase = gymClasses.find(c => c.id === enrollment.classId);

    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    if (clase) {
      setGymClasses(prevClasses =>
        prevClasses.map(c => c.id === enrollment.classId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c)
      );
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
      showError("Error", "Cliente no encontrado para actualizar membresía.");
      return;
    }
    const updatedClient = {
      ...client,
      membership: { ...(client.membership || {}), ...membershipDetails }
      // Asumimos que membershipDetails es un objeto como { planName, status, startDate, endDate, autoRenew }
    };
    updateClient(updatedClient); // Reutiliza la función de actualizar cliente
    addNotification({
      title: 'Membresía Actualizada',
      message: `Membresía de ${client.firstName} actualizada.`,
      type: 'success',
      forUserId: 'admin',
      isGlobal: false
    });
    if (client.id === currentUser?.id) { // Si es el usuario actual
      addNotification(`Tu membresía ha sido actualizada: ${membershipDetails.planName || ''} (${membershipDetails.status || ''})`, 'info', client.id);
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
        addNotification(`Profesor "${teacherToDelete.nombre} ${teacherToDelete.apellido}" eliminado.`, 'warning', 'admin');
      }
    },
    // CRUD MembershipPlans
    addMembershipPlan: (planData) => {
      const newPlan = { ...planData, id: `plan_${Date.now()}` };
      const planName = newPlan.name || 'Nuevo plan'; // Utilizar un valor por defecto si el nombre es undefined
      setMembershipPlans(prev => [...prev, newPlan]);
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
      addNotification(`Tipo de membresía "${updatedPlanData.name}" actualizado.`, 'info', 'admin');
    },
    deleteMembershipPlan: (planId) => {
      const planToDelete = membershipPlans.find(p => p.id === planId);
      if (planToDelete) {
        setMembershipPlans(prev => prev.filter(p => p.id !== planId));
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
      addNotification(`Artículo "${articleWithUpdateDate.title}" actualizado.`, 'info', 'admin');
    },
    deleteArticle: (articleId) => {
      const articleToDelete = articles.find(a => a.id === articleId);
      if (articleToDelete) {
        setArticles(prev => prev.filter(a => a.id !== articleId));
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
