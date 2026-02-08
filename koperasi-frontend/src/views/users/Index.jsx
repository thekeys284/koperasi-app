import {useEffect,useState} from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Typography, TableContainer,
    Paper, CircularProgress, Box, Chip
} from '@mui/material';
import MainCard from '../../components/cards/MainCard.jsx';


import api from 'api/axios';
const UserPage = () => {
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

    return (
        <MainCard title="Data Anggota Koperasi">
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Memasak data dari server...</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                            <TableRow>
                                <TableCell><strong>Nama Lengkap</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Satker</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell align="right"><strong>Total Limit</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.username}</TableCell>
                                        <TableCell>{row.satker || '-'}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.role} 
                                                color={row.role === 'admin' ? 'primary' : 'secondary'} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            Rp {new Intl.NumberFormat('id-ID').format(row.limit_total)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
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