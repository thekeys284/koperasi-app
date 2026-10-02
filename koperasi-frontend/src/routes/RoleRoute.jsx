import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { isLoggedIn, hasRole } from '../utils/auth';

/**
 * Bungkus sebuah <Route element={...}> dengan komponen ini untuk membatasi
 * akses berdasarkan role. Admin selalu lolos (lihat utils/auth.js).
 *
 * Contoh pemakaian di MainRoutes.jsx:
 *   { path: '', element: <RoleRoute roles={['admin','operator','pj_toko']}><ProductPage /></RoleRoute> }
 */
export default function RoleRoute({ roles, children }) {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRole(roles)) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h3" sx={{ mb: 1 }}>
                    403 — Akses Ditolak
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                </Typography>
                <Button variant="contained" href="/dashboard/default">
                    Kembali ke Dashboard
                </Button>
            </Box>
        );
    }

    return children;
}

RoleRoute.propTypes = {
    roles: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.node
};
