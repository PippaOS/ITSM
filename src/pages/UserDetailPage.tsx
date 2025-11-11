import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { useQuery } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import NotesAndTags from '../components/NotesAndTags';

export default function UserDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = id as Id<'users'>;
  const user = useQuery(api.users.getUser, { userId });
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (user === undefined) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (user === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem', mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/users')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Users
          </Link>
          <Tooltip
            title={copied ? 'Copied!' : 'Click to copy ID'}
            arrow
            onClose={() => setCopied(false)}
          >
            <Link
              component="button"
              underline="none"
              color="text.primary"
              onClick={handleCopyId}
              sx={{
                fontSize: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {userId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        <Typography>User not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem' }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/users')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Users
          </Link>
          <Tooltip
            title={copied ? 'Copied!' : 'Click to copy ID'}
            arrow
            onClose={() => setCopied(false)}
          >
            <Link
              component="button"
              underline="none"
              color="text.primary"
              onClick={handleCopyId}
              sx={{
                fontSize: 'inherit',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              }}
            >
              {userId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.name}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.email || 'N/A'}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              External ID
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.externalId}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Token Identifier
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {user.tokenIdentifier}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date(user._creationTime).toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <NotesAndTags entityTable="users" entityId={userId as string} />
    </Box>
  );
}
