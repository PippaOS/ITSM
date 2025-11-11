import { type UIEvent } from 'react';
import { Box, Button, Paper, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { type UIMessage } from '@convex-dev/agent/react';
import { Message } from './Message';
import { MessageSkeleton } from './MessageSkeleton';

interface MessageListProps {
  messages: UIMessage[] | undefined;
  showLoadMoreButton: boolean;
  canLoadMore: boolean;
  onLoadMore: (count: number) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({
  messages,
  showLoadMoreButton,
  canLoadMore,
  onLoadMore,
  onScroll,
  scrollContainerRef,
}: MessageListProps) {
  const theme = useTheme();
  const isLoadingInitial = messages === undefined;
  const hasMessages = (messages?.length ?? 0) > 0;

  return (
    <Box
      ref={scrollContainerRef}
      onScroll={onScroll}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          maxWidth: '1400px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          pt: 2,
          pb: { xs: 4, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {showLoadMoreButton && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExpandLessIcon />}
              onClick={() => onLoadMore(20)}
              disabled={!canLoadMore}
            >
              Load previous messages
            </Button>
          </Box>
        )}

        {isLoadingInitial ? (
          <MessageSkeleton count={8} />
        ) : hasMessages ? (
          messages.map((m, index) => (
            <Message
              key={m.key}
              message={m}
              isLast={index === messages.length - 1}
            />
          ))
        ) : (
          <Paper
            elevation={0}
            sx={{
              mt: 'auto',
              mb: 'auto',
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.08)
                  : theme.palette.background.paper,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Start the conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ask a question or describe what you need help with and the
              assistant will respond instantly.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
