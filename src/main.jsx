import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import the new router configuration
// App.jsx, AppAdmin.jsx, and AppUser.jsx might not be directly needed here anymore
// if all routing is handled by the router. To be confirmed after refactoring AppAdmin/AppUser.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
