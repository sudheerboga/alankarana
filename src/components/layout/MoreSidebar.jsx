import { createContext, useContext, useState } from 'react';
import {
  Box, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
} from '@mui/material';
import {
  ReceiptRounded, ReceiptLongRounded, AssessmentRounded, RecordVoiceOverRounded,
  SettingsRounded, CategoryRounded, StorefrontRounded, CloseRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { ROUTES } from '../../constants';

const MORE_ITEMS = [
  { label: 'Sales', icon: ReceiptRounded, route: ROUTES.SALES },
  { label: 'Expenses', icon: ReceiptLongRounded, route: ROUTES.EXPENSES },
  { label: 'Reports', icon: AssessmentRounded, route: ROUTES.REPORTS },
  { label: 'Customer Requests', icon: RecordVoiceOverRounded, route: ROUTES.REQUESTS },
  { label: 'Categories', icon: CategoryRounded, route: ROUTES.CATEGORIES },
  { label: 'Vendors', icon: StorefrontRounded, route: ROUTES.VENDORS },
  { label: 'Settings', icon: SettingsRounded, route: ROUTES.SETTINGS },
];

const MoreDrawerContext = createContext(null);

export const useMoreDrawer = () => useContext(MoreDrawerContext);

export const MoreSidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <MoreDrawerContext.Provider value={{ open, setOpen }}>
      {children}

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: colors.surface,
            borderRight: `1px solid ${colors.border}`,
            borderRadius: '0',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2.5,
            pt: 'calc(env(safe-area-inset-top, 0px) + 14px)',
            pb: 1.5,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              letterSpacing: '-0.02em',
            }}
          >
            Menu
          </Typography>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: colors.textMuted }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>

        <List sx={{ pt: 1.5, pb: 2 }}>
          {MORE_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.route);

            return (
              <Box key={item.route}>
                {idx === 4 && <Divider sx={{ mx: 2, my: 1, borderColor: colors.border }} />}
                <ListItemButton
                  onClick={() => { setOpen(false); navigate(item.route); }}
                  sx={{
                    mx: 1,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    backgroundColor: active ? `${colors.primary}14` : 'transparent',
                    '&:hover': {
                      backgroundColor: active ? `${colors.primary}1e` : colors.surfaceAlt,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        backgroundColor: active ? `${colors.primary}20` : colors.surfaceAlt,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 20,
                          color: active ? colors.primary : colors.textSecondary,
                        }}
                      />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: active ? 600 : 500,
                          color: colors.text,
                        }}
                      >
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Box>
            );
          })}
        </List>
      </Drawer>
    </MoreDrawerContext.Provider>
  );
};
