import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import type { Id } from '../../convex/_generated/dataModel';

type User = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  email?: string;
  externalId: string;
  tokenIdentifier: string;
};

type CreateMachineArgs = {
  name: string;
  make: string;
  model: string;
  serialNumber?: string;
  type: 'Laptop' | 'Desktop' | 'Server';
  ramGb: number;
  storageCapacityGb: number;
  storageType: 'SSD' | 'HDD';
  graphicsCardName: string;
  processorName: string;
  assignedToUserId?: Id<'users'>;
  status:
    | 'Available'
    | 'Assigned'
    | 'In Use'
    | 'Maintenance'
    | 'Retired'
    | 'Decommissioned'
    | 'Lost';
};

interface AddMachineDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: CreateMachineArgs) => Promise<void>;
  users?: User[];
  isSubmitting?: boolean;
}

export default function AddMachineDialog({
  open,
  onClose,
  onSubmit,
  users,
  isSubmitting = false,
}: AddMachineDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    make: '',
    model: '',
    serialNumber: '',
    type: 'Laptop' as 'Laptop' | 'Desktop' | 'Server',
    ramGb: '',
    storageCapacityGb: '',
    storageType: 'SSD' as 'SSD' | 'HDD',
    graphicsCardName: '',
    processorName: '',
    assignedToUserId: null as Id<'users'> | null,
    status: 'Available' as
      | 'Available'
      | 'Assigned'
      | 'In Use'
      | 'Maintenance'
      | 'Retired'
      | 'Decommissioned'
      | 'Lost',
  });
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        make: '',
        model: '',
        serialNumber: '',
        type: 'Laptop',
        ramGb: '',
        storageCapacityGb: '',
        storageType: 'SSD',
        graphicsCardName: '',
        processorName: '',
        assignedToUserId: null,
        status: 'Available',
      });
      setError(null);
    }
  }, [open]);

  const handleClose = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      serialNumber: '',
      type: 'Laptop',
      ramGb: '',
      storageCapacityGb: '',
      storageType: 'SSD',
      graphicsCardName: '',
      processorName: '',
      assignedToUserId: null,
      status: 'Available',
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
    if (
      !formData.name.trim() ||
      !formData.make.trim() ||
      !formData.model.trim() ||
      !formData.type ||
      !formData.ramGb.trim() ||
      !formData.storageCapacityGb.trim() ||
      !formData.graphicsCardName.trim() ||
      !formData.processorName.trim()
    ) {
      setError('All required fields must be filled');
      return;
    }

    // Parse numeric values
    const ramGb = parseFloat(formData.ramGb);
    const storageCapacityGb = parseFloat(formData.storageCapacityGb);

    // Validate numeric values
    if (
      isNaN(ramGb) ||
      isNaN(storageCapacityGb) ||
      ramGb <= 0 ||
      storageCapacityGb <= 0
    ) {
      setError('Please enter valid positive numbers');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: formData.name.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim() || undefined,
        type: formData.type,
        ramGb,
        storageCapacityGb,
        storageType: formData.storageType,
        graphicsCardName: formData.graphicsCardName.trim(),
        processorName: formData.processorName.trim(),
        assignedToUserId: formData.assignedToUserId || undefined,
        status: formData.status,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create machine');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Machine</DialogTitle>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Make"
                fullWidth
                variant="standard"
                value={formData.make}
                onChange={handleChange('make')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Model"
                fullWidth
                variant="standard"
                value={formData.model}
                onChange={handleChange('model')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Serial Number"
                fullWidth
                variant="standard"
                value={formData.serialNumber}
                onChange={handleChange('serialNumber')}
                disabled={isSubmitting}
                helperText="Optional"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Type"
                fullWidth
                variant="standard"
                value={formData.type}
                onChange={handleChange('type')}
                disabled={isSubmitting}
                required
              >
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Desktop">Desktop</MenuItem>
                <MenuItem value="Server">Server</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="RAM (GB)"
                fullWidth
                variant="standard"
                type="number"
                value={formData.ramGb}
                onChange={handleChange('ramGb')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Storage Capacity (GB)"
                fullWidth
                variant="standard"
                type="number"
                value={formData.storageCapacityGb}
                onChange={handleChange('storageCapacityGb')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Storage Type"
                fullWidth
                variant="standard"
                value={formData.storageType}
                onChange={handleChange('storageType')}
                disabled={isSubmitting}
              >
                <MenuItem value="SSD">SSD</MenuItem>
                <MenuItem value="HDD">HDD</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Graphics Card"
                fullWidth
                variant="standard"
                value={formData.graphicsCardName}
                onChange={handleChange('graphicsCardName')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Processor"
                fullWidth
                variant="standard"
                value={formData.processorName}
                onChange={handleChange('processorName')}
                disabled={isSubmitting}
                required
              />
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
                  formData.assignedToUserId
                    ? users?.find(u => u._id === formData.assignedToUserId) ||
                      null
                    : null
                }
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    assignedToUserId: newValue?._id || null,
                  }));
                  setError(null);
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Assigned To User"
                    variant="standard"
                    helperText="Optional"
                    disabled={isSubmitting}
                  />
                )}
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
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Use">In Use</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
                <MenuItem value="Decommissioned">Decommissioned</MenuItem>
                <MenuItem value="Lost">Lost</MenuItem>
              </TextField>
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
