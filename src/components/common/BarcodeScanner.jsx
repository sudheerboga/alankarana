import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, IconButton, Typography, CircularProgress, Dialog } from '@mui/material';
import { CloseRounded, CameraAltRounded } from '@mui/icons-material';

/**
 * Full-screen camera barcode scanner modal.
 *
 *   <BarcodeScanner
 *     open={bool}
 *     onScan={(code: string) => void}   // called once on successful decode, camera stops
 *     onClose={() => void}
 *   />
 *
 * Uses @zxing/browser (lazy-loaded so it doesn't bloat the initial bundle).
 * Prefers back/environment camera on mobile.
 * Handles camera permission denial with a clear inline error.
 */
const BarcodeScanner = ({ open, onScan, onClose }) => {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan; // always up-to-date without re-running the effect

  const [status, setStatus] = useState('idle'); // 'idle' | 'starting' | 'scanning' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const stopCamera = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch (_) {}
      controlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      return;
    }

    setStatus('starting');
    setErrorMsg('');
    let cancelled = false;

    (async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser');
        if (cancelled) return;

        const reader = new BrowserMultiFormatReader();

        const controls = await reader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' }, // back camera on mobile
              width: { ideal: 1280 },
            },
          },
          videoRef.current,
          (result, _err) => {
            if (result) {
              stopCamera();
              onScanRef.current(result.getText());
            }
            // errors here are "no barcode this frame" — normal, ignore them
          }
        );

        if (cancelled) { controls.stop(); return; }
        controlsRef.current = controls;
        setStatus('scanning');
      } catch (err) {
        if (cancelled) return;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMsg('Camera access denied. Allow camera permission in your browser or device settings, then try again.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setErrorMsg('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setErrorMsg('Camera is already in use by another app. Close it and try again.');
        } else {
          setErrorMsg(`Could not start camera. ${err.message || ''}`);
        }
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { backgroundColor: '#000', borderRadius: 0 } }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Close button */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            right: 12,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#fff',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.75)' },
            '&:active': { backgroundColor: 'rgba(0,0,0,0.85)' },
          }}
        >
          <CloseRounded />
        </IconButton>

        {/* Starting state */}
        {status === 'starting' && (
          <Box
            sx={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              zIndex: 10,
              px: 7,
            }}
          >
            <CircularProgress size={15} sx={{ color: '#fff' }} />
            <Typography sx={{ color: '#fff', fontSize: 13 }}>Starting camera…</Typography>
          </Box>
        )}

        {/* Camera feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: status === 'error' ? 'none' : 'block',
          }}
        />

        {/* Viewfinder overlay — only when actively scanning */}
        {status === 'scanning' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {/* Dark surround with cutout via box-shadow */}
            <Box
              sx={{
                width: 280,
                height: 170,
                borderRadius: 2,
                border: '2.5px solid #fff',
                // box-shadow spreads dark overlay over everything outside the frame
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.52)',
              }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, mt: 3 }}>
              Align barcode within the frame
            </Typography>
          </Box>
        )}

        {/* Error state */}
        {status === 'error' && (
          <Box sx={{ p: 4, textAlign: 'center', zIndex: 10 }}>
            <CameraAltRounded sx={{ fontSize: 64, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
            <Typography sx={{ color: '#fff', fontSize: 16, fontWeight: 600, mb: 1.5 }}>
              Camera unavailable
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7 }}>
              {errorMsg}
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default BarcodeScanner;
