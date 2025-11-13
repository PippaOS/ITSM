import { type FormEvent } from 'react';
import { Box, TextField, Button, alpha, Select, MenuItem } from '@mui/material';
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
  availableModels: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function MessageComposer({
  prompt,
  onPromptChange,
  onSend,
  onSubmit,
  disabled,
  isSending,
  onEnableAutoScroll,
  availableModels,
  selectedModel,
  onModelChange,
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
        }}
      >
        <Box
          sx={{
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
        {availableModels.length > 0 && (
          <Box sx={{ mt: 1, pl: 0.5 }}>
            <Select
              value={selectedModel}
              onChange={e => onModelChange(e.target.value)}
              disabled={isSending}
              size="small"
              variant="standard"
              disableUnderline
              sx={{
                fontSize: '0.75rem',
                color: 'text.secondary',
                '& .MuiSelect-select': {
                  padding: '2px 24px 2px 4px',
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                },
                '& .MuiSvgIcon-root': {
                  color: 'text.secondary',
                  fontSize: '1rem',
                },
                '&:hover': {
                  color: 'text.primary',
                  '& .MuiSvgIcon-root': {
                    color: 'text.primary',
                  },
                },
              }}
            >
              {availableModels.map(model => (
                <MenuItem
                  key={model}
                  value={model}
                  sx={{ fontSize: '0.875rem' }}
                >
                  {model}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
      </Box>
    </Box>
  );
}
