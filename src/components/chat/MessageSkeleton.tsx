import { Box, Skeleton, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MessageSkeletonProps {
  count?: number;
}

export function MessageSkeleton({ count = 5 }: MessageSkeletonProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isUser = index % 2 === 0;
        return (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                maxWidth: '85%',
                p: 2,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Skeleton
                  variant="circular"
                  width={24}
                  height={24}
                  sx={{ flexShrink: 0 }}
                />
                <Skeleton variant="text" width={80} height={24} />
              </Box>
              <Skeleton
                variant="rectangular"
                width={Math.random() * 200 + 250}
                height={Math.random() * 30 + 60}
                sx={{ borderRadius: 1 }}
              />
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}
