import { useRef, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress, ButtonBase } from '@mui/material';
import { AddPhotoAlternateRounded, CloseRounded } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { uploadImage, compressImage, cldUrl } from '../../services/cloudinary';
import { pushToast } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Multi-image picker with upload preview.
 * Value shape: [{ url, publicId, width, height }]
 *
 * - Compresses client-side before upload (4MB phone photo → ~200KB)
 * - Shows upload progress per slot
 * - Capped at maxImages
 */
const ImagePicker = ({
  value = [],
  onChange,
  maxImages = 4,
  folder = 'products',
  label = 'Photos',
}) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [uploads, setUploads] = useState([]); // [{ id, progress }]

  const handleFiles = async (files) => {
    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      dispatch(pushToast({ message: `Max ${maxImages} photos`, severity: 'warning' }));
      return;
    }
    const list = Array.from(files).slice(0, remaining);

    for (const file of list) {
      const uploadId = `${Date.now()}-${file.name}`;
      setUploads((prev) => [...prev, { id: uploadId, progress: 0 }]);

      try {
        const compressed = await compressImage(file, { maxWidth: 1600, quality: 0.85 });
        const result = await uploadImage(compressed, {
          folder,
          onProgress: (pct) =>
            setUploads((prev) => prev.map((u) => (u.id === uploadId ? { ...u, progress: pct } : u))),
        });
        onChange?.([...value, result]);
      } catch (err) {
        console.error(err);
        dispatch(pushToast({ message: `Upload failed: ${file.name}`, severity: 'error' }));
      } finally {
        setUploads((prev) => prev.filter((u) => u.id !== uploadId));
      }
    }
  };

  const handleRemove = (index) => {
    const next = value.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const canAdd = value.length + uploads.length < maxImages;

  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <AnimatePresence>
          {value.map((img, idx) => (
            <motion.div
              key={img.publicId || img.url || idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
            >
              <Box
                sx={{
                  width: 84, height: 84,
                  borderRadius: 1.5,
                  position: 'relative',
                  backgroundImage: `url(${img.publicId ? cldUrl(img.publicId, { width: 200, height: 200 }) : img.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `1px solid ${colors.border}`,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleRemove(idx)}
                  sx={{
                    position: 'absolute',
                    top: -8, right: -8,
                    backgroundColor: colors.danger,
                    color: '#fff',
                    width: 24, height: 24,
                    '&:hover': { backgroundColor: colors.danger },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>

        {uploads.map((u) => (
          <Box
            key={u.id}
            sx={{
              width: 84, height: 84,
              borderRadius: 1.5,
              backgroundColor: colors.surfaceAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 0.5,
              border: `1px dashed ${colors.borderStrong}`,
            }}
          >
            <CircularProgress size={24} variant="determinate" value={u.progress} />
            <Typography sx={{ fontSize: 10, color: colors.textMuted }}>{u.progress}%</Typography>
          </Box>
        ))}

        {canAdd && (
          <ButtonBase
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 84, height: 84,
              borderRadius: 1.5,
              border: `1px dashed ${colors.borderStrong}`,
              backgroundColor: colors.surface,
              color: colors.textMuted,
              display: 'flex', flexDirection: 'column', gap: 0.5,
              '&:hover': { backgroundColor: colors.surfaceAlt },
            }}
          >
            <AddPhotoAlternateRounded sx={{ fontSize: 24 }} />
            <Typography sx={{ fontSize: 10, fontWeight: 500 }}>Add</Typography>
          </ButtonBase>
        )}
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        hidden
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = ''; // allow re-selecting the same file
        }}
      />
    </Box>
  );
};

export default ImagePicker;
