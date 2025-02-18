import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { AndonColumns, AndonGroupAdvancedItem, AndonStatusAdvancedItem, updateColumnsReq } from 'src/@types/oee';
import Scrollbar from 'src/components/Scrollbar';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import ColumnSettingsModal from './modal/ColumnSetting';
import { RootState, useDispatch, useSelector } from 'src/redux/store';
import { getAndonStatus, updateColumns } from 'src/redux/actions/oeeAdvancedAction';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';

const ResponsiveGridLayout = WidthProvider(Responsive);

type Props = {
  userId?: number;
  valueForm: {
    startDateTime: Date;
    endDateTime: Date;
    isStreaming: boolean;
  };
};
type Column = {
  id: string;
  label: string;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Running':
      return { backgroundColor: 'green', color: 'white', fontWeight: 'bold', textAlign: 'center' };
    case 'Breakdown':
      return { backgroundColor: 'red', color: 'white', fontWeight: 'bold', textAlign: 'center' };
    case 'No Plan':
      return { backgroundColor: 'gray', color: 'white', fontWeight: 'bold', textAlign: 'center' };
    default:
      return {};
  }
};
const DashboardTableAndon = ({ valueForm, userId }: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { oeeStatus, isLoading } = useSelector((state: RootState) => state.oeeAdvanced);
  const { columns, oeeGroups } = oeeStatus;
  const [columnsDefault, setColumnsDefault] = useState<AndonStatusAdvancedItem[] | undefined>(columns);
  const [modalOpen, setModalOpen] = useState(false);
  const saveColumnsChange = async (updatedColumns: AndonStatusAdvancedItem[]) => {
    const body: updateColumnsReq = {
      siteId: updatedColumns[0].siteId,
      andonColumns: [],
    };
    updatedColumns.forEach((element) => {
      const map: AndonColumns = {
        id: element.id,
        columnName: element.columnName,
        columnValue: element.columnValue,
        columnOrder: element.columnOrder,
        deleted: element.deleted,
      };
      body.andonColumns.push(map);
    });

    const core = await dispatch(updateColumns(body));

    if (core !== null) {
      if (userId) {
        await dispatch(
          getAndonStatus(
            userId,
            dayjs(valueForm.startDateTime).format('YYYY-MM-DD HH:mm:ss'),
            dayjs(valueForm.endDateTime).format('YYYY-MM-DD HH:mm:ss'),
          ),
        );
        enqueueSnackbar('Update columns success.', {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        })
      }
    }

  };
  return (
    <Scrollbar>
      <Button variant="contained" onClick={() => setModalOpen(true)} sx={{ mb: 2 }}>
        Edit Columns
      </Button>
      <TableContainer sx={{ minWidth: 800 }}>
        <Table size={'medium'}>
          <TableHead>
            <TableRow>
              <TableCell key={'group'}>Group</TableCell>
              {columns &&
                columns.length > 0 &&
                columns?.map((item) => {
                  return <TableCell key={item.columnValue}>{item.columnName}</TableCell>;
                })}
            </TableRow>
          </TableHead>
          <TableBody>
            {oeeGroups &&
              oeeGroups?.length > 0 &&
              oeeGroups.map((detail) => {
                return (
                  <React.Fragment key={detail.groupName}>
                    {detail.oees.map((oee, index) => (
                      <TableRow key={oee.id} hover>
                        {index === 0 && (
                          <TableCell rowSpan={detail.oees.length} sx={{ fontWeight: 'bold' }}>
                            {detail.groupName}
                          </TableCell>
                        )}
                        <TableCell>{oee.oeeCode}</TableCell>
                        <TableCell>{oee.productionName || '-'}</TableCell>
                        <TableCell sx={getStatusStyle(oee.batchStatus)}>{oee.batchStatus || '-'}</TableCell>
                        <TableCell>{oee.actual.toLocaleString()}</TableCell>
                        <TableCell>{oee.oeePercent.toFixed(2)}%</TableCell>
                        <TableCell>{oee.aPercent.toFixed(2)}%</TableCell>
                        <TableCell>{oee.pPercent.toFixed(2)}%</TableCell>
                        <TableCell>{oee.qPercent.toFixed(2)}%</TableCell>
                        <TableCell>{oee.target.toLocaleString()}</TableCell>
                        <TableCell>{oee.plan.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <ColumnSettingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        columns={columns}
        onSave={(updatedColumns) => saveColumnsChange(updatedColumns)}
      />
    </Scrollbar>
  );
};

export default DashboardTableAndon;
