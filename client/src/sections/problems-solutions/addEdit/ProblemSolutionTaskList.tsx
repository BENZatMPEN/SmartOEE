import { Box, Button, Divider, Grid, MenuItem, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChangeEvent, useContext } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { RoleAction, RoleSubject } from '../../../@types/role';
import { User } from '../../../@types/user';
import { AbilityContext } from '../../../caslContext';
import { RHFSelect, RHFTextField } from '../../../components/hook-form';
import { RHFDatePicker } from '../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import {
  PS_PROCESS_STATUS_APPROVED,
  PS_PROCESS_STATUS_COMPLETED,
  PS_PROCESS_STATUS_ON_PROCESS,
  PS_PROCESS_STATUS_WAITING,
} from '../../../constants';
import { fPsProcessStatusText } from '../../../utils/textHelper';
import { ProblemSolutionFormValuesProps } from './ProblemSolutionForm';

interface Props {
  users: User[];
  onDeleteTask: (taskId: number | null) => void;
}

export default function ProblemSolutionTaskList({ users, onDeleteTask }: Props) {
  const theme = useTheme();

  const ability = useContext(AbilityContext);

  const statusOpts = ability.can(RoleAction.Approve, RoleSubject.ProblemsAndSolutions)
    ? [PS_PROCESS_STATUS_ON_PROCESS, PS_PROCESS_STATUS_WAITING, PS_PROCESS_STATUS_COMPLETED, PS_PROCESS_STATUS_APPROVED]
    : [PS_PROCESS_STATUS_ON_PROCESS, PS_PROCESS_STATUS_WAITING, PS_PROCESS_STATUS_COMPLETED];

  const { control, getValues, watch } = useFormContext<ProblemSolutionFormValuesProps>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'tasks',
  });

  const values = watch('tasks');

  const handleAdd = () => {
    append({
      id: null,
      title: '',
      assigneeUserId: -1,
      startDate: new Date(),
      endDate: new Date(),
      status: PS_PROCESS_STATUS_ON_PROCESS,
      comment: '',
      attachments: [],
      files: [],
      addingFiles: [],
      deletingFiles: [],
      order: 0,
    });
  };

  const handleRemove = (index: number) => {
    const tasks = getValues('tasks');
    if (tasks[index].id) {
      onDeleteTask(tasks[index].id);
    }
    remove(index);
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    if (!event?.target.files) {
      return;
    }

    const tasks = getValues('tasks');
    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (tasks[index].addingFiles.filter((addingFile) => addingFile.name === file.name).length === 0) {
        tasks[index].addingFiles.push(file);
        tasks[index].files.push(file.name);
      }
    }

    update(index, tasks[index]);
  };

  const handleFileDeleted = (index: number, fileName: string) => {
    const tasks = getValues('tasks');
    // filter deleting attachments
    const deletingAttachments = tasks[index].attachments.filter((item) => item.attachment.name === fileName);
    tasks[index].attachments = tasks[index].attachments.filter((item) => item.attachment.name !== fileName);
    tasks[index].deletingFiles = [
      ...tasks[index].deletingFiles,
      ...deletingAttachments.map((item) => item.attachmentId),
    ];

    // remove adding files
    tasks[index].addingFiles = tasks[index].addingFiles.filter((item) => item.name !== fileName);

    // remove displaying files
    tasks[index].files = tasks[index].files.filter((item) => item !== fileName);
    update(index, tasks[index]);
  };

  return (
    <Box sx={{ pt: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ color: 'text.disabled' }}>
              Assignment
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flexShrink: 0 }}>
              <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleAdd}>
                Add new task
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />} spacing={3}>
        {fields.map((item, index) => (
          <Box key={item.id}>
            <Grid container spacing={2}>
              <Grid item xs={1}>
                <RHFTextField
                  size="small"
                  type="number"
                  name={`tasks[${index}].order`}
                  label="Order"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={4}>
                <RHFTextField
                  size="small"
                  type="text"
                  name={`tasks[${index}].title`}
                  label="Title"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={3}>
                <RHFSelect
                  name={`tasks[${index}].assigneeUserId`}
                  label="Assignee"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                >
                  <MenuItem
                    value={-1}
                    sx={{
                      mx: 1,
                      borderRadius: 0.75,
                      typography: 'body2',
                      fontStyle: 'italic',
                      color: 'text.secondary',
                    }}
                  >
                    None
                  </MenuItem>

                  <Divider />

                  {users.map((user) => (
                    <MenuItem
                      key={user.id}
                      value={user.id}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                        textTransform: 'capitalize',
                      }}
                    >
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              <Grid item xs={2}>
                <RHFDatePicker name={`tasks[${index}].startDate`} label="Start Date" size="small" />
              </Grid>

              <Grid item xs={2}>
                <RHFDatePicker name={`tasks[${index}].endDate`} label="End Date" size="small" />
              </Grid>

              <Grid item xs={10}>
                <RHFTextField
                  size="small"
                  type="text"
                  multiline={true}
                  rows={2}
                  name={`tasks[${index}].comment`}
                  label="Comment"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={2}>
                <RHFSelect
                  name={`tasks[${index}].status`}
                  label="Flow Status"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                >
                  {statusOpts.map((option) => (
                    <MenuItem
                      key={option}
                      value={option}
                      sx={{
                        mx: 1,
                        my: 0.5,
                        borderRadius: 0.75,
                        typography: 'body2',
                      }}
                    >
                      {fPsProcessStatusText(option)}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Grid>

              {values[index].files.length !== 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', py: 1 }}>
                    {values[index].files.map((file, fileIndex) => (
                      <Label
                        key={file}
                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                        color={'default'}
                        fontSize={'0.8rem'}
                        sx={{ py: 1.8 }}
                      >
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Iconify icon="eva:attach-fill" fontSize={'1rem'} />
                          {file}
                          <Iconify
                            icon="eva:close-fill"
                            fontSize={'1rem'}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => handleFileDeleted(index, file)}
                          />
                        </Box>
                      </Label>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2, gap: 1 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '700',
                  fontSize: '0.8125rem',
                  backgroundColor: 'transparent',
                  padding: '4px 5px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                <Iconify icon="eva:attach-2-fill" fontSize={'18px'} sx={{ marginRight: '6px' }} />
                <input
                  type="file"
                  multiple
                  accept="image/*,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf"
                  onChange={(event) => handleFilesSelected(event, index)}
                  style={{ display: 'none' }}
                />
                Attachments
              </label>
              <Button
                size="small"
                color="error"
                startIcon={<Iconify icon="eva:trash-2-outline" />}
                onClick={() => handleRemove(index)}
              >
                Remove
              </Button>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
