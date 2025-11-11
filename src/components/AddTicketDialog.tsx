import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import type { Id } from '../../convex/_generated/dataModel';

type User = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  email?: string;
  externalId: string;
  tokenIdentifier: string;
};

type CreateTicketArgs = {
  name: string;
  description: string;
  status: 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting';
  assignedTo?: Id<'users'>;
};

interface AddTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: CreateTicketArgs) => Promise<void>;
  users?: User[];
  isSubmitting?: boolean;
}

export default function AddTicketDialog({
  open,
  onClose,
  onSubmit,
  users,
  isSubmitting = false,
}: AddTicketDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    status: 'Open' as 'Open' | 'Assigned' | 'Closed' | 'On Hold' | 'Awaiting',
    assignedTo: null as Id<'users'> | null,
  });
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        description: '',
        status: 'Open',
        assignedTo: null,
      });
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      status: 'Open',
      assignedTo: null,
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
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Ticket</DialogTitle>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                fullWidth
                variant="standard"
                value={formData.status}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    status: e.target.value as typeof formData.status,
                  }))
                }
                disabled={isSubmitting}
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Awaiting">Awaiting</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={users || []}
                getOptionLabel={option =>
                  option.email
                    ? `${option.name} (${option.email})`
                    : option.name
                }
                value={
                  formData.assignedTo
                    ? users?.find(u => u._id === formData.assignedTo) || null
                    : null
                }
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    assignedTo: newValue?._id || null,
                  }));
                  setError(null);
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Assigned To"
                    variant="standard"
                    helperText="Optional"
                    disabled={isSubmitting}
                  />
                )}
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
