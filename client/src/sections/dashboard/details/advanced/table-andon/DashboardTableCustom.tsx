import React, { useState } from "react";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Checkbox,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// 📌 Mock Data
const rows = [
  { id: 1, group: "Group1", machine: "OEE1", product: "PD1", status: "Running", output: 60000, oee: "62%", a: "77%", p: "85%", q: "95%", target: 60152, plan: 100000 },
  { id: 2, group: "Group1", machine: "OEE2", product: "PD2", status: "Breakdown", output: 40560, oee: "69%", a: "82%", p: "89%", q: "94%", target: 41500, plan: 70000 },
  { id: 3, group: "Group1", machine: "OEE3", product: "PD3", status: "Running", output: 4240, oee: "62%", a: "77%", p: "85%", q: "95%", target: 4300, plan: 58000 },
  { id: 4, group: "Group1", machine: "OEE4", product: "PD4", status: "No Plan", output: null, oee: null, a: null, p: null, q: null, target: null, plan: null },
  { id: 5, group: "Group1", machine: "OEE5", product: "PD5", status: "Running", output: 7752, oee: "62%", a: "77%", p: "85%", q: "95%", target: 7800, plan: 85000 },
  { id: 6, group: "Group1", machine: "OEE6", product: "PD6", status: "No Plan", output: null, oee: null, a: null, p: null, q: null, target: null, plan: null },
];

// 📌 Column Definitions
const initialColumns: GridColDef[] = [
  { field: "group", headerName: "Group", flex: 1, minWidth: 100 },
  { field: "machine", headerName: "Machine", flex: 1, minWidth: 100 },
  { field: "product", headerName: "Product", flex: 1, minWidth: 100 },
  { field: "status", headerName: "Status", flex: 1, minWidth: 120 , renderCell: (params) => {
    const status = params.value;
    let color = "inherit";
    if (status === "Running") color = "green";
    if (status === "Breakdown") color = "red";
    if (status === "No Plan") color = "gray";

    return (
      <Typography variant="body2" style={{ color, fontWeight: "bold" }}>
        {status}
      </Typography>
    );
  }, },
  { field: "output", headerName: "Output", flex: 1, minWidth: 100 },
  { field: "oee", headerName: "OEE", flex: 1, minWidth: 80 },
  { field: "a", headerName: "A", flex: 1, minWidth: 80 },
  { field: "p", headerName: "P", flex: 1, minWidth: 80 },
  { field: "q", headerName: "Q", flex: 1, minWidth: 80 },
  { field: "target", headerName: "Target", flex: 1, minWidth: 100 },
  { field: "plan", headerName: "Plan", flex: 1, minWidth: 100 },
];

const DashboardTableCustom: React.FC = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [dialogOpen, setDialogOpen] = useState(false);

  // 📌 ฟังก์ชันสำหรับแก้ไขชื่อคอลัมน์
  const handleEditColumnName = (field: string, newName: string) => {
    setColumns(
      columns.map((col) =>
        col.field === field ? { ...col, headerName: newName } : col
      )
    );
  };

  // 📌 ฟังก์ชันสำหรับซ่อน/แสดงคอลัมน์
  const handleToggleColumnVisibility = (field: string) => {
    setColumns(
      columns.map((col:any) =>
        col.field === field ? { ...col, hide: !col.hide } : col
      )
    );
  };

  // 📌 ฟังก์ชันสำหรับเลื่อนลำดับคอลัมน์
  const moveColumn = (index: number, direction: "left" | "right") => {
    const newColumns = [...columns];
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    // เลื่อนคอลัมน์เฉพาะในขอบเขต
    if (targetIndex >= 0 && targetIndex < newColumns.length) {
      const [movedColumn] = newColumns.splice(index, 1);
      newColumns.splice(targetIndex, 0, movedColumn);
      setColumns(newColumns);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* DataGrid */}
      <DataGrid
        rows={rows}
        columns={columns.filter((col:any) => !col.hide)}
        pageSizeOptions={[5]}
        disableRowSelectionOnClick
        autoHeight
        sx={{width:'100%'}}
      />

      {/* Settings Button */}
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => setDialogOpen(true)}
      >
        Settings
      </Button>

      {/* Settings Modal */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xl">
        <DialogTitle>Manage Columns</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              overflowX: "auto",
              gap: 2,
              padding: "10px",
            }}
          >
            {columns.map((col:any, index) => (
              <Box
                key={col.field}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "8px",
                  minWidth: "150px",
                }}
              >
                {/* <Checkbox
                  checked={!col.hide}
                  onChange={() => handleToggleColumnVisibility(col.field)}
                /> */}
                <TextField
                  value={col.headerName}
                  onChange={(e) =>
                    handleEditColumnName(col.field, e.target.value)
                  }
                  size="small"
                  variant="outlined"
                  sx={{ marginBottom: "8px", textAlign: "center" }}
                />
                <Box>
                  <IconButton
                    onClick={() => moveColumn(index, "left")}
                    disabled={index === 0} 
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => moveColumn(index, "right")}
                    disabled={index === columns.length - 1} 
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardTableCustom;
