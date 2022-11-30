import { Box, Button, Divider, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { ChangeEvent } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { ProblemSolutionTask } from '../../../@types/problemSolution';
import { User } from '../../../@types/user';
import { RHFSelect, RHFTextField } from '../../../components/hook-form';
import Iconify from '../../../components/Iconify';
import Label from '../../../components/Label';
import { PS_PROCESS_STATUS, PS_PROCESS_STATUS_ON_PROCESS } from '../../../constants';
import { getPsProcessStatusText } from '../../../utils/formatText';

interface IProps {
  users: User[];
}

export default function ProblemSolutionTaskList({ users }: IProps) {
  const theme = useTheme();

  const { control, setValue, watch } = useFormContext();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'tasks',
  });

  const values = watch('tasks') as ProblemSolutionTask[];

  const handleAdd = () => {
    append({
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
    });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleFilesSelected = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    if (!event?.target.files) {
      return;
    }

    for (let i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (values[index].addingFiles.filter((addingFile) => addingFile.name === file.name).length === 0) {
        values[index].addingFiles.push(file);
        values[index].files.push(file.name);
      }
    }

    update(index, values[index]);
  };

  const handleFileDeleted = (index: number, fileName: string) => {
    // filter deleting attachments
    const deletingAttachments = values[index].attachments.filter((item) => item.attachment.name === fileName);
    values[index].attachments = values[index].attachments.filter((item) => item.attachment.name !== fileName);
    values[index].deletingFiles = [
      ...values[index].deletingFiles,
      ...deletingAttachments.map((item) => item.attachmentId),
    ];

    // remove adding files
    values[index].addingFiles = values[index].addingFiles.filter((item) => item.name !== fileName);

    // remove displaying files
    values[index].files = values[index].files.filter((item) => item !== fileName);
    update(index, values[index]);
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
              <Grid item xs={4}>
                <RHFTextField
                  size="small"
                  type="text"
                  name={`tasks[${index}].title`}
                  label="Title"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={4}>
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
                <Controller
                  name={`tasks[${index}].startDate`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="Start Date"
                      value={field.value}
                      onChange={(newValue: any) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params: any) => (
                        <TextField {...params} size="small" fullWidth error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={2}>
                <Controller
                  name={`tasks[${index}].endDate`}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      label="End Date"
                      value={field.value}
                      onChange={(newValue: any) => {
                        field.onChange(newValue);
                      }}
                      renderInput={(params: any) => (
                        <TextField {...params} size="small" fullWidth error={!!error} helperText={error?.message} />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={10}>
                <RHFTextField
                  size="small"
                  type="text"
                  name={`tasks[${index}].comment`}
                  label="Comment"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={2}>
                <RHFSelect
                  name={`tasks[${index}].status`}
                  label="Status"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{ native: false }}
                >
                  {PS_PROCESS_STATUS.map((option) => (
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
                      {getPsProcessStatusText(option)}
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
