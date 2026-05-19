import { Card, Box, Skeleton } from '@mui/material';

const ItemCardSkeleton = () => (
  <Card sx={{ display: 'flex', alignItems: 'stretch', gap: 1.5, p: 1.5 }}>
    <Skeleton variant="rounded" width={72} height={72} />
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', py: 0.5 }}>
      <Box>
        <Skeleton variant="text" width="70%" sx={{ fontSize: 15 }} />
        <Skeleton variant="text" width="50%" sx={{ fontSize: 11 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={60} sx={{ fontSize: 15 }} />
        <Skeleton variant="rounded" width={80} height={20} />
      </Box>
    </Box>
  </Card>
);

export default ItemCardSkeleton;
