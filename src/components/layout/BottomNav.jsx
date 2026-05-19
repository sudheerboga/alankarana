import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  DashboardRounded,
  Inventory2Rounded,
  PointOfSaleRounded,
  ReceiptLongRounded,
  AssessmentRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { ROUTES } from '../../constants';

const NAV_ITEMS = [
  { label: 'Home', value: ROUTES.DASHBOARD, icon: <DashboardRounded /> },
  { label: 'Items', value: ROUTES.ITEMS, icon: <Inventory2Rounded /> },
  { label: 'Sell', value: ROUTES.SALE_NEW, icon: <PointOfSaleRounded /> },
  { label: 'Expenses', value: ROUTES.EXPENSES, icon: <ReceiptLongRounded /> },
  { label: 'Reports', value: ROUTES.REPORTS, icon: <AssessmentRounded /> },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, zIndex } = useTheme();

  // Match exact route OR a prefix (so /items/new keeps "Items" highlighted)
  const current =
    NAV_ITEMS.find((n) => location.pathname === n.value)?.value ??
    NAV_ITEMS.find((n) => n.value !== '/' && location.pathname.startsWith(n.value))?.value ??
    ROUTES.DASHBOARD;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: zIndex.fixed,
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <BottomNavigation
        value={current}
        onChange={(_, val) => navigate(val)}
        showLabels
        sx={{ height: 64 }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.value}
            label={item.label}
            value={item.value}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
