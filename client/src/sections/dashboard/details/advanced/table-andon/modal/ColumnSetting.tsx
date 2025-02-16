import React, { useEffect, useState } from 'react';
import { Modal, Box, IconButton, TextField, Button } from '@mui/material';
import { Visibility, VisibilityOff, Save } from '@mui/icons-material';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import Iconify from 'src/components/Iconify';

interface Column {
  siteId: number;
  id: number;
  columnName: string;
  columnValue: string;
  columnOrder: number;
  deleted: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  columns: Column[] | undefined;
  onSave: (columns: Column[]) => void;
}

const ColumnSettingsModal = ({ open, onClose, columns, onSave }: Props) => {

  const [localColumns, setLocalColumns] = useState<Column[] | undefined>([]);

  const handleEdit = (id: number, newValue: string) => {
    setLocalColumns((prev) => prev?.map((col) => (col.id === id ? { ...col, columnName: newValue } : col)));
  };

  const toggleVisibility = (id: number) => {
    setLocalColumns((prev) => prev?.map((col) => (col.id === id ? { ...col, deleted: !col.deleted } : col)));
  };

  const handleLayoutChange = (newLayout: any[]) => {
   
    const sortedLayout = [...newLayout].sort((a, b) => a.y - b.y);

    const updatedColumns = sortedLayout
        .map((item, index) => {
            const column = localColumns?.find(col => col.id === parseInt(item.i));
            if (!column) return null;
            return { ...column, columnOrder: index + 1 };
        })
        .filter(Boolean) as Column[];

   
    setLocalColumns(updatedColumns);
};

  const handleSave = () => {
    console.log(localColumns);
    
    onSave(localColumns ?? []);
    onClose();
  };

  useEffect(() => {
    setLocalColumns(columns);
  }, [columns])
  

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <GridLayout
          className="layout"
          layout={localColumns?.map((col) => ({
            i: col.id.toString(),
            x: 0,
            y: col.columnOrder - 1,
            w: 1,
            h: 1,
          }))}
          cols={1}
          rowHeight={50}
          width={300}
          onLayoutChange={handleLayoutChange}
          isResizable={false}
          draggableHandle=".drag-handle"
        >
          {localColumns?.map((col) => (
            <div
            key={col.id}
            data-grid={{ i: col.id.toString(), x: 0, y: col.columnOrder - 1, w: 1, h: 1, isResizable: false }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
              <IconButton className="drag-handle"><Iconify icon="eva:move-fill" /></IconButton>
      
              <TextField
                size="small"
                value={col.columnName}
                onChange={(e) => handleEdit(col.id, e.target.value)}
                fullWidth
              />
      
              <IconButton onClick={() => toggleVisibility(col.id)}>
                {col.deleted ? <Iconify icon="eva:eye-off-outline" /> : <Iconify icon="eva:eye-outline" />}
              </IconButton>
            </Box>
          </div>
          ))}
        </GridLayout>
        <Button startIcon={<Save />} onClick={handleSave} variant="contained" fullWidth sx={{ mt: 2 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default ColumnSettingsModal;
