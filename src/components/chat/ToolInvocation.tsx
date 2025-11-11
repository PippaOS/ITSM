import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ToolInvocationProps {
  part: {
    type: string;
    toolCallId?: string;
    state?: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}

export function ToolInvocation({ part }: ToolInvocationProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const toolSurfaceBackground = isDark
    ? '#212121'
    : theme.palette.background.paper;
  const ioBackground = isDark
    ? alpha(theme.palette.primary.main, 0.05)
    : alpha('#000000', 0.04);
  const errorBackground = alpha(theme.palette.error.main, 0.18);
  const successBackground = alpha(theme.palette.success.main, 0.18);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Extract tool name from type (e.g., "tool-getMyAssets" -> "getMyAssets")
  const toolName = part.type.replace('tool-', '');
  const toolCallId = part.toolCallId;
  const state = part.state;
  const input = part.input;
  const output = part.output;
  const errorText = part.errorText;

  const getStateColor = () => {
    if (state === 'error' || errorText) return 'error';
    if (state === 'output-available') return 'success';
    if (state === 'input-available') return 'info';
    return 'default';
  };

  const getStateIcon = () => {
    if (state === 'error' || errorText) {
      return <ErrorIcon sx={{ fontSize: 16 }} />;
    }
    if (state === 'output-available') {
      return <CheckCircleIcon sx={{ fontSize: 16 }} />;
    }
    return <BuildIcon sx={{ fontSize: 16 }} />;
  };

  const getStateLabel = () => {
    if (state === 'error' || errorText) return 'Error';
    if (state === 'output-available') return 'Completed';
    if (state === 'input-available') return 'Running';
    if (state === 'input-streaming') return 'Starting...';
    return 'Pending';
  };

  const stateColor = getStateColor();
  const stateLabel = getStateLabel();
  const stateIcon = getStateIcon();

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toolCallId) {
      try {
        await navigator.clipboard.writeText(toolCallId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy ID:', err);
      }
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.75,
        backgroundColor: toolSurfaceBackground,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: expanded ? 1 : 0,
        }}
      >
        {stateIcon}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, flex: 1, textTransform: 'capitalize' }}
        >
          {toolName}
        </Typography>
        <Chip
          label={stateLabel}
          color={stateColor === 'default' ? 'default' : stateColor}
          variant={stateColor === 'default' ? 'outlined' : 'filled'}
          size="small"
          sx={{ height: 22, fontSize: '0.7rem', borderRadius: 1 }}
        />
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          disableRipple
          sx={{
            p: 0.5,
            borderRadius: 2,
            color: 'text.secondary',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.primary.main,
            },
          }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1.25,
            pt: 1.25,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {input !== undefined && input !== null && (
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
              >
                Input:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  backgroundColor: ioBackground,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(input, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}

          {errorText && (
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  display: 'block',
                  mb: 0.5,
                  color: 'error.main',
                }}
              >
                Error:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  backgroundColor: errorBackground,
                  color: 'error.dark',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                {errorText}
              </Paper>
            </Box>
          )}

          {output !== undefined && output !== null && !errorText && (
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}
              >
                Output:
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  backgroundColor: successBackground,
                  color: 'text.primary',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 300,
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(output, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}

          {toolCallId && (
            <Box sx={{ mt: 1 }}>
              <Tooltip title={copied ? 'Copied!' : 'Click to copy ID'} arrow>
                <Typography
                  variant="caption"
                  onClick={handleCopyId}
                  sx={{
                    color: 'text.secondary',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'block',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: 'primary.main',
                      fontWeight: 600,
                    },
                  }}
                >
                  {toolCallId}
                </Typography>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
