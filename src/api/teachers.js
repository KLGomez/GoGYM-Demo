import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

export async function getTeachers(token) {
    const res = await axios.get(`${baseUrl}/teachers`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function getTeacher(id, token) {
    const res = await axios.get(`${baseUrl}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function createTeacher(data, token) {
    const res = await axios.post(`${baseUrl}/teachers`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function updateTeacher(id, data, token) {
    const res = await axios.patch(`${baseUrl}/teachers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function deactivateTeacher(id, token) {
    const res = await axios.patch(`${baseUrl}/teachers/${id}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function reactivateTeacher(id, token) {
    const res = await axios.patch(`${baseUrl}/teachers/${id}/reactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}

export async function deleteTeacher(id, token) {
    const res = await axios.delete(`${baseUrl}/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
}
