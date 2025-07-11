import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
    getClients, saveClients,
    getTeachers, saveTeachers,
    getGymClasses, saveGymClasses,
    getClassEnrollments, saveClassEnrollments,
    getAttendanceRecords, saveAttendanceRecords,
    getArticles, saveArticles // Importar getArticles y saveArticles
} from '../utils/storage';
import { showSuccess, showError } from '../utils/alerts';
import { generateClientCode } from '../utils/codeUtils';

export const SharedDataContext = createContext(null);

// Datos iniciales simulados si localStorage está vacío
const initialSimulatedClasses = [
  { id: 'class1', name: 'Yoga Matutino', instructor: 'Ana Pérez', day: 'Lunes', time: '08:00 AM', duration: '60 min', capacity: 20, enrolled: 15, description: 'Empieza el día con energía y flexibilidad.', location: 'Sala Zen' },
  { id: 'class2', name: 'HIIT Intenso', instructor: 'Carlos Ruiz', day: 'Martes', time: '06:00 PM', duration: '45 min', capacity: 15, enrolled: 15, description: 'Entrenamiento de alta intensidad para quemar calorías.', location: 'Sala Energía' },
  { id: 'class3', name: 'Pilates Restaurativo', instructor: 'Laura Gómez', day: 'Miércoles', time: '09:00 AM', duration: '75 min', capacity: 18, enrolled: 10, description: 'Fortalece tu core y mejora tu postura.', location: 'Estudio CuerpoMente' },
  { id: 'class4', name: 'Zumba Fiesta', instructor: 'Sofía Luna', day: 'Jueves', time: '07:00 PM', duration: '60 min', capacity: 25, enrolled: 22, description: 'Baila, diviértete y ponte en forma.', location: 'Estudio Principal' },
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

  // --- Carga Inicial de Datos ---
  useEffect(() => {
    console.log("SharedDataContext: Cargando datos iniciales...");
    const storedClients = getClients();
    const storedGymClasses = getGymClasses();
    const storedTeachers = getTeachers();
    const storedEnrollments = getClassEnrollments();
    const storedAttendance = getAttendanceRecords();
    const storedArticles = getArticles();
    const storedMembershipPlans = getFromLocalStorage('membershipPlans', []); // Cargar tipos de membresía
    const storedCurrentUser = JSON.parse(localStorage.getItem('currentUserSession'));

    setClients(storedClients);
    setGymClasses(storedGymClasses.length > 0 ? storedGymClasses : initialSimulatedClasses);
    setTeachers(storedTeachers);
    setEnrollments(storedEnrollments.length > 0 ? storedEnrollments : initialSimulatedEnrollments);
    setAttendanceRecords(storedAttendance);
    setArticles(storedArticles);

    // Asegurar usuarios por defecto si no existen
    let finalClients = [...storedClients];
    const adminExists = finalClients.some(c => c.role === 'admin' && c.email === 'admin@gogym.com');
    if (!adminExists) {
      const adminUser = {
        id: 'admin_default_001',
        firstName: 'Admin', lastName: 'GoGym', email: 'admin@gogym.com', password: 'adminpass', role: 'admin',
        dni: '00000000', alphanumericCode: generateClientCode('Admin', 'GoGym', '00000000'),
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

    // Si se añadieron usuarios por defecto, actualizar el estado y localStorage
    // Esta comparación es importante para no disparar un save innecesario si no hubo cambios.
    if (finalClients.length > storedClients.length) {
        setClients(finalClients);
        // La persistencia se manejará por el useEffect de `clients`
    } else {
        setClients(storedClients); // Si no hubo cambios, usar los originales de localStorage
    }

    if (storedCurrentUser) {
      // Buscar en finalClients que podría tener los usuarios por defecto recién añadidos
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
    console.log("SharedDataContext: Datos cargados.", { storedClients, storedGymClasses, storedTeachers, storedEnrollments, storedAttendance, storedCurrentUser });
  }, []);

  // --- Persistencia en localStorage ---
  useEffect(() => { if (!isLoading) saveClients(clients); }, [clients, isLoading]);
  useEffect(() => { if (!isLoading) saveGymClasses(gymClasses); }, [gymClasses, isLoading]);
  useEffect(() => { if (!isLoading) saveTeachers(teachers); }, [teachers, isLoading]);
  useEffect(() => { if (!isLoading) saveClassEnrollments(enrollments); }, [enrollments, isLoading]);
  useEffect(() => { if (!isLoading) saveAttendanceRecords(attendanceRecords); }, [attendanceRecords, isLoading]);
  useEffect(() => { if (!isLoading) saveArticles(articles); }, [articles, isLoading]);
  useEffect(() => { if (!isLoading) saveToLocalStorage('membershipPlans', membershipPlans); }, [membershipPlans, isLoading]); // Persistir membershipPlans


  // --- MANEJO DE CURRENTUSER (LOGIN/LOGOUT) ---
  const loginUser = useCallback((userData) => {
    const clientData = clients.find(c => c.email === userData.email); // Asumiendo login por email
    if (clientData && clientData.password === userData.password) { // Comparación directa (NO SEGURO PARA PRODUCCIÓN)
      setCurrentUser(clientData);
      localStorage.setItem('currentUserSession', JSON.stringify(clientData));
      addNotification(`Bienvenido de nuevo, ${clientData.firstName}!`, 'success', clientData.id, true);
      return clientData;
    }
    showError("Error de Inicio de Sesión", "Email o contraseña incorrectos.");
    return null;
  }, [clients]);

  const logoutUser = useCallback(() => {
    const userName = currentUser?.firstName;
    setCurrentUser(null);
    localStorage.removeItem('currentUserSession');
    // No se limpia el array de notificaciones global, pero las nuevas no serán para este usuario
    // Opcional: Mostrar una alerta de despedida
    if(userName) showSuccess("Sesión Cerrada", `¡Hasta pronto, ${userName}!`);
    else showSuccess("Sesión Cerrada", "Has cerrado sesión exitosamente.");
  }, [currentUser]);


  // --- NOTIFICACIONES ---
  const addNotification = useCallback((message, type = 'info', forUserId = null, isGlobal = false) => {
    // forUserId: null para admin, o un ID específico de usuario.
    // isGlobal: true si es para todos los usuarios (ej. mantenimiento)
    //           false si es específica (ej. tu clase fue cancelada)
    // En esta versión simplificada, forUserId puede ser 'admin' o un ID de cliente.
    // Si es para el currentUser y está logueado, se muestra inmediatamente.

    const newNotif = {
      id: `notif_${Date.now()}`,
      message,
      type,
      timestamp: new Date(),
      read: false,
      forUserId: forUserId, // null o 'admin' para admin, o ID de cliente
      isGlobal // Si es global, todos los usuarios deberían verla (si aplica)
    };
    setNotifications(prev => [...prev, newNotif]);
    console.log("Notificación añadida:", newNotif);

    // Lógica para mostrar alerta si es para el usuario actual y está logueado
    if (currentUser && forUserId === currentUser.id && !isGlobal) {
        if (type === 'success') showSuccess("Notificación", message);
        else if (type === 'error') showError("Notificación", message);
        else showSuccess("Notificación", message); // Default to success type for display
    }
    // Las notificaciones globales o para otros usuarios/admin se gestionarán en sus respectivos paneles.
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
    addNotification(`Nuevo cliente "${clientWithCode.firstName}" agregado con código ${clientWithCode.alphanumericCode}.`, 'success', 'admin');
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
      addNotification(`Código de cliente para "${updatedClientData.firstName}" regenerado a ${updatedClientData.alphanumericCode} debido a cambio de datos.`, 'info', 'admin');
    }

    setClients(prev => {
      const newClients = prev.map(c => c.id === updatedClientData.id ? updatedClientData : c);
      // saveClients(newClients);
      return newClients;
    });
    // Si el cliente actualizado es el currentUser, actualizarlo también
    if (currentUser && currentUser.id === updatedClientData.id) {
        setCurrentUser(updatedClientData);
        localStorage.setItem('currentUserSession', JSON.stringify(updatedClientData));
    }
    addNotification(`Cliente "${updatedClientData.firstName}" actualizado.`, 'info', 'admin');
  }, [currentUser, addNotification]);

  const deleteClient = useCallback((clientId) => {
    const clientToDelete = clients.find(c => c.id === clientId);
    setClients(prev => {
      const newClients = prev.filter(c => c.id !== clientId);
      // saveClients(newClients);
      return newClients;
    });
    if (clientToDelete) {
      addNotification(`Cliente "${clientToDelete.firstName}" eliminado.`, 'warning', 'admin');
    }
    if (currentUser && currentUser.id === clientId) { // Si el admin se autoelimina o elimina al user actual
        logoutUser(); // Forzar logout
    }
  }, [clients, currentUser, logoutUser, addNotification]);


  // --- CRUD Clases (Admin) ---
  const addGymClass = useCallback((classData) => {
    setGymClasses(prev => [...prev, { ...classData, id: `class_${Date.now()}` }]);
    addNotification(`Nueva clase "${classData.name}" agregada.`, 'success', 'admin');
  }, [addNotification]);

  const updateGymClass = useCallback((updatedClassData) => {
    setGymClasses(prev => prev.map(c => c.id === updatedClassData.id ? updatedClassData : c));
    addNotification(`Clase "${updatedClassData.name}" actualizada.`, 'info', 'admin');
    // Notificar a usuarios inscritos si hay cambios relevantes (ej. cancelación, horario)
    // Esto es más complejo y requeriría buscar en enrollments.
  }, [addNotification]);

  const deleteGymClass = useCallback((classId) => {
    const classToDelete = gymClasses.find(c => c.id === classId);
    setGymClasses(prev => prev.filter(c => c.id !== classId));
    // También eliminar inscripciones asociadas
    setEnrollments(prev => prev.filter(e => e.classId !== classId));
    if (classToDelete) {
      addNotification(`Clase "${classToDelete.name}" eliminada. Inscripciones asociadas también eliminadas.`, 'warning', 'admin');
      // Notificar a usuarios inscritos que la clase fue cancelada.
      const enrolledUsers = enrollments.filter(e => e.classId === classId).map(e => e.userId);
      enrolledUsers.forEach(userId => {
        addNotification(`La clase "${classToDelete.name}" ha sido cancelada por el administrador.`, 'warning', userId);
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
    addNotification(`Inscripción exitosa a "${clase.name}".`, 'success', userId);
    if (currentUser?.id !== userId) { // Si un admin inscribe a otro usuario
        addNotification(`Has inscrito a ${user.firstName} en "${clase.name}".`, 'success', 'admin');
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
      addNotification(`Has cancelado tu inscripción a "${clase.name}".`, 'info', enrollment.userId);
      if (currentUser?.id !== enrollment.userId && currentUser?.role === 'admin') { // Si un admin cancela para otro
          const user = clients.find(u => u.id === enrollment.userId);
          addNotification(`Cancelaste la inscripción de ${user?.firstName || 'un usuario'} a "${clase.name}".`, 'info', 'admin');
      }
    }
    return true;
  }, [enrollments, gymClasses, clients, currentUser, addNotification]);

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
    addNotification(`Membresía de ${client.firstName} actualizada.`, 'success', 'admin');
    if (client.id === currentUser?.id) { // Si es el usuario actual
        addNotification(`Tu membresía ha sido actualizada: ${membershipDetails.planName || ''} (${membershipDetails.status || ''})`, 'info', client.id);
    }
  }, [clients, updateClient, currentUser, addNotification]);


  // --- Feedback (Usuario) ---
  const submitFeedback = useCallback((feedbackData) => {
    // feedbackData: { classId, className, rating, comment, userId }
    // En una app real, esto se guardaría en localStorage o se enviaría a un backend.
    console.log("Feedback Recibido (SharedDataContext):", feedbackData);
    // Guardar en localStorage (ejemplo, no implementado en storage.js aún)
    // const feedbacks = getFromLocalStorage('feedbacks', []);
    // saveToLocalStorage('feedbacks', [...feedbacks, feedbackData]);
    addNotification(`Gracias por tu feedback sobre "${feedbackData.className}".`, 'success', feedbackData.userId);
  }, [addNotification]);


  const contextValue = {
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
    addTeacher: (teacherData) => {
      setTeachers(prev => [...prev, { ...teacherData, id: teacherData.id || `teach_${Date.now()}` }]);
      addNotification(`Profesor "${teacherData.name}" agregado.`, 'success', 'admin');
    },
    updateTeacher: (updatedTeacherData) => {
      setTeachers(prev => prev.map(t => t.id === updatedTeacherData.id ? updatedTeacherData : t));
      addNotification(`Profesor "${updatedTeacherData.name}" actualizado.`, 'info', 'admin');
    },
    deleteTeacher: (teacherId) => {
      const teacherToDelete = teachers.find(t => t.id === teacherId);
      if (teacherToDelete) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        addNotification(`Profesor "${teacherToDelete.name}" eliminado.`, 'warning', 'admin');
      }
    },
    // CRUD MembershipPlans
    addMembershipPlan: (planData) => {
      const newPlan = { ...planData, id: `plan_${Date.now()}` };
      setMembershipPlans(prev => [...prev, newPlan]);
      addNotification(`Nuevo tipo de membresía "${newPlan.name}" creado.`, 'success', 'admin');
    },
    updateMembershipPlan: (updatedPlanData) => {
      setMembershipPlans(prev => prev.map(p => p.id === updatedPlanData.id ? updatedPlanData : p));
      addNotification(`Tipo de membresía "${updatedPlanData.name}" actualizado.`, 'info', 'admin');
    },
    deleteMembershipPlan: (planId) => {
      const planToDelete = membershipPlans.find(p => p.id === planId);
      if (planToDelete) {
        setMembershipPlans(prev => prev.filter(p => p.id !== planId));
        addNotification(`Tipo de membresía "${planToDelete.name}" eliminado.`, 'warning', 'admin');
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
      addNotification(`Artículo "${newArticle.title}" creado.`, 'success', 'admin');
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
        addNotification(`Artículo "${articleToDelete.title}" eliminado.`, 'warning', 'admin');
      }
    }
  };

  return (
    <SharedDataContext.Provider value={contextValue}>
      {children}
    </SharedDataContext.Provider>
  );
};
