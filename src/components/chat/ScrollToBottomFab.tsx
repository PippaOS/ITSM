import { Box, Fab, Fade, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ScrollToBottomFabProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottomFab({ show, onClick }: ScrollToBottomFabProps) {
  const theme = useTheme();

  return (
    <Fade in={show} timeout={200} unmountOnExit>
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 80, sm: 90 },
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      >
        <Tooltip title="Scroll to latest" placement="top">
          <Fab
            color="primary"
            size="small"
            onClick={onClick}
            sx={{
              pointerEvents: 'auto',
              boxShadow: t => t.shadows[8],
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.contrastText,
              },
            }}
          >
            <KeyboardArrowDownIcon />
          </Fab>
        </Tooltip>
      </Box>
    </Fade>
  );
}
