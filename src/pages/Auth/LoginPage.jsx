import { useState, useRef, useEffect } from 'react';
import {
  Box, Card, Stack, Typography, TextField, Button, Tabs, Tab,
  InputAdornment, CircularProgress, Link, Select, MenuItem, FormControl,
} from '@mui/material';
import { PhoneRounded, EmailRounded, LockRounded } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { pushToast } from '../../store/slices/uiSlice';
import { sendOtp, verifyOtp, signInWithEmail } from '../../firebase/auth';

const RESEND_SECONDS = 30;

const LoginPage = () => {
  const { colors, typography } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  const [tab, setTab] = useState(0); // 0 = phone, 1 = email

  // Phone state
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const confirmationRef = useRef(null);
  const verifierRef = useRef(null);

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const id = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  // Cleanup reCAPTCHA verifier on unmount
  useEffect(() => () => verifierRef.current?.clear?.(), []);

  const COUNTRY_CODES = [
    { code: '+91',  label: '🇮🇳 +91'  },
    { code: '+971', label: '🇦🇪 +971' },
    { code: '+1',   label: '🇺🇸 +1'   },
    { code: '+44',  label: '🇬🇧 +44'  },
    { code: '+65',  label: '🇸🇬 +65'  },
    { code: '+60',  label: '🇲🇾 +60'  },
    { code: '+61',  label: '🇦🇺 +61'  },
  ];

  const handleSendOtp = async () => {
    const formatted = `${countryCode}${phone.trim()}`;
    if (!/^\+\d{10,15}$/.test(formatted)) {
      dispatch(pushToast({ message: 'Enter a valid phone number', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      verifierRef.current?.clear?.();
      const { confirmation, verifier } = await sendOtp(formatted);
      confirmationRef.current = confirmation;
      verifierRef.current = verifier;
      setOtpSent(true);
      setResendIn(RESEND_SECONDS);
      dispatch(pushToast({ message: 'OTP sent to your phone', severity: 'success' }));
    } catch (err) {
      console.error(err);
      dispatch(pushToast({
        message: err.code === 'auth/invalid-phone-number'
          ? 'Invalid phone number'
          : 'Could not send OTP. Try again.',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      dispatch(pushToast({ message: 'Enter the 6-digit code', severity: 'warning' }));
      return;
    }
    if (!confirmationRef.current) {
      dispatch(pushToast({ message: 'Request a new OTP', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(confirmationRef.current, otp);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      dispatch(pushToast({
        message: err.code === 'auth/invalid-verification-code'
          ? 'Incorrect code. Try again.'
          : 'Verification failed.',
        severity: 'error',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      dispatch(pushToast({ message: 'Enter email and password', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
        ? 'Incorrect email or password'
        : 'Could not sign in. Try again.';
      dispatch(pushToast({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', maxWidth: 400, p: 3, boxShadow: 4 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Stack spacing={2.5} alignItems="center">
          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography
              sx={{
                fontFamily: typography.fontDisplay,
                fontSize: 38,
                fontWeight: 600,
                color: colors.primary,
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              Alankarana
            </Typography>
            <Typography sx={{
              fontSize: 11,
              color: colors.textSecondary,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              mt: 0.5,
            }}>
              {/* Boutique Management */}
            </Typography>
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setOtpSent(false); }}
            variant="fullWidth"
            sx={{ width: '100%', borderBottom: `1px solid ${colors.border}` }}
          >
            <Tab label="Phone" icon={<PhoneRounded fontSize="small" />} iconPosition="start" />
            {/* <Tab label="Email" icon={<EmailRounded fontSize="small" />} iconPosition="start" /> */}
          </Tabs>

          {tab === 0 && (
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <FormControl sx={{ minWidth: 100 }} disabled={otpSent}>
                  <Select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    size="medium"
                    sx={{ fontSize: 14 }}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <MenuItem key={c.code} value={c.code} sx={{ fontSize: 14 }}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Phone Number"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  disabled={otpSent}
                  inputProps={{ inputMode: 'tel', maxLength: 12 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneRounded fontSize="small" /></InputAdornment>,
                  }}
                />
              </Box>

              {otpSent && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <Stack spacing={1.5}>
                    <TextField
                      fullWidth
                      label="6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockRounded fontSize="small" /></InputAdornment>,
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                        Code sent to {countryCode}{phone}
                      </Typography>
                      {resendIn > 0 ? (
                        <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                          Resend in {resendIn}s
                        </Typography>
                      ) : (
                        <Link
                          component="button"
                          onClick={handleSendOtp}
                          sx={{ fontSize: 12, color: colors.primary, fontWeight: 600 }}
                        >
                          Resend
                        </Link>
                      )}
                    </Box>
                  </Stack>
                </motion.div>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : otpSent ? 'Verify & Sign In' : 'Send OTP'}
              </Button>
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={2} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputProps={{ inputMode: 'email', autoCapitalize: 'none' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailRounded fontSize="small" /></InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockRounded fontSize="small" /></InputAdornment>,
                }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleEmailLogin}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Stack>
          )}

          {/* Invisible reCAPTCHA mounts here — Firebase requires a container even in invisible mode */}
          <div id="recaptcha-container" />
        </Stack>
      </motion.div>
    </Card>
  );
};

export default LoginPage;
