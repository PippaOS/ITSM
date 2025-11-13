import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';

type CreateTeamArgs = {
  name: string;
  description: string;
};

interface AddTeamDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: CreateTeamArgs) => Promise<void>;
  isSubmitting?: boolean;
}

export default function AddTeamDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddTeamDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
  });
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
      });
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
    });
    setError(null);
    onClose();
  };

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim() || !formData.description.trim()) {
      setError('Name and description are required');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Team</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                autoFocus
                label="Name"
                fullWidth
                variant="standard"
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
                variant="standard"
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
            <Box sx={{ color: 'error.main', mt: 2, fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
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
            Add
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
