import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from 'convex/react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import NotesAndTags from '../components/NotesAndTags';
import { EditTeamDialog, EditTeamButton } from '../components/EditTeamDialog';

type TabValue = 'details' | 'members';

export default function TeamDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const teamId = id as Id<'teams'>;
  const teamData = useQuery(api.teams.getTeam, { teamId });
  const users = useQuery(api.users.listUsers);
  const updateTeam = useMutation(api.teams.updateTeam);
  const addMemberToTeam = useMutation(api.teams.addMemberToTeam);
  const removeMemberFromTeam = useMutation(api.teams.removeMemberFromTeam);
  const [editOpen, setEditOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState<TabValue>('details');
  const [copied, setCopied] = React.useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] =
    React.useState<Id<'users'> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(teamId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue
  ) => {
    setTabValue(newValue);
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addMemberToTeam({
        teamId,
        userId: selectedUserId,
      });
      setAddMemberDialogOpen(false);
      setSelectedUserId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = React.useCallback(
    async (userId: Id<'users'>) => {
      if (
        !confirm('Are you sure you want to remove this member from the team?')
      ) {
        return;
      }

      try {
        await removeMemberFromTeam({
          teamId,
          userId,
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to remove member');
      }
    },
    [removeMemberFromTeam, teamId]
  );

  // Get available users (not already members)
  const availableUsers = React.useMemo(() => {
    if (!users || !teamData?.members) return [];
    const memberIds = new Set(teamData.members.map(m => m._id));
    return users.filter(u => !memberIds.has(u._id));
  }, [users, teamData?.members]);

  // Still loading
  if (teamData === undefined) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // Team not found
  if (teamData === null) {
    return (
      <Box sx={{ p: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem', mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/teams')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Teams
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
              {teamId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        <Typography>Team not found</Typography>
      </Box>
    );
  }

  const { name, description, members } = teamData;

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '1.5rem' }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/teams')}
            sx={{
              fontSize: 'inherit',
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            Teams
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
              {teamId}
            </Link>
          </Tooltip>
        </Breadcrumbs>
        {tabValue === 'details' && <EditTeamButton onClick={handleEditOpen} />}
        {tabValue === 'members' && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setAddMemberDialogOpen(true)}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
              border: 'none',
              backgroundColor:
                theme.palette.mode === 'dark' ? '#4b4b4b' : '#f4f4f4',
              color: theme.palette.primary.main,
              '&:hover': {
                border: 'none',
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Add Member
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Details" value="details" sx={{ textTransform: 'none' }} />
          <Tab label="Members" value="members" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>

      {tabValue === 'details' && (
        <>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {name}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 2, whiteSpace: 'pre-wrap' }}
                >
                  {description}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(teamData._creationTime).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <NotesAndTags entityTable="teams" entityId={teamId as string} />
        </>
      )}

      {tabValue === 'members' && (
        <Box sx={{ mt: 2 }}>
          {members.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No members in this team yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>User ID</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map(member => (
                    <TableRow
                      key={member._id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/users/${member._id}`)}
                    >
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email || '—'}</TableCell>
                      <TableCell>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/users/${member._id}`);
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
                          {member._id}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveMember(member._id);
                          }}
                          title="Remove from team"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <EditTeamDialog
        teamId={teamId}
        team={teamData}
        updateTeam={async args => {
          await updateTeam(args);
        }}
        open={editOpen}
        onClose={handleEditClose}
      />

      <Dialog
        open={addMemberDialogOpen}
        onClose={() => {
          setAddMemberDialogOpen(false);
          setSelectedUserId(null);
          setError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Member to Team</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={option =>
                option.email ? `${option.name} (${option.email})` : option.name
              }
              value={
                selectedUserId
                  ? availableUsers.find(u => u._id === selectedUserId) || null
                  : null
              }
              onChange={(_, newValue) => {
                setSelectedUserId(newValue?._id || null);
                setError(null);
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="Select User"
                  variant="standard"
                  disabled={isSubmitting}
                />
              )}
            />
            {error && (
              <Box sx={{ color: 'error.main', mt: 2, fontSize: '0.875rem' }}>
                {error}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddMemberDialogOpen(false);
              setSelectedUserId(null);
              setError(null);
            }}
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!selectedUserId || isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
