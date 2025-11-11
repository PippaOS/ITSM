import { Box, Paper, Typography, alpha } from '@mui/material';

export function ChatWelcome() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: 'center',
          maxWidth: 360,
          backgroundColor: theme =>
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.primary.main, 0.08)
              : theme.palette.background.paper,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: theme => theme.shadows[8],
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome to Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a conversation from the sidebar or start a new chat to begin
          collaborating with the assistant.
        </Typography>
      </Paper>
    </Box>
  );
}
