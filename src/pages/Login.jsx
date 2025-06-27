import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";


export default function Login() {

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("loggedUser");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/user");
            }
        }
    }, []);



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
                    <LoginForm />
                </div>
            </div>

            {/* Solo formulario en mobile */}
            <div className="md:hidden w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}
