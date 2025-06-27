export default function LoginForm() {
  return (
    <div className="bg-black rounded-2xl shadow-xl p-10 border-4 border-white w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-white mb-6">Iniciar sesión</h2>

      <form className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white">Usuario</label>
          <input
            type="text"
            id="username"
            placeholder="Ej: juanperez"
            className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">Contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            className="text-white w-full px-4 py-2 mt-1 border-2 border-gray-300 bg-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-orange-600 text-black font-bold rounded-lg hover:bg-orange-500 transition duration-200"
        >
          Ingresar
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Olvidaste tu contraseña?
        <a href="#" className="text-orange-600 hover:underline ml-1">Recuperarla</a>
      </p>
    </div>
  );
}
