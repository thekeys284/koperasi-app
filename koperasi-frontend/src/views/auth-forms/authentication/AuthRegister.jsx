import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/axios.js';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

export default function AuthRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!acceptedTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await api.post('/register', form);
      const { token, user } = response.data;
      if (!token) {
        setError('Token tidak ditemukan dari server setelah pendaftaran.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard/default', { replace: true });
    } catch (requestError) {
      const validationErrors = requestError.response?.data?.errors;
      const message = validationErrors
        ? Object.values(validationErrors).flat().join(' ')
        : requestError.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormControl fullWidth>
            <InputLabel htmlFor="register-name">Nama Lengkap</InputLabel>
            <OutlinedInput id="register-name" name="name" value={form.name} onChange={updateField} label="Nama Lengkap" required />
          </CustomFormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CustomFormControl fullWidth>
            <InputLabel htmlFor="register-username">Username</InputLabel>
            <OutlinedInput id="register-username" name="username" value={form.username} onChange={updateField} label="Username" required />
          </CustomFormControl>
        </Grid>
      </Grid>
      <CustomFormControl fullWidth>
        <InputLabel htmlFor="register-email">Email</InputLabel>
        <OutlinedInput id="register-email" type="email" name="email" value={form.email} onChange={updateField} label="Email" required />
      </CustomFormControl>
      <CustomFormControl fullWidth>
        <InputLabel htmlFor="register-password">Password</InputLabel>
        <OutlinedInput
          id="register-password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={form.password}
          onChange={updateField}
          label="Password"
          inputProps={{ minLength: 6 }}
          required
          endAdornment={<InputAdornment position="end"><IconButton aria-label="toggle password visibility" onClick={() => setShowPassword((shown) => !shown)} edge="end" size="large">{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment>}
        />
      </CustomFormControl>
      <FormControlLabel
        control={<Checkbox checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} color="primary" />}
        label={<Typography variant="subtitle1">Setuju dengan <Typography variant="subtitle1" component={Link} to="#">Syarat & Ketentuan</Typography>.</Typography>}
      />
      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary" disabled={loading}>
            {loading ? 'Registering...' : 'Sign up'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
