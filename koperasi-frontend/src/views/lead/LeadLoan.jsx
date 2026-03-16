import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Avatar,
    IconButton,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    Stack,
    Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MainCard from 'ui-component/cards/MainCard';
import StatCard from 'ui-component/cards/Lead/statcard';
import { gridSpacing } from 'store/constant';

import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';

// icons
import fileBlueIcon from 'assets/images/lead/fileBlueIcon.png';
import processOrangeIcon from 'assets/images/lead/processOrangeIcon.png';
import checkGreenIcon from 'assets/images/lead/checkGreenIcon.png';

const rows = [
    {
        id: '#TRX - 8923',
        anggota: 'Budi Santoso',
        jenis: 'Pinjaman Konsumtif',
        jumlah: 'Rp 10.000.000',
        tenor: '12 Bulan',
        status: 'Menunggu',
        statusColor: '#f59e0b',
        statusBg: '#fff7ed'
    },
    {
        id: '#TRX - 8764',
        anggota: 'Siti Aminah',
        jenis: 'Pinjaman Produktif',
        jumlah: 'Rp 5.000.000',
        tenor: '6 Bulan',
        status: 'Disetujui',
        statusColor: '#22c55e',
        statusBg: '#ecfdf5'
    },
    {
        id: '#TRX - 8452',
        anggota: 'Hardi Kurniawan',
        jenis: 'Pinjaman Produktif',
        jumlah: 'Rp 2.000.000',
        tenor: '3 Bulan',
        status: 'Disetujui',
        statusColor: '#22c55e',
        statusBg: '#ecfdf5'
    },
    {
        id: '#TRX - 8112',
        anggota: 'Dewi Lestari',
        jenis: 'Pinjaman Konsumtif',
        jumlah: 'Rp 25.000.000',
        tenor: '12 Bulan',
        status: 'Ditolak',
        statusColor: '#ef4444',
        statusBg: '#fef2f2'
    }
];


const LeadLoanPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [status, setStatus] = React.useState('');

    const handleChange = (event) => {
        setStatus(event.target.value);
    };

    return (
        <Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                    Daftar Permohonan Pinjaman
                </Typography>

                <Typography sx={{ color: '#64748b' }}>
                    Kelola dan tinjau status pengajuan pinjaman anggota secara real-time.
                </Typography>
            </Box>

            {/* STAT CARD */}
            <Stack direction="row" spacing={3} mb={4}>
                <StatCard
                    title="Total Pengajuan"
                    value={45}
                    badge="+12%"
                    color="blue"
                    icon={<img src={fileBlueIcon} width={24} alt="Total" />}
                />

                <StatCard
                    title="Sedang Diproses"
                    value={10}
                    badge="Menunggu"
                    color="orange"
                    icon={<img src={processOrangeIcon} width={24} alt="Process" />}
                />

                <StatCard
                    title="Total Disetujui"
                    value={9}
                    badge="36%"
                    color="green"
                    icon={<img src={checkGreenIcon} width={24} alt="Success" />}
                />
            </Stack>

            <MainCard
                title={
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Daftar Permohonan
                        </Typography>

                        <Stack direction="row" spacing={2} alignItems="center">
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <Select value={status} onChange={handleChange} displayEmpty>
                                    <MenuItem value="">
                                        <em>Semua Status</em>
                                    </MenuItem>
                                    <MenuItem value="Menunggu">Menunggu</MenuItem>
                                    <MenuItem value="Disetujui">Disetujui</MenuItem>
                                    <MenuItem value="Ditolak">Ditolak</MenuItem>
                                </Select>
                            </FormControl>

                            <IconButton sx={{ border: '1px solid #e5e7eb' }}>
                                <FilterListIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                }
            >
                <TableContainer>
                    <Table>

                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ID PINJAMAN</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>ANGGOTA</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>JENIS & JUMLAH</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>TENOR</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>STATUS</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>AKSI</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    sx={{
                                        '&:hover': {
                                            bgcolor: '#f9fafb'
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography sx={{ color: '#64748b' }}>
                                            {row.id}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {row.anggota}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography sx={{ color: '#2563eb', fontWeight: 500 }}>
                                            {row.jenis}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 600 }}>
                                            {row.jumlah}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>{row.tenor}</TableCell>

                                    <TableCell align="center">
                                        <Chip
                                            label={row.status}
                                            sx={{
                                                bgcolor: row.statusBg,
                                                color: row.statusColor,
                                                fontWeight: 600,
                                                borderRadius: 2
                                            }}
                                            size="small"
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Typography
                                            onClick={() =>
                                                navigate(`/lead/loans/detail/${row.id.replace('#', '').trim()}`)
                                            }
                                            sx={{
                                                color: '#2563eb',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    textDecoration: 'underline'
                                                }
                                            }}
                                        >
                                            Detail
                                        </Typography>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid #e5e7eb'
                    }}
                >
                    <Typography sx={{ color: '#64748b' }}>
                        Menampilkan <b>1-4</b> dari <b>45</b> permohonan
                    </Typography>

                    <Pagination
                        count={3}
                        color="primary"
                        shape="rounded"
                        variant="outlined"
                    />
                </Stack>

            </MainCard>
        </Box>
    );
};

export default LeadLoanPage;