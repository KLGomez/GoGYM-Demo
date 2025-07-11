# Proyecto GoGym

Este proyecto es una aplicación web para la gestión de un gimnasio, permitiendo la administración de clases, membresías, clientes y profesores. Cuenta con una interfaz para administradores y otra para usuarios, con vinculación de datos en tiempo real (simulada a través de `localStorage` y React Context) y notificaciones interactivas mediante SweetAlert2.

## Estructura del Proyecto

El proyecto está construido con React y Vite, utilizando React Router para la navegación y Tailwind CSS para los estilos. La gestión del estado global y la comunicación entre componentes se maneja a través de React Context (`SharedDataContext`).

```
gogym-project/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── src/
│   ├── App.css
│   ├── App.jsx             # (No utilizado directamente, revisar si es necesario)
│   ├── AppAdmin.jsx        # Layout principal y protector de rutas para la interfaz de administrador
│   ├── AppUser.jsx         # Layout principal y protector de rutas para la interfaz de usuario
│   ├── components/         # Componentes reutilizables de la interfaz
│   │   ├── Footer.jsx
│   │   ├── HeaderAdmin.jsx
│   │   ├── LoginForm.jsx
│   │   ├── SidebarAdmin.jsx
│   │   └── User/
│   │       ├── HeaderUser.jsx
│   │       └── SidebarUser.jsx
│   ├── contexts/           # Contextos de React para manejo de estado global
│   │   └── SharedDataContext.jsx # Contexto principal para datos compartidos y acciones
│   ├── data/               # Datos mockeados (principalmente para carga inicial si localStorage está vacío)
│   │   └── users.js        # (Contiene estructura de roles, pero la gestión de usuarios es vía SharedDataContext)
│   ├── index.css
│   ├── main.jsx            # Punto de entrada de la aplicación React, envuelve con SharedDataProvider
│   ├── pages/              # Componentes de página para cada ruta
│   │   ├── ArticlesAdmin.jsx     # CRUD de Artículos/Noticias (Admin), integrado con SharedDataContext
│   │   ├── AttendanceView.jsx    # Ver y marcar asistencia (Admin), integrado con SharedDataContext
│   │   ├── CheckInPage.jsx       # Página de Check-in general (QR/Manual), integrado con SharedDataContext
│   │   ├── ClassesAdmin.jsx      # Menú de gestión de clases (Admin)
│   │   ├── ClientesAdmin.jsx     # CRUD de Clientes (Admin), integrado con SharedDataContext
│   │   ├── EnrollStudentsView.jsx # Inscribir alumnos a clases (Admin), integrado con SharedDataContext
│   │   ├── HomePage.jsx          # Dashboard principal del Admin, integrado con SharedDataContext
│   │   ├── Login.jsx             # Página de Login, integrada con SharedDataContext
│   │   ├── ManageClassesView.jsx # CRUD de Clases (Admin), integrado con SharedDataContext
│   │   ├── ManageTeachersView.jsx # CRUD de Profesores (Admin), integrado con SharedDataContext
│   │   ├── MembershipsAdmin.jsx  # Muestra estado de membresías (Admin), integrado con SharedDataContext
│   │   ├── NotFoundPage.jsx
│   │   ├── ScheduleView.jsx      # Muestra cronograma de clases (Admin), integrado con SharedDataContext
│   │   └── User/                 # Páginas específicas del panel de Usuario
│   │       ├── UserClasses.jsx     # Ver y inscribirse a clases, integrado con SharedDataContext
│   │       ├── UserDashboard.jsx
│   │       ├── UserFeedback.jsx    # Enviar feedback de clases, integrado con SharedDataContext
│   │       ├── UserMembership.jsx  # Ver y gestionar membresía, integrado con SharedDataContext
│   │       └── UserMyClasses.jsx   # Ver clases inscritas y cancelar, integrado con SharedDataContext
│   ├── routes/             # Configuración de rutas de la aplicación
│   │   ├── adminRoutes.jsx
│   │   ├── index.jsx
│   │   └── userRoutes.jsx
│   └── utils/              # Funciones de utilidad
│       ├── alerts.js         # Funciones de SweetAlert2 personalizadas
│       ├── codeUtils.js      # Generador de códigos alfanuméricos
│       ├── membershipUtils.js # Cálculo de detalles de membresía
│       └── storage.js        # Funciones helper para interactuar con localStorage (ahora usadas principalmente por SharedDataContext)
└── vite.config.js        # Configuración de Vite
```

**Archivos y Directorios Clave (Actualizado):**

*   **`src/contexts/SharedDataContext.jsx`**: Esencial para el funcionamiento de la aplicación. Provee el estado global para clientes, clases, profesores, inscripciones, usuario actual y notificaciones. Maneja la lógica de negocio CRUD, la persistencia en `localStorage` y las interacciones con SweetAlert2 para feedback de acciones.
*   **`src/AppAdmin.jsx` y `src/AppUser.jsx`**: Actúan como layouts y protectores de ruta para sus respectivos paneles. Consumen `SharedDataContext` para verificar autenticación, roles y para mostrar notificaciones globales o específicas del panel.
*   **`src/pages/Admin/...` y `src/pages/User/...`**: Las páginas ahora interactúan con `SharedDataContext` para leer datos y ejecutar acciones, en lugar de manejar el estado o `localStorage` directamente.
*   **`src/utils/alerts.js`**: Contiene las configuraciones personalizadas para las alertas de SweetAlert2, usadas a través del contexto o directamente en componentes.
*   **`src/utils/storage.js`**: Sus funciones ahora son principalmente consumidas por `SharedDataContext` para la carga inicial y persistencia, abstraídas del resto de los componentes.

## Alcance y Funcionalidades del Proyecto (Actualizado)

La aplicación permite una gestión integral del gimnasio con dos roles principales y las siguientes funcionalidades conectadas a través de un sistema de estado centralizado:

### Funcionalidades del Administrador:

*   **Gestión de Clientes (`ClientesAdmin.jsx`):**
    *   CRUD completo de clientes (nombre, DNI, email, etc.).
    *   Asignación y gestión de membresías a clientes (plan, duración, fecha de inicio). Los datos de membresía se anidan dentro del objeto cliente.
    *   Generación de códigos QR para acceso de clientes.
    *   Todas las acciones actualizan `SharedDataContext` y `localStorage`, con feedback vía SweetAlert2.
*   **Gestión de Clientes (`ClientesAdmin.jsx`):**
    *   CRUD completo de clientes (nombre, DNI, email, etc.).
    *   Asignación y gestión de membresías a clientes (plan, duración, fecha de inicio). Los datos de membresía se anidan dentro del objeto cliente.
    *   Generación de códigos QR para acceso de clientes y códigos alfanuméricos (Iniciales+DNI).
    *   Actualiza `SharedDataContext` y `localStorage`, con feedback vía SweetAlert2.
*   **Gestión de Clases (`ClassesAdmin.jsx` -> `ManageClassesView.jsx`):**
    *   CRUD completo de clases (nombre, instructor, día, horario, capacidad, ubicación, descripción).
    *   Instructores seleccionados de la lista de profesores gestionados.
    *   Actualiza `SharedDataContext` y `localStorage`. La eliminación de una clase notifica a los usuarios inscritos.
*   **Gestión de Profesores (`ClassesAdmin.jsx` -> `ManageTeachersView.jsx`):**
    *   CRUD completo de profesores (nombre, especialidad, contacto).
    *   Actualiza `SharedDataContext` y `localStorage`.
*   **Inscripción de Alumnos a Clases (`ClassesAdmin.jsx` -> `EnrollStudentsView.jsx`):**
    *   Permite al administrador inscribir o desinscribir alumnos en clases específicas.
    *   Verifica capacidad de clase y estado de membresía del alumno.
    *   Interactúa con `SharedDataContext`.
*   **Visualización de Cronograma (`ClassesAdmin.jsx` -> `ScheduleView.jsx`):**
    *   Muestra un cronograma semanal de todas las clases con detalles.
*   **Registro y Visualización de Asistencia:**
    *   `CheckInPage.jsx`: Página de check-in general para clientes (QR o código manual).
    *   `ClassesAdmin.jsx` -> `AttendanceView.jsx`: Permite al admin ver y marcar asistencia para clases específicas.
*   **Gestión de Artículos/Noticias (`ArticlesAdmin.jsx`):**
    *   CRUD básico para crear, editar y eliminar artículos (título, contenido, imagen opcional).
    *   Los artículos se guardan en `localStorage` vía `SharedDataContext`.
*   **Dashboard Principal (`HomePage.jsx`):**
    *   Muestra estadísticas clave (clientes activos, clases de hoy, etc.).
    *   Lista los últimos registros de ingreso.
    *   Provee accesos rápidos a otras secciones del panel de admin.
*   **Estado de Membresías (`MembershipsAdmin.jsx`):**
    *   Presenta una lista filtrable y searchable de todos los clientes y el estado de sus membresías.
*   **Panel de Admin General (`AppAdmin.jsx`):**
    *   Protegido por rol ('admin').
    *   Muestra notificaciones SweetAlert para acciones del admin.

### Funcionalidades del Usuario:

*   **Dashboard y Navegación (`AppUser.jsx`, `HeaderUser.jsx`):**
    *   Panel protegido, requiere login.
    *   Muestra el nombre del usuario y opción de logout (con confirmación SweetAlert).
    *   Recibe y muestra notificaciones del sistema o del administrador (ej. "Tu clase ha sido cancelada").
*   **Visualización e Inscripción a Clases (`UserClasses.jsx`):**
    *   Lista las clases disponibles obtenidas del `SharedDataContext`.
    *   Permite al usuario inscribirse a clases, con validación de membresía activa y cupos (manejado por el contexto).
    *   Confirmaciones y errores mediante SweetAlert2.
*   **Mis Clases (`UserMyClasses.jsx`):**
    *   Muestra las clases a las que el usuario está inscrito.
    *   Permite cancelar inscripciones (con confirmación SweetAlert).
    *   Opción para dejar feedback en clases pasadas.
*   **Mi Código QR (`UserMyQR.jsx`):**
    *   Muestra el código QR personal del usuario para el check-in.
    *   Muestra el código alfanumérico personal (ej. INICIALES+DNI).
    *   Permite descargar el QR como un archivo PDF.
*   **Mi Membresía (`UserMembership.jsx`):**
    *   Muestra los detalles de la membresía actual del usuario (plan, estado, fechas, beneficios), obtenidos del `currentUser` en `SharedDataContext`.
    *   Permite gestionar la renovación automática (simulado, actualiza estado en `localStorage`).
    *   Alertas para membresías vencidas o por vencer.
*   **Feedback de Clases (`UserFeedback.jsx`):**
    *   Permite al usuario enviar una calificación (estrellas) y un comentario para una clase específica.
    *   La acción de enviar feedback se registra en el contexto.

### Funcionalidades Generales y Técnicas:

*   **Check-in (`CheckInPage.jsx`):**
    *   Página de acceso general para registrar el ingreso al gimnasio.
    *   Soporta escaneo de código QR y entrada manual de código alfanumérico/DNI.
    *   Valida la membresía del cliente en tiempo real contra `SharedDataContext`.
    *   Registra la asistencia.
*   **Login (`Login.jsx`, `LoginForm.jsx`):**
    *   Autentica usuarios (admin/user) contra los datos en `SharedDataContext`.
    *   Establece `currentUser` en el contexto y en `localStorage` (`currentUserSession`).
    *   Feedback de login vía SweetAlert2.
*   **Vinculación de Datos Admin-Usuario:**
    *   Los cambios realizados por el administrador (ej. crear una clase, actualizar una membresía) se reflejan en tiempo real (dentro de la misma sesión de navegador) en el panel del usuario, ya que ambos consumen el mismo `SharedDataContext` que se actualiza y persiste en `localStorage`.
*   **Sistema de Alertas:**
    *   SweetAlert2 se utiliza consistentemente para confirmaciones de acciones, mensajes de éxito/error, y notificaciones importantes tanto para el admin como para el usuario.
*   **Persistencia de Datos:**
    *   Toda la información (clientes, clases, profesores, inscripciones, usuario actual) se persiste en `localStorage`, gestionado centralmente por `SharedDataContext`.

## Limitaciones del Proyecto y Futuras Mejoras

(Esta sección se mantiene mayormente igual, pero la limitación de "Base de Datos Persistente" es la más relevante dado el uso actual de `localStorage`.)

1.  **Base de Datos Persistente**: La principal limitación es el uso de `localStorage`. Para un entorno de producción y multiusuario real, es crucial migrar a una base de datos backend (ej. Firebase, PostgreSQL, MongoDB).
2.  **Autenticación y Autorización Robustas**: El sistema actual de login y roles es básico. Se necesita hashing de contraseñas, tokens de sesión seguros (JWT), y una gestión de permisos más granular.
3.  **Integración de Pagos**: No implementada.
4.  **Notificaciones en Tiempo Real (Push/Email)**: El sistema actual de notificaciones es solo dentro de la app.
5.  **Funcionalidades Avanzadas (Reportes, etc.)**: No implementadas.
6.  **Pruebas Automatizadas**: No implementadas.
7.  **Mejoras UX/UI y Accesibilidad**: Siempre hay espacio para mejorar.
8.  **Internacionalización (i18n)**: No implementada.
9.  **Manejo de Errores Avanzado y Escalabilidad**: La lógica actual es para un entorno de frontend.
10. **Seguridad Adicional**: Más allá de la protección básica de rutas.

## Cómo Iniciar el Proyecto

(Esta sección no cambia)

1.  **Clonar el repositorio (si aplica):**
    ```bash
    git clone <url-del-repositorio>
    cd gogym-project
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación se iniciará en `http://localhost:5173`.

## Scripts Disponibles

(Esta sección no cambia)

*   `"dev"`: Inicia el servidor de desarrollo.
*   `"build"`: Compila la aplicación para producción.
*   `"lint"`: Ejecuta ESLint.
*   `"preview"`: Sirve la compilación de producción.
