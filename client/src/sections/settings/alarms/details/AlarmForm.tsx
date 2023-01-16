import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { AlarmEmailDataItem, AlarmLineData, EditAlarm, initAlarmCondition } from '../../../../@types/alarm';
import { Oee } from '../../../../@types/oee';
import { OptionItem } from '../../../../@types/option';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE } from '../../../../constants';
import { createAlarm, updateAlarm } from '../../../../redux/actions/alarmAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getAlarmType } from '../../../../utils/formatText';

interface FormValuesProps extends EditAlarm {
  emails: AlarmEmailDataItem[];
  line: AlarmLineData;
}

type Props = {
  isEdit: boolean;
};

const initLineData = {
  token: '',
};

export default function AlarmForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentAlarm, saveError } = useSelector((state: RootState) => state.alarm);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [oeeOpts, setOeeOpts] = useState<OptionItem[]>([]);

  useEffect(() => {
    axios
      .get<Oee[]>(`/oees/all`)
      .then((response) => {
        const { data: oees } = response;
        setOeeOpts(
          oees.map((oee) => ({
            id: oee.id,
            name: oee.productionName,
          })),
        );
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      setOeeOpts([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const NewAlarmSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    emails: Yup.array().when('type', {
      is: ALARM_TYPE_EMAIL,
      then: Yup.array().of(
        Yup.object().shape({
          name: Yup.string().required(),
          email: Yup.string().required(),
        }),
      ),
    }),
    line: Yup.object().when('type', {
      is: ALARM_TYPE_LINE,
      then: Yup.object().shape({
        token: Yup.string().required(),
      }),
    }),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewAlarmSchema),
    defaultValues: {
      name: '',
      type: ALARM_TYPE_EMAIL,
      notify: true,
      emails: [],
      line: initLineData,
      condition: initAlarmCondition,
    },
    values: {
      name: currentAlarm?.name || '',
      type: currentAlarm?.type || ALARM_TYPE_EMAIL,
      notify: currentAlarm ? currentAlarm.notify : true,
      emails: currentAlarm
        ? currentAlarm.type === ALARM_TYPE_EMAIL
          ? (currentAlarm.data as AlarmEmailDataItem[])
          : []
        : [],
      line: currentAlarm
        ? currentAlarm.type === ALARM_TYPE_LINE
          ? (currentAlarm.data as AlarmLineData)
          : initLineData
        : initLineData,
      condition: currentAlarm ? currentAlarm.condition : initAlarmCondition,
      data: null,
    },
  });

  const {
    watch,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    const { emails, line, ...dto } = data;
    if (dto.type === ALARM_TYPE_EMAIL) {
      dto.data = emails;
    } else if (dto.type === ALARM_TYPE_LINE) {
      dto.data = line;
    }

    const alarm =
      isEdit && currentAlarm ? await dispatch(updateAlarm(currentAlarm.id, dto)) : await dispatch(createAlarm(dto));

    if (alarm) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.alarms.root);
    }
  };

  useEffect(() => {
    if (saveError) {
      if (saveError instanceof AxiosError) {
        if ('message' in saveError.response?.data) {
          if (Array.isArray(saveError.response?.data.message)) {
            for (const item of saveError.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(saveError.response?.data.message, { variant: 'error' });
          }
        }
      } else {
        enqueueSnackbar(saveError.response?.data.error, { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, saveError]);

  const onTypeChanged = (type: string) => {
    setValue('type', type);
  };

  const handleEmailAdd = (): void => {
    const emails = getValues('emails');
    emails.push({ name: '', email: '' });
    setValue('emails', emails);
  };

  const handleEmailRemove = (index: number): void => {
    const emails = getValues('emails');
    emails.splice(index, 1);
    setValue('emails', emails);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Alarm' : 'Edit Alarm'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Alarms',
                href: PATH_SETTINGS.alarms.root,
              },
              { name: isEdit ? 'Edit' : 'Create' },
            ]}
          />
        }
        action={
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
            startIcon={<Iconify icon="eva:save-fill" />}
          >
            {!isEdit ? 'Create' : 'Save'}
          </LoadingButton>
        }
        cancel={
          <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.alarms.root}>
            Cancel
          </Button>
        }
      />

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid item md={8}>
            <Stack spacing={3}>
              <RHFTextField name="name" label="Name" fullWidth />
            </Stack>
          </Grid>

          <Grid item md={2}>
            <RHFSelect
              name="type"
              label="Type"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              onChange={(event) => onTypeChanged(event.target.value)}
            >
              <MenuItem
                value={ALARM_TYPE_EMAIL}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body1',
                }}
              >
                {getAlarmType(ALARM_TYPE_EMAIL)}
              </MenuItem>

              <MenuItem
                value={ALARM_TYPE_LINE}
                sx={{
                  mx: 1,
                  my: 0.5,
                  borderRadius: 0.75,
                  typography: 'body1',
                }}
              >
                {getAlarmType(ALARM_TYPE_LINE)}
              </MenuItem>
            </RHFSelect>
          </Grid>

          <Grid item md={2}>
            <RHFSwitch name="notify" label="Notify" />
          </Grid>

          <Grid item md={12}>
            <RHFSelect
              name="oees"
              label="Productions"
              fullWidth
              SelectProps={{
                native: false,
                multiple: true,
                value: values.condition?.oees || [],
                renderValue: (selected: any) => (
                  <>
                    {oeeOpts
                      .filter((item) => selected.indexOf(item.id) > -1)
                      .map((item) => item.name)
                      .join(', ')}
                  </>
                ),
              }}
            >
              {oeeOpts.map((item) => (
                <MenuItem
                  key={item.id}
                  value={item.id}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body2',
                  }}
                >
                  <Checkbox checked={(values.condition?.oees || []).indexOf(item.id) > -1} />
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>

          <Grid item md={12}>
            <Card>
              <CardHeader title="When to Notify" />
              <CardContent>
                <Stack direction="row">
                  <RHFSwitch name="condition.aParams" label="Breakdown" />

                  <RHFSwitch name="condition.pParams" label="Minor Loss" />

                  <RHFSwitch name="condition.qParams" label="No Good" />

                  <RHFSwitch name="condition.oeeLow" label="Low OEE" />

                  <RHFSwitch name="condition.aLow" label="Low Availability" />

                  <RHFSwitch name="condition.pLow" label="Low Performance" />

                  <RHFSwitch name="condition.qLow" label="Low Quality" />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {values.type === ALARM_TYPE_EMAIL && (
          <Box>
            <Typography variant="h6" sx={{ pb: 3, color: 'text.disabled' }}>
              Emails
            </Typography>

            <Stack spacing={3}>
              {values.emails.map((item, index) => (
                <Box key={index}>
                  <Grid container spacing={3}>
                    <Grid item md={5}>
                      <RHFTextField
                        size="small"
                        name={`emails[${index}].name`}
                        label="Name"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item md={6}>
                      <RHFTextField
                        size="small"
                        name={`emails[${index}].email`}
                        label="Email"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item md={1}>
                      <IconButton
                        size="medium"
                        color="error"
                        onClick={() => {
                          handleEmailRemove(index);
                        }}
                      >
                        <Iconify icon="eva:trash-2-outline" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Stack spacing={3} direction="row" justifyContent="right">
              <Button size={'medium'} startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleEmailAdd}>
                Add Email
              </Button>
            </Stack>
          </Box>
        )}

        {values.type === ALARM_TYPE_LINE && <RHFTextField name="line.token" label="Line Token" fullWidth />}
      </Stack>
    </FormProvider>
  );
}
