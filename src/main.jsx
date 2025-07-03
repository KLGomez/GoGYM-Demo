import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppAdmin from './AppAdmin.jsx'
import AppUser from './AppUser.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppAdmin />
    {/* <AppUser /> */}
  </StrictMode>,
)
