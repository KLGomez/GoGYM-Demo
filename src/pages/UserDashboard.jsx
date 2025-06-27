import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("loggedUser");
        navigate("/");
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-3xl gap-6">
            Bienvenido Usuario
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-500"
            >
                Cerrar sesión
            </button>
        </div>
    );
}
