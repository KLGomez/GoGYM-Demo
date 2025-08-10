import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// No se necesita useNavigate aquí si la navegación la maneja el componente padre (Login.jsx)
// import { useNavigate } from "react-router-dom";
// No se usa users de data/users.js directamente, la lógica de auth está en el contexto.

// Se espera que onLogin y error (opcional) vengan como props desde Login.jsx
export default function LoginForm({ onLogin, error: propError }) {
    const [email, setEmail] = useState(""); // Cambiado de username a email para coincidir con el contexto
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            setLocalError("Por favor, ingresa email y contraseña.");
            return;
        }
        // Limpiar el error local si la validación pasa
        setLocalError("");
        // Llamar a la función onLogin pasada por props con los datos del formulario
        onLogin({ email, password });
    };

    // Limpiar el error local cuando el usuario empieza a escribir de nuevo
    useEffect(() => {
        if (email || password) {
            setLocalError("");
        }
    }, [email, password]);

    return (
        <div className="bg-black rounded-2xl shadow-xl p-10 border-4 border-white w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-white mb-6">Iniciar sesión</h2>

            <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Ej: juan@example.com"
                        className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>

                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                        Contraseña
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        placeholder="••••••••"
                        className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-3 top-9 text-gray-400 hover:text-orange-400 focus:outline-none"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {(localError || propError) && (
                    <p className="text-red-500 text-sm text-center">{localError || propError}</p>
                )}

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-orange-600 text-black font-bold rounded-lg hover:bg-orange-500 transition duration-200"
                >
                    Ingresar
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
                ¿Olvidaste tu contraseña?
                <a href="#" className="text-orange-600 hover:underline ml-1">Recuperala</a>
            </p>
        </div>
    );
}
