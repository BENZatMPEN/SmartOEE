import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
import { useFieldArray, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import {
  AlarmCondition,
  AlarmEmailDataItem,
  AlarmLineData,
  EditAlarm,
  initAlarmCondition,
} from '../../../../@types/alarm';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE } from '../../../../constants';
import { createAlarm, updateAlarm } from '../../../../redux/actions/alarmAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { getAlarmType } from '../../../../utils/formatText';
import OeeSelect from './OeeSelect';

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

class FormState {
  constructor(isOeeOptionLoading: boolean) {
    this.isOeeOptionLoading = isOeeOptionLoading;
  }

  isOeeOptionLoading: boolean;

  isReady(): boolean {
    return !this.isOeeOptionLoading;
  }
}

export default function AlarmForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentAlarm, saveError } = useSelector((state: RootState) => state.alarm);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [formState, setFormState] = useState<FormState>(new FormState(true));

  const [formValues, setFormValues] = useState<FormValuesProps | undefined>(undefined);

  useEffect(() => {
    if (formState.isReady()) {
      setFormValues({
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
      });
    }
  }, [formState, currentAlarm]);

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
    values: formValues,
  });

  const {
    watch,
    control,
    getValues,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    try {
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
    } catch (error) {
      console.error(error);
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

  const handleOEEsSelected = (values: number[]): void => {
    const condition = getValues('condition') as AlarmCondition;
    setValue('condition', {
      ...condition,
      oees: values,
    });
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
            <OeeSelect
              name="oees"
              label="Productions"
              selectedValues={values.condition?.oees || []}
              onSelected={(selectedIds) => handleOEEsSelected(selectedIds)}
              onLoading={(isLoading) => {
                formState.isOeeOptionLoading = isLoading;
                setFormState(formState);
              }}
            />
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

          <Grid item md={4}>
            <Stack direction="row"></Stack>
          </Grid>
        </Grid>

        {values.type === ALARM_TYPE_EMAIL && (
          <Box>
            <Typography variant="h6" sx={{ pb: 3, color: 'text.disabled' }}>
              Emails
            </Typography>

            <Stack spacing={3}>
              {fields.map((item, index) => (
                <Box key={item.id}>
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
                          remove(index);
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
              <Button
                size={'medium'}
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => {
                  append({ name: '', email: '' });
                }}
              >
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
