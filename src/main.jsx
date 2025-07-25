import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import the new router configuration
import { SharedDataProvider } from './contexts/SharedDataContext'; // Importar el Provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SharedDataProvider> {/* Envolver RouterProvider con SharedDataProvider */}
      <RouterProvider router={router} />
    </SharedDataProvider>
  </StrictMode>,
)
