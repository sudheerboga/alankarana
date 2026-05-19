import { useEffect, useState, useRef } from 'react';
import { Box, InputBase, IconButton, Paper } from '@mui/material';
import { SearchRounded, CloseRounded, TuneRounded } from '@mui/icons-material';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Sticky search input with optional filter button trailing.
 * Debounces onChange by 200ms — avoids re-filtering on every keystroke.
 */
const StickySearch = ({
  value,
  onChange,
  placeholder = 'Search…',
  onFilterClick,
  hasActiveFilters = false,
  topOffset = 56,  // top of TopBar
}) => {
  const { colors, zIndex } = useTheme();
  const [local, setLocal] = useState(value || '');
  const timerRef = useRef(null);

  // Keep local in sync if parent resets externally
  useEffect(() => setLocal(value || ''), [value]);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocal(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange?.(next), 200);
  };

  const handleClear = () => {
    setLocal('');
    onChange?.('');
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: topOffset,
        zIndex: zIndex.sticky,
        backgroundColor: colors.bg,
        px: 2, py: 1.5,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5, py: 0.5,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: 999,
        }}
      >
        <SearchRounded sx={{ color: colors.textMuted, fontSize: 20 }} />
        <InputBase
          value={local}
          onChange={handleChange}
          placeholder={placeholder}
          sx={{
            flex: 1,
            fontSize: 15,
            color: colors.text,
            '& input': {
              padding: '8px 4px',
            },
            '& input::placeholder': { color: colors.textMuted, opacity: 1 },
          }}
        />
        {local && (
          <IconButton size="small" onClick={handleClear} sx={{ color: colors.textMuted }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        )}
        {onFilterClick && (
          <IconButton
            size="small"
            onClick={onFilterClick}
            sx={{
              color: hasActiveFilters ? colors.primary : colors.textMuted,
              backgroundColor: hasActiveFilters ? colors.surfaceAlt : 'transparent',
            }}
          >
            <TuneRounded fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Box>
  );
};

export default StickySearch;
