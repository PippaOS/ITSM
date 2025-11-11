import { useState } from 'react';
import { Box, alpha, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSmoothText, type UIMessage } from '@convex-dev/agent/react';
import { MarkdownWithEntityIds } from '../MarkdownWithEntityIds';
import { MessageReasoning } from './MessageReasoning';
import { ToolInvocation } from './ToolInvocation';

interface MessageProps {
  message: UIMessage;
  isLast?: boolean;
}

export function Message({ message, isLast = false }: MessageProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [copied, setCopied] = useState(false);
  const userTextColor = theme.palette.userMessage.contrastText;
  const assistantBackground = isDark
    ? '#212121'
    : theme.palette.background.paper;
  const codeOnUserBackground = alpha(
    theme.palette.userMessage.contrastText,
    0.22
  );
  const codeOnAssistantBackground = isDark
    ? alpha(theme.palette.primary.main, 0.2)
    : alpha('#000000', 0.08);
  const preOnUserBackground = alpha(
    theme.palette.userMessage.contrastText,
    0.16
  );
  const preOnAssistantBackground = isDark
    ? alpha(theme.palette.primary.main, 0.08)
    : alpha('#000000', 0.04);
  const blockquoteBorderUser = alpha(
    theme.palette.userMessage.contrastText,
    0.48
  );
  const blockquoteBorderAssistant = isDark
    ? alpha(theme.palette.primary.main, 0.24)
    : alpha('#000000', 0.2);
  const tableBorderUser = alpha(theme.palette.userMessage.contrastText, 0.35);
  const tableBorderAssistant = isDark
    ? alpha(theme.palette.primary.main, 0.18)
    : alpha('#000000', 0.2);
  const tableHeaderUser = alpha(theme.palette.userMessage.contrastText, 0.22);
  const tableHeaderAssistant = isDark
    ? alpha(theme.palette.primary.main, 0.18)
    : alpha('#000000', 0.06);
  const isUser = message.role === 'user';

  // Extract tool invocations from message parts
  const toolParts =
    message.parts?.filter(part => part.type && part.type.startsWith('tool-')) ||
    [];

  // Extract text parts
  const textParts = message.parts?.filter(part => part.type === 'text') || [];
  const rawTextContent =
    textParts.map(part => (part.type === 'text' ? part.text : '')).join('') ||
    message.text ||
    '';

  // Extract reasoning parts
  const reasoningParts =
    message.parts?.filter(part => part.type === 'reasoning') || [];
  const rawReasoningText =
    reasoningParts
      .map(part => (part.type === 'reasoning' ? part.text : ''))
      .join('\n') || '';

  // Use smooth text for assistant messages (streaming)
  const [smoothedText] = useSmoothText(rawTextContent, {
    startStreaming: !isUser && message.status === 'streaming',
  });

  // Use smooth text for reasoning (streaming)
  const [smoothedReasoning] = useSmoothText(rawReasoningText, {
    startStreaming: !isUser && message.status === 'streaming',
  });

  // Use smoothed text for assistant, raw text for user messages
  const textContent = isUser ? rawTextContent : smoothedText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawTextContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        gap: 1.25,
        mb: isLast && !isUser ? 6 : 0,
      }}
    >
      {/* Tool invocations - only show for assistant messages */}
      {!isUser && toolParts.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: { xs: '100%', sm: '70%' },
            flexShrink: 0,
            m: 0,
          }}
        >
          {toolParts.map((part, index) => (
            <ToolInvocation key={index} part={part} />
          ))}
        </Box>
      )}

      {/* Text content */}
      {textContent && (
        <Box
          sx={{
            width: { xs: '100%', sm: isUser ? undefined : '70%' },
            maxWidth: isUser ? { xs: '100%', sm: '75%' } : undefined,
            flexShrink: 0,
            m: 0,
            px: { xs: 1.75, sm: 2.5 },
            py: { xs: 1.5, sm: 2 },
            pb: isLast && !isUser ? { xs: 3, sm: 4 } : undefined,
            borderRadius: 2,
            backgroundColor: isUser
              ? theme.palette.userMessage.main
              : assistantBackground,
            color: isUser ? userTextColor : 'text.primary',
            border: isUser ? '1px solid' : 'none',
            borderColor: isUser ? 'transparent' : undefined,
            boxShadow: 'none',
            backdropFilter: 'none',
          }}
        >
          {/* Reasoning display - only for assistant messages */}
          {!isUser && smoothedReasoning && (
            <MessageReasoning reasoning={smoothedReasoning} />
          )}
          <Box
            sx={{
              '& p': {
                margin: 0,
                marginBottom: 1,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                lineHeight: 1.55,
                '&:last-child': {
                  marginBottom: 0,
                },
              },
              '& ul, & ol': {
                margin: 0,
                paddingLeft: 2,
                marginBottom: 1,
              },
              '& code': {
                backgroundColor: isUser
                  ? codeOnUserBackground
                  : codeOnAssistantBackground,
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.85em',
              },
              '& pre': {
                backgroundColor: isUser
                  ? preOnUserBackground
                  : preOnAssistantBackground,
                padding: '12px',
                borderRadius: 2,
                overflow: 'auto',
                marginBottom: 1,
                '& code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                },
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                marginTop: 0,
                marginBottom: 0.5,
                fontWeight: 600,
              },
              '& blockquote': {
                borderLeft: `3px solid ${
                  isUser ? blockquoteBorderUser : blockquoteBorderAssistant
                }`,
                paddingLeft: 1,
                marginLeft: 0,
                marginBottom: 1,
                fontStyle: 'italic',
              },
              '& table': {
                borderCollapse: 'collapse',
                width: '100%',
                marginBottom: 1,
              },
              '& th, & td': {
                border: `1px solid ${
                  isUser ? tableBorderUser : tableBorderAssistant
                }`,
                padding: '6px 10px',
              },
              '& th': {
                backgroundColor: isUser
                  ? tableHeaderUser
                  : tableHeaderAssistant,
              },
            }}
          >
            <MarkdownWithEntityIds isUser={isUser}>
              {textContent}
            </MarkdownWithEntityIds>
          </Box>

          {/* Copy button - only for assistant messages */}
          {!isUser && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Tooltip title={copied ? 'Copied!' : 'Copy message'} arrow>
                <IconButton
                  size="small"
                  onClick={handleCopy}
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
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
