// API para registrar accesos en el backend
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

export async function registerAccessLog({ clientId, clientName, checkInTime, dni, checkInType }) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${BASE_URL}/access-logs`, {
            clientId,
            clientName,
            checkInTime,
            dni,
            checkInType
        }, {
            headers: {
                Authorization: token ? `Bearer ${token}` : undefined
            }
        });
        return response.data;
    } catch (error) {
        console.error('[ERROR][API] Falló el registro de acceso en backend:', error);
        throw error;
    }
}

// Obtener los registros de ingreso del día desde el backend
export async function getTodayAccessLogs() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/access-logs?today=true`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : undefined
            }
        });
        console.log('[LOG][API] Registros de ingreso del día recibidos:', response.data);
        return response.data;
    } catch (error) {
        console.error('[ERROR][API] Falló la obtención de logs del día:', error);
        throw error;
    }
}
