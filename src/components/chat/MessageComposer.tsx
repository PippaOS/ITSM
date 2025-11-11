import { type FormEvent } from 'react';
import { Box, TextField, Button, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';

interface MessageComposerProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSend: () => Promise<void>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  disabled: boolean;
  isSending: boolean;
  onEnableAutoScroll: () => void;
}

export function MessageComposer({
  prompt,
  onPromptChange,
  onSend,
  onSubmit,
  disabled,
  isSending,
  onEnableAutoScroll,
}: MessageComposerProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark'
            ? '#212121'
            : theme.palette.background.paper,
        py: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          maxWidth: '1400px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 },
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          placeholder="Type your message…"
          value={prompt}
          onChange={e => {
            onPromptChange(e.target.value);
            onEnableAutoScroll();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void onSend();
            }
          }}
          multiline
          maxRows={6}
          minRows={2}
          size="small"
          disabled={isSending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.04)
                  : theme.palette.background.paper,
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'divider',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'divider',
              },
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          onClick={onEnableAutoScroll}
          disabled={disabled}
          sx={{
            alignSelf: 'stretch',
            minWidth: 'auto',
            width: 56,
            borderRadius: 2,
            boxShadow: 'none',
            px: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            transition: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
}
