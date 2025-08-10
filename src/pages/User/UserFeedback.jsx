import React, { useState, useEffect, useContext } from 'react'; // Importar useContext
import { useSearchParams, useNavigate } from 'react-router-dom';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { showError, confirmAction } from '../../utils/alerts';
import { SharedDataContext } from '../../contexts/SharedDataContext'; // Importar el contexto

const UserFeedback = () => {
  const { currentUser, submitFeedback: contextSubmitFeedback, isLoading } = useContext(SharedDataContext); // Usar el contexto
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
        contextSubmitFeedback({
          classId: feedbackTarget.id,
          className: feedbackTarget.name,
          rating,
          comment,
          userId: currentUser.id
        });
        // La notificación de éxito ya la da contextSubmitFeedback.
        // showSuccess("¡Feedback Enviado!", `Gracias por tu feedback sobre "${feedbackTarget.name}".`);
        setRating(0);
        setComment('');
        navigate('/user/mis-clases'); // Redirigir después de enviar
      }
    );
  };

  if (isLoading) {
    return <p className="text-center text-white text-xl py-10 bg-gray-800 min-h-screen">Cargando...</p>;
  }

  // El useEffect ya maneja la redirección si no hay currentUser.
  // Si no hay feedbackTarget.id o name (porque no se pasaron por URL y el usuario está logueado), mostrar mensaje.
  if (!feedbackTarget.id || !feedbackTarget.name) {
    return (
      <div className="container mx-auto p-4 text-center bg-gray-800 min-h-screen">
        <h1 className="text-3xl font-bold text-orange-400 mb-6">Dejar Feedback</h1>
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
  <div className="container mx-auto p-4 bg-gray-800 min-h-screen rounded-xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-orange-400 hover:text-orange-500 font-semibold flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Volver
      </button>

      <h1 className="text-3xl font-bold text-orange-400 mb-2">Feedback para la Clase</h1>
      <p className="text-xl text-white mb-8">{feedbackTarget.name}</p>

      <form onSubmit={handleSubmitFeedback} className="bg-gray-800 shadow-lg rounded-xl p-8 max-w-2xl mx-auto border border-gray-700">
        <div className="mb-6">
          <label className="block text-gray-200 text-lg font-semibold mb-2">Calificación General:</label>
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
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-200 text-lg font-semibold mb-2">
            Tu Comentario:
          </label>
          <textarea
            id="comment"
            name="comment"
            rows="5"
            className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
            placeholder={`¿Qué te pareció la clase "${feedbackTarget.name}"?`}
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
    </div>
  );
};

export default UserFeedback;
