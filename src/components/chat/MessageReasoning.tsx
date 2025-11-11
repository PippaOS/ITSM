import { Box, Typography } from '@mui/material';

interface MessageReasoningProps {
  reasoning: string;
}

export function MessageReasoning({ reasoning }: MessageReasoningProps) {
  return (
    <Box
      sx={{
        mb: 1.5,
        pb: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.7rem',
          color: 'text.secondary',
          fontStyle: 'italic',
          display: 'block',
          mb: 0.5,
        }}
      >
        💭 Reasoning:
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.8rem',
          color: 'text.secondary',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
        }}
      >
        {reasoning}
      </Typography>
    </Box>
  );
}
