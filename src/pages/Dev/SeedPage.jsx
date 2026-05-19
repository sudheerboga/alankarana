import { useRef, useState } from 'react';
import { Box, Button, Card, Typography, LinearProgress, Stack } from '@mui/material';
import { PlayArrowRounded, CheckCircleRounded, ErrorRounded } from '@mui/icons-material';
import TopBar from '../../components/layout/TopBar';
import { useTheme } from '../../theme/ThemeProvider';
import { seedDatabase } from '../../dev/seedData';

const SeedPage = () => {
  const { colors, typography } = useTheme();
  const [status, setStatus] = useState('idle'); // idle | running | done | error
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  const addLog = (msg) => {
    setLogs((prev) => [...prev, msg]);
    setTimeout(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  };

  const handleSeed = async () => {
    setStatus('running');
    setLogs([]);
    try {
      await seedDatabase(addLog);
      setStatus('done');
    } catch (err) {
      addLog(`❌ Failed: ${err.message}`);
      setStatus('error');
    }
  };

  const isDone = status === 'done';
  const isError = status === 'error';
  const isRunning = status === 'running';

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Seed Test Data" back />

      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* Warning */}
          <Card sx={{ p: 2, backgroundColor: colors.warningBg, border: `1px solid ${colors.warning}30` }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.warning, mb: 0.5 }}>
              Development only
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.warning, lineHeight: 1.6 }}>
              This inserts sample inventory, sales, expenses, vendors, and customer requests
              into Firestore. Safe to run multiple times — it only adds, never deletes.
            </Typography>
          </Card>

          {/* What gets inserted */}
          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What will be inserted
            </Typography>
            <Stack spacing={0.75}>
              {[
                ['4 vendors', 'Suresh Silk Sarees, Lakshmi Jewels, Vijaya Textiles…'],
                ['12 inventory items', 'Sarees, blouses, 1gm gold, nighties, bangles…'],
                ['37 sales', 'Spread across the last 30 days with real customer names'],
                ['15 expenses', 'Fuel, food, bulk textile/jewellery purchases…'],
                ['5 customer requests', 'Pending requests across saree and gold categories'],
              ].map(([title, desc]) => (
                <Box key={title} sx={{ display: 'flex', gap: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, minWidth: 130 }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                    {desc}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Card>

          {/* Action */}
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrowRounded />}
            onClick={handleSeed}
            disabled={isRunning || isDone}
            sx={{ py: 1.5 }}
          >
            {isRunning ? 'Inserting data…' : isDone ? 'Done!' : 'Insert Test Data'}
          </Button>

          {isRunning && <LinearProgress sx={{ borderRadius: 1 }} />}

          {/* Log */}
          {logs.length > 0 && (
            <Card sx={{ p: 0, overflow: 'hidden' }}>
              <Box
                ref={logRef}
                sx={{
                  p: 2,
                  maxHeight: 360,
                  overflowY: 'auto',
                  backgroundColor: colors.bg,
                  fontFamily: typography.fontMono,
                  fontSize: 12,
                  lineHeight: 1.8,
                }}
              >
                {logs.map((line, i) => (
                  <Typography
                    key={i}
                    sx={{
                      fontFamily: 'inherit',
                      fontSize: 'inherit',
                      color: line.startsWith('✅') ? colors.success
                           : line.startsWith('❌') || line.startsWith('  ⚠️') ? colors.danger
                           : line.startsWith('  ✓') ? colors.textSecondary
                           : colors.text,
                    }}
                  >
                    {line}
                  </Typography>
                ))}
              </Box>

              {/* Status footer */}
              {(isDone || isError) && (
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5,
                    backgroundColor: isDone ? colors.successBg : colors.dangerBg,
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  {isDone
                    ? <CheckCircleRounded sx={{ fontSize: 18, color: colors.success }} />
                    : <ErrorRounded sx={{ fontSize: 18, color: colors.danger }} />
                  }
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: isDone ? colors.success : colors.danger }}>
                    {isDone ? 'All data inserted. Check Dashboard and Reports.' : 'Seed failed — check console for details.'}
                  </Typography>
                </Box>
              )}
            </Card>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default SeedPage;
