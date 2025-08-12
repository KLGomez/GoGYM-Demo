import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTeachers, saveTeachers,
  getGymClasses, saveGymClasses,
  getClassEnrollments, saveClassEnrollments,
  getAttendanceRecords, saveAttendanceRecords,
  getArticles, saveArticles,
  getFeedbacks, saveFeedbacks,
  getMembershipPlans, saveMembershipPlans
} from '../utils/storage';
import { getUsers, createUser, updateUser, deleteUser } from '../api/users';
import { getClasses, createClass, updateClass, deleteClass } from '../api/classes';
import { login as apiLogin, getProfile } from '../api/auth';
import { getMemberships, createMembership, updateMembership, deleteMembership } from '../api/memberships';
import { showSuccess, showError, showWarning } from '../utils/alerts';
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
    const fetchData = async () => {
      setIsLoading(true);
      let storedCurrentUser = null;
      try {
  const raw = localStorage.getItem('currentUserSession');
  storedCurrentUser = raw ? JSON.parse(raw) : null;
      } catch (error) {
  // ...existing code...
        localStorage.removeItem('currentUserSession');
      }
      setCurrentUser(storedCurrentUser);
      try {
        if (storedCurrentUser && localStorage.getItem('token')) {
          const [classes, teachers, enrollments, attendance, articles, feedbacks, membershipPlans, apiClients] = await Promise.all([
            getGymClasses().catch(e => {console.error('[SharedDataContext] Error getGymClasses:', e); return [];}),
            getTeachers().catch(e => {console.error('[SharedDataContext] Error getTeachers:', e); return [];}),
            getClassEnrollments().catch(e => {console.error('[SharedDataContext] Error getClassEnrollments:', e); return [];}),
            getAttendanceRecords().catch(e => {console.error('[SharedDataContext] Error getAttendanceRecords:', e); return [];}),
            getArticles().catch(e => {console.error('[SharedDataContext] Error getArticles:', e); return [];}),
            getFeedbacks().catch(e => {console.error('[SharedDataContext] Error getFeedbacks:', e); return [];}),
            getMembershipPlans().catch(e => {console.error('[SharedDataContext] Error getMembershipPlans:', e); return [];}),
            getUsers().catch(e => {console.error('[SharedDataContext] Error getUsers:', e); return [];})
          ]);
          console.log('[SharedDataContext] membershipPlans received:', membershipPlans);
          setGymClasses(Array.isArray(classes) ? classes : []);
          setTeachers(Array.isArray(teachers) ? teachers : []);
          setEnrollments(Array.isArray(enrollments) ? enrollments : []);
          setAttendanceRecords(Array.isArray(attendance) ? attendance : []);
          setArticles(Array.isArray(articles) ? articles : []);
          setFeedbacks(Array.isArray(feedbacks) ? feedbacks : []);
          setMembershipPlans(Array.isArray(membershipPlans) ? membershipPlans : []);
          setClients(Array.isArray(apiClients) ? apiClients : []);
        } else {
          setGymClasses([]);
          setTeachers([]);
          setEnrollments([]);
          setAttendanceRecords([]);
          setArticles([]);
          setFeedbacks([]);
          setMembershipPlans([]);
          setClients([]);
        }
      } catch (error) {
  // ...existing code...
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // --- Persistencia en backend (ya no localStorage) ---
  // Los métodos save* ya usan el backend, pero solo se llaman en los CRUD, no en cada cambio de estado.


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

    // Lógica para mostrar alerta si es para el usuario actual y está logueado
    if (currentUser && forUserId === currentUser.id && !isGlobal) {
      if (type === 'success') showSuccess(notification.actionType || 'notification', notification.data || { title, text: message });
      else if (type === 'error') showError(notification.actionType || 'notification', notification.data || { title, text: message });
      else showSuccess(notification.actionType || 'notification', notification.data || { title, text: message }); // Default to success type for display
    }
    // Las notificaciones globales o para otros usuarios/admin se gestionarán en sus respectivos paneles.
  }, [currentUser]);

  // --- MANEJO DE CURRENTUSER (LOGIN/LOGOUT) ---
  const loginUser = useCallback(async (userData) => {
    try {
  const result = await apiLogin(userData.email, userData.password);
      if (result && result.access_token) {
        localStorage.setItem('token', result.access_token);
        // Esperar a que el token esté realmente en localStorage antes de pedir el perfil
        await new Promise(res => setTimeout(res, 150));
        const tokenCheck = localStorage.getItem('token');
  if (!tokenCheck) {
          setCurrentUser(null);
          localStorage.removeItem('currentUserSession');
          localStorage.removeItem('token');
          return null;
        }
        const profile = await getProfile();
        setCurrentUser(profile);
        localStorage.setItem('currentUserSession', JSON.stringify(profile));
        showSuccess('successLogin', profile);
        addNotification({
          title: 'Inicio de Sesión Exitoso',
          message: `Bienvenido/a ${profile.nombre ? profile.nombre + ' ' + (profile.apellido || '') : profile.email}!`,
          type: 'success',
          forUserId: profile._id || profile.id,
          isGlobal: true
        });
        return profile;
      } else {
        showError('errorLogin');
        return null;
      }
    } catch (error) {
      showError('errorLogin');
  // ...existing code...
      return null;
    }
  }, [addNotification]);

  const logoutUser = useCallback(() => {
    const userName = currentUser?.firstName;
    setIsLoggingOut(true);
    setCurrentUser(null);
    localStorage.removeItem('currentUserSession');
    localStorage.removeItem('token');
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
  const addClient = useCallback(async (clientDataFromForm) => {
    try {
      const clientWithCode = {
        ...clientDataFromForm,
        alphanumericCode: generateClientCode(clientDataFromForm.firstName, clientDataFromForm.lastName, clientDataFromForm.dni)
      };
      const newUser = await createUser(clientWithCode);
      setClients(prev => [...prev, newUser]);
      showSuccess('addClient', newUser);
      addNotification({
        title: 'Cliente Agregado exitosamente',
        message: `El cliente ${newUser.firstName} ha sido agregado exitosamente con código ${newUser.alphanumericCode}.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
      return newUser;
    } catch (error) {
      showError('errorAddClient');
      return null;
    }
  }, [addNotification]);

  const updateClient = useCallback(async (updatedClientData) => {
    try {
      // Regenerar código si cambian datos clave
      const originalClient = clients.find(c => c.id === updatedClientData.id);
      let updated = { ...updatedClientData };
      if (originalClient &&
        (originalClient.firstName !== updatedClientData.firstName ||
          originalClient.lastName !== updatedClientData.lastName ||
          originalClient.dni !== updatedClientData.dni)) {
        updated.alphanumericCode = generateClientCode(updatedClientData.firstName, updatedClientData.lastName, updatedClientData.dni);
      }
      const result = await updateUser(updated.id, updated);
      setClients(prev => prev.map(c => c.id === result.id ? result : c));
      showSuccess('updateClient', result);
      addNotification({
        title: 'Cliente actualizado',
        message: `Cliente ${result.firstName} actualizado exitosamente.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
      return result;
    } catch (error) {
      showError('errorUpdateClient');
      return null;
    }
  }, [clients, addNotification]);

  const deleteClient = useCallback(async (clientId) => {
    try {
      const clientToDelete = clients.find(c => c.id === clientId);
      await deleteUser(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      showWarning('deleteClient', clientToDelete);
      addNotification({
        title: 'Cliente Eliminado',
        message: `Cliente "${clientToDelete?.firstName || clientId}" eliminado.`,
        type: 'warning',
        forUserId: 'admin',
        isGlobal: false
      });
      return clientToDelete;
    } catch (error) {
      showError('errorDeleteClient');
      return null;
    }
  }, [clients, addNotification]);

  const addGymClass = useCallback(async (classData) => {
    try {
      const newClass = await createClass(classData);
      setGymClasses(prev => [...prev, newClass]);
      showSuccess('addClass', newClass);
      addNotification({
        title: 'Clase Creada',
        message: `Nueva clase "${newClass.nombre}" creada.`,
        type: 'success',
        forUserId: 'admin',
        isGlobal: false
      });
      return newClass;
    } catch (error) {
      showError('errorAddClass');
      return null;
    }
  }, [addNotification]);

  const updateGymClass = useCallback(async (updatedClassData) => {
    try {
      const updated = await updateClass(updatedClassData.id, updatedClassData);
      setGymClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
      showSuccess('updateClass', updated);
      addNotification({
        title: 'Clase Actualizada',
        message: `Clase "${updated.nombre}" actualizada.`,
        type: 'info',
        forUserId: 'admin',
        isGlobal: false
      });
      return updated;
    } catch (error) {
      showError('errorUpdateClass');
      return null;
    }
  }, [addNotification]);

  const deleteGymClass = useCallback(async (classId) => {
    try {
      const classToDelete = gymClasses.find(c => c.id === classId);
      await deleteClass(classId);
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
      return classToDelete;
    } catch (error) {
      showError('errorDeleteClass');
      return null;
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
    showSuccess('addEnrollment', { className: clase.name });
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
      return;
    }
    const updatedClient = {
      ...client,
      membership: { ...(client.membership || {}), ...membershipDetails }
      // Asumimos que membershipDetails es un objeto como { planName, status, startDate, endDate, autoRenew }
    };
    updateClient(updatedClient); // Reutiliza la función de actualizar cliente
    showSuccess('updateMembership', membershipDetails);
    addNotification({
      title: 'Membresía Actualizada',
      message: `Membresía de ${client.firstName} actualizada.`,
      type: 'success',
      forUserId: 'admin',
      isGlobal: false
    });
    if (client.id === currentUser?.id) { // Si es el usuario actual
      addNotification({
        title: 'Membresía actualizada',
        message: `Tu membresía ha sido actualizada: ${membershipDetails.planName || ''} (${membershipDetails.status || ''})`,
        type: 'info',
        forUserId: client.id,
        isGlobal: false
      });
    }
  }, [clients, updateClient, currentUser, addNotification]);


  // --- Feedback (Usuario) ---
  const submitFeedback = useCallback((feedbackData) => {
    // feedbackData: { classId, className, rating, comment, userId, user, date }
    const newFeedback = {
      ...feedbackData,
      id: `fb_${Date.now()}_${Math.floor(Math.random() * 10000)}`
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
    addTeacher: async (teacherData) => {
      try {
        const newTeacher = await createTeacher(teacherData);
        setTeachers(prev => [...prev, newTeacher]);
        showSuccess('addTeacher', newTeacher);
        addNotification({
          title: 'Profesor Agregado',
          message: `Profesor "${newTeacher.nombre} ${newTeacher.apellido}" agregado.`,
          type: 'success',
          forUserId: 'admin',
          isGlobal: false
        });
        return newTeacher;
      } catch (error) {
        showError('errorAddTeacher');
        return null;
      }
    },
    updateTeacher: async (updatedTeacherData) => {
      try {
        const updated = await apiUpdateTeacher(updatedTeacherData.id, updatedTeacherData);
        setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
        showSuccess('updateTeacher', updated);
        addNotification({
          title: 'Profesor Actualizado',
          message: `Profesor "${updated.nombre} ${updated.apellido}" actualizado.`,
          type: 'info',
          forUserId: 'admin',
          isGlobal: false
        });
        return updated;
      } catch (error) {
        showError('errorUpdateTeacher');
        return null;
      }
    },
    deleteTeacher: async (teacherId) => {
      try {
        const teacherToDelete = teachers.find(t => t.id === teacherId);
        await apiDeleteTeacher(teacherId);
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        showWarning('deleteTeacher', teacherToDelete);
        addNotification({
          title: 'Profesor eliminado',
          message: `Profesor "${teacherToDelete?.nombre} ${teacherToDelete?.apellido}" eliminado.`,
          type: 'warning',
          forUserId: 'admin',
          isGlobal: false
        });
        return teacherToDelete;
      } catch (error) {
        showError('errorDeleteTeacher');
        return null;
      }
    },
    // CRUD MembershipPlans
    addMembershipPlan: async (planData) => {
      try {
        console.log('[addMembershipPlan] Enviando plan al backend:', planData);
    const newPlan = await createMembership({ ...planData, id: planData.id || Date.now() });
        console.log('[addMembershipPlan] Respuesta del backend:', newPlan);
        const planName = newPlan.nombre || newPlan.name || 'Nuevo plan';
        setMembershipPlans(prev => [...prev, newPlan]);
        showSuccess('addMembership', newPlan);
        addNotification({
          title: 'Nuevo Tipo de Membresía Creado',
          message: `Nuevo tipo de membresía "${planName}" creado.`,
          type: 'success',
          forUserId: 'admin',
          isGlobal: false
        });
        return newPlan;
      } catch (error) {
        console.error('[addMembershipPlan] Error al crear plan:', error);
        showError('errorAddMembership');
        return null;
      }
    },
    updateMembershipPlan: async (updatedPlanData) => {
      try {
        const updated = await updateMembership(updatedPlanData.id, updatedPlanData);
        setMembershipPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
        showSuccess('updateMembership', updated);
        addNotification({
          title: 'Tipo de membresía actualizado',
          message: `Tipo de membresía "${updated.name}" actualizado.`,
          type: 'info',
          forUserId: 'admin',
          isGlobal: false
        });
        return updated;
      } catch (error) {
        showError('errorUpdateMembership');
        return null;
      }
    },
    deleteMembershipPlan: async (planId) => {
      try {
        if (!planId || typeof planId !== 'string') {
          console.error('[deleteMembershipPlan] ID de plan inválido:', planId);
          showError('errorDeleteMembership', 'ID de plan inválido');
          return null;
        }
        const planToDelete = membershipPlans.find(p => p.id === planId || p._id === planId);
        if (!planToDelete) {
          console.error('[deleteMembershipPlan] No se encontró el plan a eliminar:', planId);
          showError('errorDeleteMembership', 'No se encontró el plan a eliminar');
          return null;
        }
        const resp = await deleteMembership(planId);
        if (resp && resp.error) {
          console.error('[deleteMembershipPlan] Error desde backend:', resp.error);
          showError('errorDeleteMembership', resp.error);
          return null;
        }
        setMembershipPlans(prev => prev.filter(p => p.id !== planId && p._id !== planId));
        showWarning('deleteMembership', planToDelete);
        addNotification({
          title: 'Tipo de Membresía Eliminado',
          message: `Tipo de membresía "${planToDelete.nombre || planToDelete.name}" eliminado.`,
          type: 'warning',
          forUserId: 'admin',
          isGlobal: false
        });
        return planToDelete;
      } catch (error) {
        console.error('[deleteMembershipPlan] Error inesperado:', error);
        showError('errorDeleteMembership', error?.message || 'Error inesperado');
        return null;
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
