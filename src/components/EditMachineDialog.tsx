import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete, {
  type AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import type { Id } from '../../convex/_generated/dataModel';

type Machine = {
  _id: Id<'machines'>;
  _creationTime: number;
  name: string;
  make: string;
  model: string;
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

type User = {
  _id: Id<'users'>;
  _creationTime: number;
  name: string;
  email?: string;
  externalId: string;
  tokenIdentifier: string;
};

type UpdateMachineArgs = {
  machineId: Id<'machines'>;
  name: string;
  make: string;
  model: string;
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

interface EditMachineDialogProps {
  machineId: Id<'machines'>;
  machine: Machine;
  users?: User[];
  updateMachine: (args: UpdateMachineArgs) => Promise<void>;
  open: boolean;
  onClose: () => void;
}

export function EditMachineDialog({
  machineId,
  machine,
  users,
  updateMachine,
  open,
  onClose,
}: EditMachineDialogProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    make: '',
    model: '',
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
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setFormData({
        name: machine.name,
        make: machine.make,
        model: machine.model,
        type: machine.type,
        ramGb: machine.ramGb.toString(),
        storageCapacityGb: machine.storageCapacityGb.toString(),
        storageType: machine.storageType,
        graphicsCardName: machine.graphicsCardName,
        processorName: machine.processorName,
        assignedToUserId: machine.assignedToUserId || null,
        status: machine.status,
      });
      setError(null);
    }
  }, [open, machine]);

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

    const ramGb = parseFloat(formData.ramGb);
    const storageCapacityGb = parseFloat(formData.storageCapacityGb);

    if (
      isNaN(ramGb) ||
      isNaN(storageCapacityGb) ||
      ramGb <= 0 ||
      storageCapacityGb <= 0
    ) {
      setError('Please enter valid positive numbers');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateMachine({
        machineId,
        name: formData.name.trim(),
        make: formData.make.trim(),
        model: formData.model.trim(),
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
      setError(err instanceof Error ? err.message : 'Failed to update machine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Machine</DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Basic Information
              </Typography>
            </Grid>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Make"
                fullWidth
                variant="outlined"
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
                variant="outlined"
                value={formData.model}
                onChange={handleChange('model')}
                disabled={isSubmitting}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Type"
                fullWidth
                variant="outlined"
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
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Hardware Specifications
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="RAM (GB)"
                fullWidth
                variant="outlined"
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
                variant="outlined"
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
                variant="outlined"
                value={formData.storageType}
                onChange={handleChange('storageType')}
                disabled={isSubmitting}
              >
                <MenuItem value="SSD">SSD</MenuItem>
                <MenuItem value="HDD">HDD</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Components
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Graphics Card"
                fullWidth
                variant="outlined"
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
                variant="outlined"
                value={formData.processorName}
                onChange={handleChange('processorName')}
                disabled={isSubmitting}
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Assignment & Status
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={users || []}
                getOptionLabel={(option: User) =>
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
                onChange={(_: unknown, newValue: User | null) => {
                  setFormData(prev => ({
                    ...prev,
                    assignedToUserId: newValue?._id || null,
                  }));
                  setError(null);
                }}
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    {...params}
                    label="Assigned To User"
                    variant="outlined"
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
                variant="outlined"
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

interface EditMachineButtonProps {
  onClick: () => void;
}

export function EditMachineButton({ onClick }: EditMachineButtonProps) {
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
