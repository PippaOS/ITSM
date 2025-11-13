import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
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
  const userTeams = useQuery(api.teams.getTeamsForUser, { userId });
  const [copied, setCopied] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" sx={{ textTransform: 'none' }} />
          <Tab label="Teams" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
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
        </>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 2 }}>
          {userTeams === undefined ? (
            <Typography>Loading teams...</Typography>
          ) : userTeams.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                This user is not a member of any teams yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Team ID</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userTeams.map(team => (
                    <TableRow
                      key={team._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/teams/${team._id}`)}
                    >
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/teams/${team._id}`);
                          }}
                          sx={{
                            textDecoration: 'underline',
                            color: 'primary.main',
                            cursor: 'pointer',
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            font: 'inherit',
                          }}
                        >
                          {team._id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {new Date(team._creationTime).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
}
