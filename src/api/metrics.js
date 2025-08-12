// api/metrics.js
import axios from 'axios';

export async function getDashboardMetrics() {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL;
    const res = await axios.get(`${baseUrl}/admin/metrics/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return res.data;
}
