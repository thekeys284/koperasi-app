import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Typography, TableContainer, Paper, CircularProgress,
    Box, Chip, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert
} from '@mui/material';

import MainCard from '../../../ui-component/cards/MainCard.jsx';
import api from '../../../api/axios';

const UserPage = () => {
    console.log("UserPage component rendered");
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // bisa 'success', 'error', 'info', atau 'warning'
    });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => { 
        console.log("Fetching users...");
        try {
            setLoading(true);
            const response = await api.get('/users');
            const results = response.data.data || [];
            console.log("Data user berhasil diambil:", results);
            setUsers(results);
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Fungsi buka popup
    const handleOpenDelete = (id) => {
        setSelectedId(id);
        setOpenDelete(true);
    };

    // Fungsi tutup popup
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setSelectedId(null);
    };

    const handleAdd = () => {
        navigate('/pjtoko/users/add');
    };

    const handleEdit = (id) => {
        console.log("Edit user ID:", id);
        navigate(`/pjtoko/users/edit/${id}`);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${selectedId}`);
            setUsers(prev => prev.filter(user => user.id !== selectedId));
            handleCloseDelete();
            setSnackbar({
                open: true,
                message: 'Data anggota berhasil dihapus!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Gagal menghapus data',
                severity: 'error'
            });
        }
    };

    return (
        <MainCard title="Data Anggota Koperasi">
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAdd}
                >
                    Tambah Anggota
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress color="secondary"/>
                    <Typography sx={{ ml: 2 }}>
                        Memuat data dari server...
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table sx={{ minWidth: 650 }}>

                        <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                                <TableCell align="center"><strong>Nama Lengkap</strong></TableCell>
                                <TableCell align="center"><strong>Username</strong></TableCell>
                                <TableCell align="center"><strong>Satker</strong></TableCell>
                                <TableCell align="center"><strong>Role</strong></TableCell>
                                <TableCell align="center"><strong>Aksi</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {users.length > 0 ? (
                                users.map((row) => (
                                    <TableRow key={row.id} hover>

                                        <TableCell>
                                            {row.name}
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.username}
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.satker || '-'}
                                        </TableCell>

                                        <TableCell align="center">
                                            <Chip
                                                label={row.role}
                                                color={row.role === 'admin' ? 'primary' : 'secondary'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell align="center">

                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="warning"
                                                sx={{ mr: 1 }}
                                                onClick={() => handleEdit(row.id)}
                                            >
                                                Edit
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleOpenDelete(row.id)}
                                            >
                                                Delete
                                            </Button>

                                        </TableCell>

                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        Data tidak ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}
            {/* --- COMPONENT POPUP/DIALOG BERRY STYLE --- */}
            <Dialog
                open={openDelete}
                onClose={handleCloseDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                // Agar sudutnya melengkung khas Berry
                PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>
                    Konfirmasi Hapus
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDelete} color="primary" variant="outlined">
                        Batal
                    </Button>
                    <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
                        Ya, Hapus
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Muncul di pojok kanan bawah
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled" 
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainCard>
    );
};

export default UserPage;
