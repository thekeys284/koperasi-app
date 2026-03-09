import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow,
    Typography, TableContainer, Paper, CircularProgress,
    Box, Chip, Button
} from '@mui/material';

import MainCard from '../../../components/cards/MainCard.jsx';
import api from 'api/axios';

const UserPage = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal mengambil data user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        navigate('/admin/users/add');
    };

    const handleEdit = (id) => {
        console.log("Edit user ID:", id);
        navigate(`/admin/users/edit/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Yakin ingin menghapus user ini?");
        if (!confirmDelete) return;

        console.log("Hapus user ID:", id);

        try {
            await api.post(`/users/delete/${id}`);

            // update state tanpa reload
            setUsers(prev => prev.filter(user => user.id !== id));

            alert("User berhasil dihapus");
        } catch (error) {
            console.error("Gagal menghapus user:", error);
            alert("Gagal menghapus user");
        }
    };

    return (
        <MainCard title="Data Anggota Koperasi">

            {/* tombol tambah */}
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
                    <CircularProgress />
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
                                <TableCell align="right"><strong>Total Limit</strong></TableCell>
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

                                        <TableCell align="right">
                                            Rp {new Intl.NumberFormat('id-ID').format(row.limit_total || 0)}
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
                                                onClick={() => handleDelete(row.id)}
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
        </MainCard>
    );
};

export default UserPage;