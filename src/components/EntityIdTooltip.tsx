import { useCallback, useState } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import {
  Tooltip,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * Regex pattern to match Convex document IDs.
 * Convex IDs are 32-character alphanumeric strings starting with a letter.
 * Format: [a-z][a-z0-9]{31}
 * Example: k17erfbx7d3c2khmfgjf4q67rx7tshw8
 */
const CONVEX_ID_PATTERN = /\b[a-z][a-z0-9]{31}\b/gi;

interface EntityIdTooltipProps {
  id: string;
  children: React.ReactNode;
  isUser?: boolean;
}

/**
 * Helper function to get the route path for a given table and ID
 */
function getEntityRoute(table: string, entityId: string): string | null {
  switch (table) {
    case 'machines':
      return `/machines/${entityId}`;
    case 'users':
      return `/users/${entityId}`;
    case 'tickets':
      return `/tickets/${entityId}`;
    default:
      return null;
  }
}

/**
 * Component that wraps an ID and shows entity details on hover.
 */
function EntityIdTooltip({ id, children, isUser }: EntityIdTooltipProps) {
  const navigate = useNavigate();
  const entityData = useQuery(api.entities.getEntityById, { id });
  const [copied, setCopied] = useState(false);

  const handleCopyId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy ID:', err);
    }
  };

  const renderEntityDetails = () => {
    if (entityData === undefined) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" sx={{ color: 'text.primary' }}>
            Loading...
          </Typography>
        </Box>
      );
    }

    if (entityData === null) {
      return (
        <Typography variant="body2" sx={{ p: 1, color: 'text.primary' }}>
          Entity not found
        </Typography>
      );
    }

    const { table, entity } = entityData;
    // Cast entity to any since backend returns v.any() and we have runtime checks
    const entityAny = entity as Record<string, unknown>;

    // Format entity data based on table type
    const formatEntity = () => {
      switch (table) {
        case 'users':
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                User
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {entityAny.name as string}
              </Typography>
              {typeof entityAny.email === 'string' && entityAny.email && (
                <Typography variant="body2">
                  <strong>Email:</strong> {entityAny.email}
                </Typography>
              )}
            </Box>
          );

        case 'machines':
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Machine
              </Typography>
              <Typography variant="body2">
                <strong>RAM:</strong> {entityAny.ramGb as number} GB
              </Typography>
              <Typography variant="body2">
                <strong>Storage:</strong>{' '}
                {entityAny.storageCapacityGb as number} GB{' '}
                {entityAny.storageType as string}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {entityAny.status as string}
              </Typography>
              {entityAny.assignedToUserId != null && (
                <Typography variant="body2">
                  <strong>Assigned:</strong> Yes
                </Typography>
              )}
            </Box>
          );

        case 'tickets':
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Ticket
              </Typography>
              <Typography variant="body2">
                <strong>Name:</strong> {entityAny.name as string}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> {entityAny.status as string}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {entityAny.description as string}
              </Typography>
            </Box>
          );

        case 'notes':
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Note
              </Typography>
              <Typography variant="body2">
                {entityAny.content as string}
              </Typography>
            </Box>
          );

        case 'tags':
          return (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Tag
              </Typography>
              <Typography variant="body2">
                <strong>{entityAny.key as string}:</strong>{' '}
                {entityAny.value as string}
              </Typography>
            </Box>
          );

        default:
          return (
            <Typography variant="body2">
              {JSON.stringify(entity, null, 2)}
            </Typography>
          );
      }
    };

    const entityRoute = getEntityRoute(table, id);

    return (
      <Paper
        sx={{
          p: 1.5,
          maxWidth: 300,
          backgroundColor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Box
          sx={{
            mb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Chip
            label={table}
            size="small"
            sx={{ fontSize: '0.7rem', height: 20 }}
          />
          {entityRoute && (
            <Button
              size="small"
              variant="contained"
              startIcon={<OpenInNewIcon />}
              onClick={e => {
                e.stopPropagation();
                window.open(entityRoute, '_blank');
              }}
              sx={{
                minWidth: 'auto',
                px: 1,
                py: 0.5,
                fontSize: '0.7rem',
                textTransform: 'none',
              }}
            >
              View
            </Button>
          )}
        </Box>
        <Box
          sx={{
            mb: 1,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tooltip title={copied ? 'Copied!' : 'Click to copy ID'} arrow>
            <Typography
              variant="caption"
              component="span"
              onClick={handleCopyId}
              sx={{
                color: 'text.secondary',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                cursor: 'pointer',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'none',
                '&:hover': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              }}
            >
              {id}
            </Typography>
          </Tooltip>
        </Box>
        {formatEntity()}
      </Paper>
    );
  };

  const entityDataForRoute =
    entityData && entityData !== null ? entityData : null;
  const route = entityDataForRoute
    ? getEntityRoute(entityDataForRoute.table, id)
    : null;

  return (
    <Tooltip
      title={renderEntityDetails()}
      arrow
      placement="top"
      disableInteractive={false}
      enterDelay={0}
      leaveDelay={0}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
            padding: 0,
            maxWidth: 'none',
            pointerEvents: 'auto',
            transition: 'none',
          },
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 8],
              },
            },
          ],
        },
      }}
    >
      <Box
        component="span"
        onClick={e => {
          if (route) {
            e.stopPropagation();
            navigate(route);
          }
        }}
        sx={{
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: 2,
          cursor: route ? 'pointer' : 'help',
          color: theme =>
            isUser
              ? theme.palette.userMessage.contrastText
              : theme.palette.primary.main,
          backgroundColor: theme =>
            isUser
              ? alpha(theme.palette.userMessage.contrastText, 0.22)
              : 'transparent',
          padding: isUser ? '2px 6px' : 0,
          borderRadius: isUser ? '6px' : 0,
          fontWeight: 500,
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}

/**
 * Helper function to process text for IDs
 */
function processTextForIds(
  inputText: string
): Array<{ type: 'text' | 'id'; content: string; id?: string }> {
  const parts: Array<{ type: 'text' | 'id'; content: string; id?: string }> =
    [];
  let lastIndex = 0;
  let match;

  // Reset regex state by creating a new regex instance
  const regex = new RegExp(CONVEX_ID_PATTERN.source, CONVEX_ID_PATTERN.flags);

  while ((match = regex.exec(inputText)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: inputText.substring(lastIndex, match.index),
      });
    }

    // Add the ID match
    const id = match[0];
    parts.push({
      type: 'id',
      content: id,
      id: id,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < inputText.length) {
    parts.push({
      type: 'text',
      content: inputText.substring(lastIndex),
    });
  }

  // If no IDs found, return the original text
  if (parts.length === 0) {
    return [{ type: 'text' as const, content: inputText }];
  }

  return parts;
}

/**
 * Component that detects Convex IDs in text and wraps them with tooltips.
 */
export function EntityIdText({
  text,
  isUser,
}: {
  text: string;
  isUser?: boolean;
}) {
  const processText = useCallback(() => {
    // Early return if text is empty
    if (!text || text.trim() === '') {
      return [{ type: 'text' as const, content: text }];
    }

    // First, check for placeholder markers (__ENTITY_ID__id__ENTITY_ID__)
    // and extract IDs from them
    const placeholderPattern =
      /__ENTITY_ID__([a-z][a-z0-9]{31})__ENTITY_ID__/gi;
    if (placeholderPattern.test(text)) {
      // Reset regex
      placeholderPattern.lastIndex = 0;

      const parts: Array<{
        type: 'text' | 'id';
        content: string;
        id?: string;
      }> = [];
      let lastIndex = 0;
      let match;

      while ((match = placeholderPattern.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          const beforeText = text.substring(lastIndex, match.index);
          // Also check for regular IDs in the before text
          const beforeParts = processTextForIds(beforeText);
          parts.push(...beforeParts);
        }

        // Add the ID from the placeholder
        const id = match[1]; // Group 1 contains the ID
        parts.push({
          type: 'id',
          content: id,
          id: id,
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        const remainingText = text.substring(lastIndex);
        const remainingParts = processTextForIds(remainingText);
        parts.push(...remainingParts);
      }

      return parts.length > 0
        ? parts
        : [{ type: 'text' as const, content: text }];
    }

    // No placeholders found, process normally for IDs
    return processTextForIds(text);
  }, [text]);

  const parts = processText();

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        }

        if (part.type === 'id' && part.id) {
          return (
            <EntityIdTooltip key={index} id={part.id} isUser={isUser}>
              {part.content}
            </EntityIdTooltip>
          );
        }

        return null;
      })}
    </>
  );
}
