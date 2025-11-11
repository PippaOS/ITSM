import * as React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Notes from './Notes';
import Tags from './Tags';

interface NotesAndTagsProps {
  entityTable: string;
  entityId: string;
}

export default function NotesAndTags({
  entityTable,
  entityId,
}: NotesAndTagsProps) {
  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Notes" sx={{ textTransform: 'none' }} />
          <Tab label="Tags" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2 }}>
        {value === 0 && <Notes entityTable={entityTable} entityId={entityId} />}
        {value === 1 && <Tags entityTable={entityTable} entityId={entityId} />}
      </Box>
    </Box>
  );
}
