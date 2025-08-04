import React, { useState, useContext } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowLeftIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { SharedDataContext } from '../contexts/SharedDataContext';
import { showError, confirmAction } from '../utils/alerts';

// Asumimos que en SharedDataContext se añadirán:
// articles: [],
// addArticle: (articleData) => { ... setArticles(prev => [...prev, { ...articleData, id: `art_${Date.now()}`}]); ... },
// updateArticle: (updatedArticleData) => { ... setArticles(prev => prev.map(a => a.id === updatedArticleData.id ? updatedArticleData : a)); ... },
// deleteArticle: (articleId) => { ... setArticles(prev => prev.filter(a => a.id !== articleId)); ... },

const ArticleForm = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || ''); // Opcional

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showError("Campos Incompletos", "El título y el contenido son obligatorios.");
      return;
    }
    onSubmit({
        id: initialData?.id, // Mantener ID si se está editando
        title,
        content,
        imageUrl,
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-200">Título del Artículo</label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-200">Contenido</label>
        <textarea
          name="content"
          id="content"
          rows="6"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
          required
        ></textarea>
      </div>
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-200">URL de Imagen (Opcional)</label>
        <input
          type="url"
          name="imageUrl"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
          className="mt-1 block w-full bg-gray-700 border-gray-600 text-white rounded-md shadow-sm p-2 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
        >
            Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
        >
          {initialData?.id ? 'Actualizar Artículo' : 'Crear Artículo'}
        </button>
      </div>
    </form>
  );
};


const ArticlesAdmin = () => {
  const { articles, addArticle, updateArticle, deleteArticle, isLoading } = useContext(SharedDataContext);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null); // null o el objeto artículo a editar

  const handleAddNew = () => {
    setEditingArticle(null);
    setIsFormVisible(true);
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsFormVisible(true);
  };

  const handleDelete = (articleId, articleTitle) => {
    confirmAction(
      `¿Eliminar Artículo "${articleTitle}"?`,
      "Esta acción es irreversible.",
      "Sí, eliminar",
      () => {
        deleteArticle(articleId); // La función del contexto ya muestra SweetAlert de éxito/error
      }
    );
  };

  const handleFormSubmit = (articleData) => {
    if (editingArticle) {
      updateArticle(articleData);
    } else {
      addArticle(articleData);
    }
    setIsFormVisible(false);
    setEditingArticle(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };


  if (isLoading && !articles) { // Muestra carga si isLoading es true y articles aún no se ha cargado
    return <p className="text-center text-white py-10">Cargando artículos...</p>;
  }

  if (isFormVisible) {
    return (
      <div className="container mx-auto p-4">
         <button
            onClick={() => { setIsFormVisible(false); setEditingArticle(null); }}
            className="mb-6 text-orange-400 hover:text-orange-500 flex items-center font-semibold"
        >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Volver a la Lista de Artículos
        </button>
        <h2 className="text-2xl font-bold text-orange-400 mb-6">
          {editingArticle ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
        </h2>
        <ArticleForm
          onSubmit={handleFormSubmit}
          initialData={editingArticle}
          onCancel={() => { setIsFormVisible(false); setEditingArticle(null); }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400">Gestión de Artículos y Noticias</h1>
        <button
          onClick={handleAddNew}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Nuevo Artículo
        </button>
      </div>

      {(articles || []).length === 0 ? (
        <div className="text-center py-10 bg-gray-800 rounded-lg shadow">
            <NewspaperIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No hay artículos publicados todavía.</p>
            <p className="text-gray-500">¡Comienza creando el primero!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(articles || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(article => (
            <article key={article.id} className="bg-gray-800 shadow-xl rounded-lg p-6 hover:shadow-2xl transition-shadow">
              {article.imageUrl && (
                <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover rounded-md mb-4" />
              )}
              <h2 className="text-2xl font-semibold text-orange-400 mb-2">{article.title}</h2>
              <p className="text-xs text-gray-500 mb-3">
                Publicado: {formatDate(article.createdAt)}
                {article.updatedAt !== article.createdAt && ` (Actualizado: ${formatDate(article.updatedAt)})`}
              </p>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-3">{article.content}</p>
              {/* line-clamp-3 para previsualización, se podría expandir */}
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(article)}
                  className="p-2 text-blue-400 hover:text-blue-300"
                  title="Editar Artículo"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(article.id, article.title)}
                  className="p-2 text-red-500 hover:text-red-400"
                  title="Eliminar Artículo"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesAdmin;
