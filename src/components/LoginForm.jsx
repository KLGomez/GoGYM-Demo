import { useState, useEffect } from "react";
// No se necesita useNavigate aquí si la navegación la maneja el componente padre (Login.jsx)
// import { useNavigate } from "react-router-dom";
// No se usa users de data/users.js directamente, la lógica de auth está en el contexto.

// Se espera que onLogin y error (opcional) vengan como props desde Login.jsx
export default function LoginForm({ onLogin, error: propError }) {
    const [email, setEmail] = useState(""); // Cambiado de username a email para coincidir con el contexto
    const [password, setPassword] = useState("");
    // El error que se muestra puede ser el que viene de props (del contexto)
    // o un error local del formulario si fuera necesario.
    // Por simplicidad, solo usaremos el propError.
    // const [localFormError, setLocalFormError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            // Opcional: manejar error local si se desea antes de llamar a onLogin
            // setLocalFormError("Por favor, ingresa email y contraseña.");
            // O delegar toda la validación y manejo de errores a onLogin/contexto.
            // Para este caso, si onLogin espera el objeto, se lo pasamos.
            // El contexto/Login.jsx mostrará el error de "campos vacíos" si es necesario.
        }
        // Llamar a la función onLogin pasada por props con los datos del formulario
        onLogin({ email, password });
    };

    // Si propError cambia (porque el contexto o Login.jsx lo actualizan),
    // el componente se re-renderizará y mostrará el nuevo error.
    // No es estrictamente necesario un useEffect aquí para el error,
    // a menos que quisiéramos limpiarlo después de un tiempo o en cambios de input.

    return (
        <div className="bg-black rounded-2xl shadow-xl p-10 border-4 border-white w-full max-w-md">
            <h2 className="text-3xl font-bold text-center text-white mb-6">Iniciar sesión</h2>

            <form className="space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white"> {/* Cambiado htmlFor a "email" */}
                        Email {/* Cambiado de Usuario a Email */}
                    </label>
                    <input
                        type="email" // Cambiado de text a email
                        id="email" // Cambiado de username a email
                        placeholder="Ej: juan@example.com" // Placeholder actualizado
                        className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        placeholder="••••••••"
                        className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </div>

                {propError && ( // Mostrar el error pasado por props
                    <p className="text-red-500 text-sm text-center">{propError}</p>
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
        </div >
    );
}
