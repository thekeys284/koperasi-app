// Helper kecil untuk baca data user & role yang sudah disimpan
// di localStorage sesudah login (lihat AuthLogin.jsx).
//
// Semua nama role di sistem ini (harus sama persis dengan kolom
// `role` di tabel users / backend):
export const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    OPERATOR: 'operator',
    PJ_TOKO: 'pj_toko',
    PJ_PINJAMAN: 'pj_pinjaman',
    KETUA: 'ketua'
};

export function getCurrentUser() {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getCurrentRole() {
    return getCurrentUser()?.role || null;
}

/**
 * Cek apakah role user sekarang termasuk dalam daftar role yang diizinkan.
 * Admin SELALU lolos (admin bisa akses semua menu).
 *
 * @param {string[]} allowedRoles - daftar role yang boleh akses, contoh: ['admin','operator']
 */
export function hasRole(allowedRoles = []) {
    const role = getCurrentRole();
    if (!role) return false;
    if (role === ROLES.ADMIN) return true; // admin akses semua menu
    if (!allowedRoles || allowedRoles.length === 0) return true; // tidak dibatasi role tertentu
    return allowedRoles.includes(role);
}

export function isLoggedIn() {
    return Boolean(localStorage.getItem('token'));
}

export async function logout() {
    // Server menghapus token Sanctum aktif. Logout lokal tetap dilakukan
    // apabila server sedang tidak terjangkau agar sesi browser tidak tertinggal.
    try {
        const { default: api } = await import('../api/axios');
        await api.post('/logout');
    } catch (error) {
        // Token mungkin sudah kedaluwarsa atau sebelumnya sudah dihapus.
        // Tidak perlu menghalangi pengguna untuk keluar dari aplikasi.
        console.warn('Logout server gagal:', error.response?.data?.message || error.message);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}
