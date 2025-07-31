import { useEffect, useContext, useState } from "react"; // Importar useContext y useState
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { SharedDataContext } from '../contexts/SharedDataContext'; // Importar el contexto

export default function Login() {
    const navigate = useNavigate();
    const { loginUser, currentUser } = useContext(SharedDataContext); // Usar el contexto
    const [loginError, setLoginError] = useState('');

    // Redirigir si ya hay un usuario en el contexto (ej. recarga de página)
    useEffect(() => {
        if (currentUser) {
            // Asumimos que currentUser tiene una propiedad 'role' o la inferimos
            const role = currentUser.role || (currentUser.email === 'admin@gogym.com' ? 'admin' : 'user'); // Ejemplo de inferencia
            if (role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/user", { replace: true });
            }
        }
    }, [currentUser, navigate]);

    const handleLoginSubmit = async (formData) => { // formData es {email, password}
        setLoginError(''); // Limpiar errores de login anteriores
        const loggedInUser = loginUser(formData); // loginUser del contexto maneja la lógica y SweetAlerts

        if (loggedInUser) {
            const role = loggedInUser.role || (loggedInUser.email === 'admin@gogym.com' ? 'admin' : 'user'); // Ejemplo
            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'user') {
                navigate('/user');
            } else {
                // esto no deberia pasar si loginUser funciona bien y devuelve un usuario con rol
                setLoginError('Rol de usuario no reconocido tras el login.');
            }
        } else {
            // loginUser ya mostró un SweetAlert de error.
            // Establecer un error para pasarlo a LoginForm.
            setLoginError("Credenciales incorrectas.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
            {/* Logo pequeño visible en mobile */}
            <div className="block md:hidden text-center mb-6">
                <h1 className="text-white text-4xl font-semibold leading-none">Go</h1>
                <h1 className="text-[#ff914d] text-4xl font-extrabold">GYM</h1>
            </div>

            {/* Diseño en pantallas grandes */}
            <div className="hidden md:flex h-screen w-full">
                {/* Lado izquierdo: Logo y fondo degradado */}
                <div className="w-1/2 bg-gradient-to-br from-[#ff3131] to-[#ff914d] flex items-center justify-start pl-60">
                    <div>
                        <h1 className="text-white text-7xl font-semibold leading-none">Go</h1>
                        <h1 className="text-[#ff914d] text-7xl font-extrabold">GYM</h1>
                    </div>
                </div>

                {/* Lado derecho: Formulario */}
                <div className="w-1/2 bg-black flex items-center justify-center">
                    <LoginForm onLogin={handleLoginSubmit} error={loginError} />
                </div>
            </div>

            {/* Solo formulario en mobile */}
            <div className="md:hidden w-full max-w-md">
                <LoginForm onLogin={handleLoginSubmit} error={loginError} />
            </div>
        </div>
    );
}
