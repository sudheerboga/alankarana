import { Box, Card, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Switch, Avatar } from '@mui/material';
import {
  CategoryRounded, StorefrontRounded, RecordVoiceOverRounded, DarkModeRounded,
  LogoutRounded, ChevronRightRounded, InfoOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TopBar from '../../components/layout/TopBar';
import { selectUser, selectRole } from '../../store/slices/authSlice';
import { openConfirm, pushToast } from '../../store/slices/uiSlice';
import { signOut } from '../../firebase/auth';
import { useTheme } from '../../theme/ThemeProvider';
import { ROUTES } from '../../constants';

const initials = (n) => (n || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

const SettingsRow = ({ icon, label, sublabel, onClick, trailing, danger }) => {
  const { colors } = useTheme();
  return (
    <ListItemButton onClick={onClick} sx={{ py: 1.5 }}>
      <ListItemIcon sx={{ minWidth: 40, color: danger ? colors.danger : colors.textSecondary }}>
        {icon}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: danger ? colors.danger : colors.text }}>
            {label}
          </Typography>
        }
        secondary={sublabel}
      />
      {trailing || <ChevronRightRounded sx={{ color: colors.textMuted }} fontSize="small" />}
    </ListItemButton>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const { colors, typography, mode, toggleMode } = useTheme();

  const handleSignOut = () => {
    dispatch(openConfirm({
      title: 'Sign out?',
      message: 'You will need to sign in again to access the app.',
      confirmLabel: 'Sign out',
      severity: 'danger',
      onConfirm: async () => {
        await signOut();
        dispatch(pushToast({ message: 'Signed out', severity: 'success' }));
        navigate('/login', { replace: true });
      },
    }));
  };

  const displayName = user?.displayName || user?.phoneNumber || user?.email || 'User';

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Settings" />

      <Box sx={{ p: 2 }}>
        {/* Profile card */}
        <Card sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: colors.accent, color: colors.textInverse, width: 56, height: 56, fontSize: 18, fontWeight: 600 }}>
              {initials(displayName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text }}>{displayName}</Typography> */}
              <Typography sx={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.25 }}>
                {role || 'user'}
              </Typography>
              {user?.email && (
                <Typography sx={{ fontSize: 12, color: colors.textSecondary, mt: 0.25 }}>{user.email}</Typography>
              )}
            </Box>
          </Box>
        </Card>

        {/* Manage data */}
        <Card sx={{ mb: 2, overflow: 'hidden' }}>
          <Typography sx={{ p: 2, pb: 0, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Manage
          </Typography>
          <List sx={{ py: 0 }}>
            <SettingsRow icon={<CategoryRounded />} label="Categories" sublabel="Add or remove product categories" onClick={() => navigate(ROUTES.CATEGORIES)} />
            <Divider sx={{ ml: 7, borderColor: colors.border }} />
            <SettingsRow icon={<StorefrontRounded />} label="Vendors" sublabel="Wholesale suppliers" onClick={() => navigate(ROUTES.VENDORS)} />
            <Divider sx={{ ml: 7, borderColor: colors.border }} />
            <SettingsRow icon={<RecordVoiceOverRounded />} label="Customer Requests" sublabel="Out-of-stock notes" onClick={() => navigate(ROUTES.REQUESTS)} />
          </List>
        </Card>

        {/* Preferences */}
        {/* <Card sx={{ mb: 2, overflow: 'hidden' }}>
          <Typography sx={{ p: 2, pb: 0, fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Preferences
          </Typography>
          <List sx={{ py: 0 }}>
            <SettingsRow
              icon={<DarkModeRounded />}
              label="Dark mode"
              onClick={toggleMode}
              trailing={<Switch checked={mode === 'dark'} onChange={toggleMode} />}
            />
          </List>
        </Card> */}

        {/* Account */}
        <Card sx={{ overflow: 'hidden' }}>
          <List sx={{ py: 0 }}>
            <SettingsRow icon={<InfoOutlined />} label="About Alankarana" sublabel="Version 0.1.0" trailing={null} />
            <Divider sx={{ ml: 7, borderColor: colors.border }} />
            <SettingsRow icon={<LogoutRounded />} label="Sign out" onClick={handleSignOut} trailing={null} danger />
          </List>
        </Card>
      </Box>
    </Box>
  );
};

export default SettingsPage;
