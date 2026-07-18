import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '@/api/axios.js'; // Import api instance

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert'; // Import Alert for error messages

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===========================|| JWT - REGISTER ||=========================== //

export default function AuthRegister() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(true);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [strength, setStrength] = useState(0);
  const [level, setLevel] = useState();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => { // Update password state
    setPassword(value);
    const temp = strengthIndicator(value);
    setStrength(temp);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    // Initial check for password strength, or remove if not needed on mount
    // For now, let's just ensure password strength is calculated when password changes
    // This useEffect can be removed if changePassword is called directly from onChange
    if (password) { // Only calculate if password is not empty
        changePassword(password);
    } else {
        setStrength(0);
        setLevel(null);
    }
  }, [password]); // Recalculate when password state changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/register', {
        name: name,
        username: username,
        email: email,
        password: password,
      });

      const token = response.data?.token;
      const user = response.data?.user;

      if (token) {
        localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));

        // Redirect ke halaman dashboard atau admin setelah sukses
        navigate('/admin/dashboard'); // Sesuaikan dengan rute dashboard Anda
      } else {
        setError('Token tidak ditemukan dari server setelah pendaftaran.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Handle validation errors from Laravel
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        let errorMessage = '';
        for (const key in errors) {
          errorMessage += errors[key].join(', ') + ' ';
        }
        setError(errorMessage.trim());
      } else {
        setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack sx={{ mb: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">Sign up with Email address </Typography>
      </Stack>
    <form noValidate onSubmit={handleSubmit}>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Grid container spacing={{ xs: 0, sm: 2 }}>
        <Grid item xs={12} sm={6}> {/* Changed size to item xs={12} sm={6} */}
          <CustomFormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-name-register">Nama Lengkap</InputLabel>
            <OutlinedInput
              id="outlined-adornment-name-register"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </CustomFormControl>
        </Grid>
        <Grid item xs={12} sm={6}> {/* Changed size to item xs={12} sm={6} */}
          <CustomFormControl fullWidth>
            <InputLabel htmlFor="outlined-adornment-username-register">Username</InputLabel>
            <OutlinedInput
              id="outlined-adornment-username-register"
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </CustomFormControl>
        </Grid>
      </Grid>
      <CustomFormControl fullWidth>
        <InputLabel htmlFor="outlined-adornment-email-register">Email Address</InputLabel>
        <OutlinedInput
          id="outlined-adornment-email-register"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </CustomFormControl>

      <CustomFormControl fullWidth>
        <InputLabel htmlFor="outlined-adornment-password-register">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password-register"
          type={showPassword ? 'text' : 'password'}
          value={password}
          name="password"
          label="Password"
          onChange={(e) => changePassword(e.target.value)} // Use changePassword to update state and strength
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
        />
      </CustomFormControl>

      {strength !== 0 && (
        <FormControl fullWidth>
          <Box sx={{ mb: 2 }}>
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
              <Box sx={{ width: 85, height: 8, borderRadius: '7px', bgcolor: level?.color }} />
              <Typography variant="subtitle1" sx={{ fontSize: '0.75rem' }}>
                {level?.label}
              </Typography>
            </Stack>
          </Box>
        </FormControl>
      )}

      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} name="checked" color="primary" />}
        label={
          <Typography variant="subtitle1">
            Agree with &nbsp;
            <Typography variant="subtitle1" component={Link} to="#">
              Terms & Condition.
            </Typography>
          </Typography>
        }
      />

      <Box sx={{ mt: 2 }}>
        <AnimateButton>
          <Button disableElevation fullWidth size="large" type="submit" variant="contained" color="secondary" disabled={loading}>
            {loading ? 'Registering...' : 'Sign up'}
          </Button>
        </AnimateButton>
      </Box>
    </form>
    </>
  );
}
