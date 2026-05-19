import { useState } from 'react';
import { IconButton, Menu, MenuItem, Avatar, Box, Typography, Divider, ListItemIcon } from '@mui/material';
import { LogoutRounded, SettingsRounded, PersonRounded } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser, selectRole } from '../../store/slices/authSlice';
import { openConfirm, pushToast } from '../../store/slices/uiSlice';
import { signOut } from '../../firebase/auth';
import { useTheme } from '../../theme/ThemeProvider';

const initials = (name) =>
  (name || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

const UserMenu = () => {
  const [anchor, setAnchor] = useState(null);
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors, typography } = useTheme();

  const displayName = user?.displayName || user?.phoneNumber || user?.email || 'User';

  const handleSignOut = () => {
    setAnchor(null);
    dispatch(
      openConfirm({
        title: 'Sign out?',
        message: 'You will need to sign in again to access the app.',
        confirmLabel: 'Sign out',
        severity: 'danger',
        onConfirm: async () => {
          try {
            await signOut();
            dispatch(pushToast({ message: 'Signed out', severity: 'success' }));
            navigate('/login', { replace: true });
          } catch (err) {
            dispatch(pushToast({ message: 'Could not sign out', severity: 'error' }));
          }
        },
      })
    );
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
        <Avatar sx={{
          width: 34, height: 34,
          bgcolor: colors.accent,
          color: colors.textInverse,
          fontSize: 13,
          fontWeight: 600,
        }}>
          {initials(displayName)}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
            {displayName}
          </Typography>
          <Typography sx={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', mt: 0.25 }}>
            {role || 'user'}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: colors.border }} />
        <MenuItem onClick={() => { setAnchor(null); navigate('/settings'); }}>
          <ListItemIcon><SettingsRounded fontSize="small" /></ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleSignOut} sx={{ color: colors.danger }}>
          <ListItemIcon><LogoutRounded fontSize="small" sx={{ color: colors.danger }} /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu;
