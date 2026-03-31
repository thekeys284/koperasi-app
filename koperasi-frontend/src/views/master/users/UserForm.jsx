import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, TextField, Grid, MenuItem, Box, Typography, Autocomplete, InputAdornment, IconButton, Snackbar, Alert} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import MainCard from '../../../components/cards/MainCard.jsx';
import api from "@/api/axios.js";

const UserForm = () =>{
    const {id} = useParams(); //ambil id jika ambil mode edit
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name:'',
        username:'',
        email:'',
        password:'',
        satker:'3500',
        role:'',
        limit_total: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' // bisa 'success', 'error', 'info', atau 'warning'
    });

    const handleCloseSnackbar = () => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    const satkerOptions = [
        { value: '3500', label: 'BPS Provinsi Jawa Timur' },
        { value: '3501', label: 'BPS Kabupaten Pacitan' },
        { value: '3502', label: 'BPS Kabupaten Ponorogo' },
        { value: '3503', label: 'BPS Kabupaten Trenggalek' },
        { value: '3504', label: 'BPS Kabupaten Tulungagung' },
        { value: '3505', label: 'BPS Kabupaten Blitar' },
        { value: '3506', label: 'BPS Kabupaten Kediri' },
        { value: '3507', label: 'BPS Kabupaten Malang' },
        { value: '3508', label: 'BPS Kabupaten Lumajang' },
        { value: '3509', label: 'BPS Kabupaten Jember' },
        { value: '3510', label: 'BPS Kabupaten Banyuwangi' },
        { value: '3511', label: 'BPS Kabupaten Bondowoso' },
        { value: '3512', label: 'BPS Kabupaten Situbondo' },
        { value: '3513', label: 'BPS Kabupaten Probolinggo' },
        { value: '3514', label: 'BPS Kabupaten Pasuruan' },
        { value: '3515', label: 'BPS Kabupaten Sidoarjo' },
        { value: '3516', label: 'BPS Kabupaten Mojokerto' },
        { value: '3517', label: 'BPS Kabupaten Jombang' },
        { value: '3518', label: 'BPS Kabupaten Nganjuk' },
        { value: '3519', label: 'BPS Kabupaten Madiun' },
        { value: '3520', label: 'BPS Kabupaten Magetan' },
        { value: '3521', label: 'BPS Kabupaten Ngawi' },
        { value: '3522', label: 'BPS Kabupaten Bojonegoro' },
        { value: '3523', label: 'BPS Kabupaten Tuban' },
        { value: '3524', label: 'BPS Kabupaten Lamongan' },
        { value: '3525', label: 'BPS Kabupaten Gresik' },
        { value: '3526', label: 'BPS Kabupaten Bangkalan' },
        { value: '3527', label: 'BPS Kabupaten Sampang' },
        { value: '3528', label: 'BPS Kabupaten Pamekasan' },
        { value: '3529', label: 'BPS Kabupaten Sumenep' },
        { value: '3571', label: 'BPS Kota Kediri' },
        { value: '3572', label: 'BPS Kota Blitar' },
        { value: '3573', label: 'BPS Kota Malang' },
        { value: '3574', label: 'BPS Kota Probolinggo' },
        { value: '3575', label: 'BPS Kota Pasuruan' },
        { value: '3576', label: 'BPS Kota Mojokerto' },
        { value: '3577', label: 'BPS Kota Madiun' },
        { value: '3578', label: 'BPS Kota Surabaya' },
        { value: '3579', label: 'BPS Kota Batu' }
    ];

    useEffect(() => {
        if (isEdit) { 
            api.get(`/users/${id}`)
                .then((res) => {
                    if (res.data && res.data.data) {
                        const user = res.data.data;
                        setFormData({
                            name: user.name || '',
                            username: user.username || '',
                            email: user.email || '',
                            satker: user.satker || '3500',
                            role: user.role || '',
                            limit_total: user.limit_total || '',
                            password: ''
                        });

                        if (user.foto_url) {
                            setPreview(user.foto_url);
                        }
                    }
                })
                .catch(err => {
                    console.error("Detail Error dari Server:", err.response?.data);
                    alert("Gagal memuat data: " + (err.response?.data?.message || "Server Error"));
                });
        }
    }, [id]);

    const handleSubmit = async (e) =>{
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('satker', formData.satker);
        data.append('role', formData.role);

        // kirim password saat add user atau ada edit password
        if(formData.password){
            data.append('password', formData.password);
        }

        // jika ada foto yang diupload
        if(selectedFile){
            data.append('profile_picture', selectedFile);
        }

        try {
            if (isEdit){
                data.append('_method', 'PUT');
                await api.post(`/users/${id}`, data); 
            } else {
                await api.post('/users', data);
            }
            setSnackbar({
                open: true,
                message: isEdit ? 'Data anggota berhasil diperbarui!' : 'Anggota baru berhasil ditambahkan!',
                severity: 'success'
            });

            // 2. Beri jeda 1.5 detik agar user bisa baca pesan suksesnya, baru pindah halaman
            setTimeout(() => {
                navigate('/admin/users');
            }, 1500);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
                severity: 'error'
            });
        }
    };

    return (
        <MainCard title={isEdit ? "Edit Anggota" : "Tambah Anggota Baru"}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Nama Lengkap</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:10}}>
                        <TextField
                            fullWidth label ="Nama Lengkap"
                            value={formData.name}
                            onChange={(e)=>setFormData({...formData, name: e.target.value})}/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Email</b>
                        </Typography>
                    </Grid>
                    <Grid  size={{xs:12, sm:10}}>
                        <TextField 
                            fullWidth label = "Email"
                            value={formData.email}
                            onChange={(e)=>setFormData({...formData, email:e.target.value})}/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Username</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField
                            fullWidth label = "Username"
                            value={formData.username}
                            onChange={(e)=>setFormData({...formData, username: e.target.value})}/>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Password</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField
                            fullWidth label = "Password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e)=>setFormData({...formData, password:e.target.value})}
                            placeholder={isEdit ? "Kosongkan jika tidak ganti" : ""}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                    </InputAdornment>
                                )
                                }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Satuan Kerja</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                         <Autocomplete
                            options={satkerOptions}
                            getOptionLabel={(option) => option.label} // pastikan label tampil
                            value={satkerOptions.find(opt => opt.value === formData.satker) || null}
                            onChange={(event, newValue) => setFormData({ ...formData, satker: newValue?.value || '' })}
                            renderInput={(params) => <TextField {...params} label="Satuan Kerja" fullWidth />} 
                            ListboxProps={{ style: { maxHeight: 200 } }}    
                        />
                    </Grid>
                     <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Role</b>
                        </Typography>
                    </Grid>
                    <Grid size={{xs:12, sm:4}}>
                        <TextField
                            select fullWidth label = "Role"
                            value={formData.role}
                            onChange={(e)=>setFormData({...formData, role:e.target.value})}>
                                <MenuItem value="admin">Admin</MenuItem>
                                <MenuItem value="user">User</MenuItem>
                                <MenuItem value="operator">Operator</MenuItem>
                                <MenuItem value="pj_toko">PJ Toko</MenuItem>
                                <MenuItem value="pj_pinjaman">PJ Pinjaman</MenuItem>
                                <MenuItem value="ketua">Ketua</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}
                        sx={{
                            display: 'flex',
                            justifyContent:'right',
                            alignItems: 'center'
                        }}>
                        <Typography variant="body1">
                            <b>Foto Profil</b>
                        </Typography>
                    </Grid>

                    <Grid size={{xs:12, sm:4}}>
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ height: '56px' }}
                        >
                            {selectedFile ? selectedFile.name : "Pilih File"}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setPreview(URL.createObjectURL(file)); 
                                    }
                                }}
                            />
                        </Button>
                    </Grid>
                    {preview && (
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box component="img" src={preview} sx={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee' }} />
                        </Grid>
                    )}
                    <Grid size={{xs:12, sm:12}} sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}></Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'right', gap: 4, pt:4, flex: 8}}>
                            <Button variant="outlined" onClick={() => navigate('/admin/users')} sx={{ flex: 4 }}>
                                Batal
                            </Button>
                            <Button variant="contained" type="submit" color="primary" sx={{ flex: 4 }}>
                                Simpan
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={3000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Muncul di pojok kanan bawah
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled" // Agar warnanya solid khas Material UI modern
                    sx={{ width: '100%', borderRadius: '8px' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MainCard>
    );
};

export default UserForm;