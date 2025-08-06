import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { showError, confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto
import {ChatBubbleLeftIcon, UserIcon, CalendarDaysIcon} from '@heroicons/react/24/outline'; // Importar íconos de Heroicons
const StarRating = ({ rating }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        star <= rating ? (
          <StarSolid key={star} className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutline key={star} className="h-5 w-5 text-yellow-400" />
        )
      ))}
    </div>
  );
};


const UserFeedback = () => {
  const { currentUser, submitFeedback: contextSubmitFeedback, isLoading, feedbacks } = useContext(SharedDataContext); // Usar el contexto
  const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : []; // Asegurarse de que feedbacks sea un array
  const myFeedbacks = safeFeedbacks?.filter(fb => fb.userId === currentUser?.id) || []; // Filtrar feedbacks del usuario actual

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const classIdParam = searchParams.get('classId');
  const classNameParam = searchParams.get('className');

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [feedbackTarget, setFeedbackTarget] = useState({ id: classIdParam, name: classNameParam });
  

  useEffect(() => {
    if (!isLoading && !currentUser) {
      showError("Acceso Denegado", "Debes iniciar sesión para dejar feedback.");
      navigate('/login');
    } else if (classIdParam && classNameParam) {
      setFeedbackTarget({ id: classIdParam, name: classNameParam });
    } else if (!isLoading && currentUser && (!classIdParam || !classNameParam)) {
      const savedClassId = localStorage.getItem("feedbackClassId");
      const savedClassName = localStorage.getItem("feedbackClassName");

      if (savedClassId && savedClassName) {
        setFeedbackTarget({ id: savedClassId, name: savedClassName });
      } else {
        console.log("No se especificó clase para feedback en URL ni en localStorage.");
      }
        // Si está logueado pero no hay params, podría mostrar un selector o mensaje
        console.log("No se especificó clase para feedback en URL, pero usuario está logueado.");
        // Dejar feedbackTarget como está o limpiarlo para que muestre el mensaje de "No se ha especificado"
    }
  }, [classIdParam, classNameParam, currentUser, isLoading, navigate]);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (rating === 0) {
      showError("Calificación Requerida", "Por favor, selecciona una calificación de estrellas.");
      return;
    }
    if (comment.trim() === '') {
      showError("Comentario Requerido", "Por favor, escribe un comentario sobre tu experiencia.");
      return;
    }

    confirmAction(
      "Confirmar Envío",
      `¿Estás seguro de que deseas enviar este feedback para la clase "${feedbackTarget.name}"?`,
      "Sí, enviar",
      () => {
        if (!currentUser) {
          showError("Error", "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.");
          return;
        }
        contextSubmitFeedback({ // Enviar feedback al contexto
          classId: feedbackTarget.id,
          className: feedbackTarget.name,
          rating,
          comment,
          userId: currentUser.id,
          user: currentUser.name || currentUser.fullName || 'Usuario', // para mostrarlo
          date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) // 02 de agosto de 2025
        });

        // 💾 Guardar en localStorage
        localStorage.setItem("feedbackClassId", feedbackTarget.id);
        localStorage.setItem("feedbackClassName", feedbackTarget.name);
        console.log("Guardado en localStorage:", feedbackTarget.id, feedbackTarget.name);


        });
        // La notificación de éxito ya la da contextSubmitFeedback.
        // showSuccess("¡Feedback Enviado!", `Gracias por tu feedback sobre "${feedbackTarget.name}".`);
        setRating(0);
        setComment('');
        navigate('/user/mis-clases'); // Redirigir después de enviar
      };

  if (isLoading) {
    return <p className="text-center text-white text-xl py-10">Cargando...</p>;
  }

  // El useEffect ya maneja la redirección si no hay currentUser.
  // Si no hay feedbackTarget.id o name (porque no se pasaron por URL y el usuario está logueado), mostrar mensaje.
  
  // Si hay classId y className en la URL, mostrar el formulario de feedback

    const otherUsersFeedbacks = [
      {
        id: 'other1',
        className: 'CrossFit Intensivo',
        user: 'María González',
        rating: 4,
        comment: 'Excelente clase, muy desafiante pero motivadora. El instructor explica muy bien cada ejercicio.',
        date: '30 de julio de 2025',
      },
      {
        id: 'other2',
        className: 'CrossFit Intensivo',
        user: 'Pedro López',
        rating: 4,
        comment: 'Muy buena clase, aunque un poco intensa para principiantes. Recomiendo tener experiencia previa.',
        date: '30 de julio de 2025',
      }
      ];

  //Calcular estadísticas
  const calculateStats = () => {
    const allFeedbacks = [...safeFeedbacks, ...otherUsersFeedbacks];
    const totalComments = allFeedbacks.length;
    const myComments = myFeedbacks.length;
    const averageRating = totalComments > 0 
      ? (allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalComments).toFixed(1)
      : 0;

    return {
      totalComments,
      averageRating,
      myComments
    };
  };
  
  const stats = calculateStats();

if (!feedbackTarget.id || !feedbackTarget.name) {

  return (
    <div className="container mx-auto p-4">
      {/* Botón Volver */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-orange-500 hover:text-orange-600 font-semibold flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="text-3xl font-semibold text-white mb-8">Feedback de Clases</h1>

      {/* Secciones: Mis Comentarios, Otros Usuarios, Estadísticas */}
      <div className="flex-1 bg-gray-900 text-white p-8 rounded-lg">
        {/* tu código existente: Mis Comentarios, Otros, Estadísticas... */}
      </div>
    </div>
  );
}

  console.log("Feedbacks globales:", feedbacks);
  console.log("Mis feedbacks:", myFeedbacks);
  if (!feedbackTarget.id || !feedbackTarget.name) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-semibold text-white mb-6">Dejar Feedback</h1>
        <p className="text-gray-400">
          Para dejar feedback, primero selecciona una clase de tu historial en "Mis Clases".
        </p>
        <button
          onClick={() => navigate('/user/mis-clases')}
          className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Ir a Mis Clases
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => navigate(-1)} // Volver a la página anterior
        className="mb-6 text-orange-500 hover:text-orange-600 font-semibold flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="text-3xl font-semibold text-white mb-2">Feedback para la Clase</h1>
      <p className="text-xl text-orange-400 mb-8">{feedbackTarget.name}</p>

      <form onSubmit={handleSubmitFeedback} className="bg-gray-800 text-white shadow-lg rounded-xl p-6 max-w-2xl mx-auto mb-12">
        <div className="mb-6">
          <label className="block text-gray-400 text-lg font-semibold mb-2">Calificación General:</label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {(hoverRating || rating) >= star ? (
                  <StarSolid className="h-8 w-8 text-yellow-400" />
                ) : (
                  <StarOutline className="h-8 w-8 text-yellow-400" />
                )}
              </button>
            ))}
            {rating > 0 && <span className="ml-3 text-gray-400">({rating} de 5 estrellas)</span>}
            {rating > 0 && <span className="ml-3 text-gray-600">({rating} de 5 estrellas)</span>}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-400 text-lg font-semibold mb-2">
            Tu Comentario:
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="5"
            placeholder={`¿Qué te pareció la clase "${feedbackTarget.name}"?`}
            className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-150 ease-in-out"
            disabled={rating === 0 || comment.trim() === ''}
          >
            Enviar Feedback
          </button>
        </div>
      </form>

    <div className="flex-1 bg-gray-900 text-white p-8 rounded-2xl shadow-2xl border border-gray-700">
      <h1 className="text-3xl font-bold mb-8">Feedback de Clases</h1>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Mis Comentarios */}
        <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mis Comentarios</h2>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-8">
              <ChatBubbleLeftIcon className="w-5 h-5 inline-block mr-2" />
              <p className="text-gray-500">No has dejado ningún feedback aún.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myFeedbacks.map((feedback) => (
                <div key={`${feedback.id}-${feedback.userId}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{feedback.className}</h3>
                    <StarRating rating={feedback.rating} interactive={false} />
                  </div>
                  <div className="flex items-center text-sm text-gray-200 mb-2">
                    <UserIcon className="w-5 h-5 inline-block mr-2" />
                    <span className="text-white bg-blue-800 px-2 py-1 rounded text-xs mr-2">
                      {feedback.user}
                    </span>
                    <CalendarDaysIcon className="w-5 h-5 inline-block mr-2" />
                    <span>{feedback.date}</span>
                  </div>
                  <div className="bg-gray-700 rounded p-3">
                    <p className="text-gray-300 italic">"{feedback.comment}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comentarios de Otros Usuarios */}
        <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Comentarios de Otros Usuarios</h2>
          
          <div className="space-y-4">
            {otherUsersFeedbacks.map((feedback) => (
              <div key={`${feedback.id}-${feedback.userId}`} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{feedback.className}</h3>
                  <StarRating rating={feedback.rating} interactive={false} />
                </div>
                <div className="flex items-center text-sm text-gray-200 mb-2">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>{feedback.user}</span>
                  <CalendarDaysIcon className="w-4 h-4 mr-1 ml-4" />
                  <span>{feedback.date}</span>
                </div>
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-300 italic">"{feedback.comment}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">Estadísticas Generales</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center bg-gray-700 rounded-lg p-6">
          <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalComments}</div>
          <div className="text-gray-300">Total Comentarios</div>
        </div>
          
          <div className="text-center bg-gray-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-green-600 mb-2">{stats.averageRating}</div>
            <div className="text-gray-300">Calificación Promedio</div>
          </div>
          
          <div className="text-center bg-gray-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-red-600 mb-2">{stats.myComments}</div>
            <div className="text-gray-300">Mis Comentarios</div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserFeedback;
