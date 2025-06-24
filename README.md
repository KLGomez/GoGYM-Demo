# 📌 Plataforma de Gestión de Gimnasio

## 📖 Descripción
Este proyecto es una plataforma web para la gestión de un gimnasio, permitiendo a los usuarios registrarse, pagar membresías, reservar clases y hacer seguimiento de su progreso físico. Los administradores pueden gestionar socios, horarios y pagos de manera eficiente.

## 🚀 Funcionalidades

### 🔹 Para los Socios (Usuarios)
- Registro e inicio de sesión.
- Visualización de planes de membresía y suscripción en línea.
- Reservas de clases y entrenamientos personalizados.
- Historial de entrenamientos y seguimiento de progreso.
- Notificaciones sobre pagos, eventos o promociones.
- Generación de QR para acceso/salida del gimnasio.

### 🔹 Para los Administradores
- Gestión de socios (altas, bajas y modificaciones).
- Control de asistencia de los socios.
- Administración de clases y horarios.
- Gestión de pagos y facturación.
- Reportes y estadísticas sobre el gimnasio.

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React, TailwindCSS, JavaScript.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MongoDB.
- **Versionado:** Git, GitHub.
- **Deploy:** Firebase
- **Implementacion de IA:** Vertex AI

## 🏗️ Instalación y Configuración
1. Clona el repositorio:
   ```bash
   git clone https://github.com/KLGomez/GoGYM-Project
   ```
2. Ingresa al directorio del proyecto:
   ```bash
   cd gestion-gimnasio
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor backend:
   ```bash
   npm start
   ```
5. Inicia el frontend:
   ```bash
   ng serve
   ```

## 🔄 Diagrama de Flujo (ASCII)
```
Inicio
  |
  |-- Registro / Iniciar Sesión
  |
  |-- (Socio) → Elegir Plan → Pago → Reservar Clases → Acceder con QR → Ver Historial
  |
  |-- (Administrador) → Gestionar Socios a través de QR → Control de Asistencia → Gestión de Clases
  |
  |-- Generar Reportes y Estadísticas
  |
Fin
```

## 📩 Contacto
Si tienes preguntas o sugerencias, contáctanos en [somosgogym@gmail.com].
