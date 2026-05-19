import { Box, Typography } from '@mui/material';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR } from '../../utils/format';

/**
 * Minimal SVG bar chart. Uses theme colors, no library.
 *   data: [{ label, value }]
 *   accent: optional, highlights the max bar
 */
const BarChart = ({ data = [], height = 140, valueFormatter = formatINR, accentTop = true }) => {
  const { colors, typography } = useTheme();

  if (data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: 13, color: colors.textMuted }}>No data</Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const maxIndex = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const barWidth = Math.max(8, (100 / data.length) - 2);

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '4px',
          px: 0.5,
        }}
      >
        {data.map((d, i) => {
          const pct = (d.value / maxValue) * 100;
          const isTop = accentTop && i === maxIndex;
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                minHeight: 4,
                height: `${Math.max(pct, 2)}%`,
                borderRadius: '6px 6px 2px 2px',
                background: isTop
                  ? `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`
                  : colors.surfaceAlt,
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              title={`${d.label}: ${valueFormatter(d.value)}`}
            />
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: '4px', mt: 0.75, px: 0.5 }}>
        {data.map((d, i) => (
          <Typography
            key={i}
            sx={{
              flex: 1,
              fontSize: 9,
              color: colors.textMuted,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {d.label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default BarChart;
