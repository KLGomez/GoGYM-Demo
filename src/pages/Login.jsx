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
        if (currentUser && (currentUser.rol || currentUser.role)) {
            console.log('Usuario autenticado:', currentUser);
            const role = currentUser.rol || currentUser.role;
            if (role === "administrador" || role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/user", { replace: true });
            }
        }
    }, [currentUser, navigate]);

    const handleLoginSubmit = async (formData) => { // formData es {email, password}
        setLoginError(''); // Limpiar errores de login anteriores
        try {
            const loggedInUser = await loginUser(formData); // loginUser ahora es asíncrono
            if (loggedInUser && (loggedInUser.rol || loggedInUser.role)) {
                // La redirección la maneja el useEffect para evitar duplicidad y asegurar que el usuario esté cargado
            } else {
                setLoginError("Credenciales incorrectas.");
            }
        } catch (error) {
            setLoginError("Error de conexión o credenciales incorrectas.");
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
                    <LoginForm onLogin={handleLoginSubmit} error={loginError} formId="Desktop" />
                </div>
            </div>

            {/* Solo formulario en mobile */}
            <div className="md:hidden w-full max-w-md">
                <LoginForm onLogin={handleLoginSubmit} error={loginError} formId="Mobile" />
            </div>
        </div>
    );

}
