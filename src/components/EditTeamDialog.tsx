import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import type { Id } from '../../convex/_generated/dataModel';

type Team = {
  _id: Id<'teams'>;
  _creationTime: number;
  name: string;
  description: string;
};

type UpdateTeamArgs = {
  teamId: Id<'teams'>;
  name?: string;
  description?: string;
};

interface EditTeamDialogProps {
  teamId: Id<'teams'>;
  team: Team;
  updateTeam: (args: UpdateTeamArgs) => Promise<void>;
  open: boolean;
  onClose: () => void;
}

export function EditTeamDialog({
  teamId,
  team,
  updateTeam,
  open,
  onClose,
}: EditTeamDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: team.name,
        description: team.description,
      });
      setError(null);
    }
  }, [open, team]);

  const handleClose = () => {
    onClose();
    setError(null);
  };

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateTeam({
        teamId,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Team</DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                autoFocus
                label="Name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange('name')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange('description')}
                disabled={isSubmitting}
                required
              />
            </Grid>
          </Grid>
          {error && (
            <Box sx={{ color: 'error.main', mt: 3, fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              borderRadius: 4,
              textTransform: 'none',
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

interface EditTeamButtonProps {
  onClick: () => void;
}

export function EditTeamButton({ onClick }: EditTeamButtonProps) {
  const theme = useTheme();
  return (
    <Button
      variant="outlined"
      startIcon={<EditIcon />}
      onClick={onClick}
      sx={{
        borderRadius: 4,
        textTransform: 'none',
        border: 'none',
        backgroundColor: theme.palette.mode === 'dark' ? '#4b4b4b' : '#f4f4f4',
        color: theme.palette.primary.main,
        '&:hover': {
          border: 'none',
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      }}
    >
      Edit
    </Button>
  );
}
