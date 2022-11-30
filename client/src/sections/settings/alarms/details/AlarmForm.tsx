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
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Alarm, AlarmCondition, AlarmEmailDataItem, AlarmLineData, initAlarmCondition } from '../../../../@types/alarm';
import { Oee } from '../../../../@types/oee';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFSelect, RHFSwitch, RHFTextField } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { ALARM_TYPE_EMAIL, ALARM_TYPE_LINE } from '../../../../constants';
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getAlarmType } from '../../../../utils/formatText';

interface FormValuesProps extends Partial<Alarm> {
  emails: AlarmEmailDataItem[];
  line: AlarmLineData;
}

type Props = {
  isEdit: boolean;
  currentAlarm: Alarm | null;
};

const initLineData = {
  token: '',
};

type OptionItem = {
  id: number;
  name: string;
};

export default function AlarmForm({ isEdit, currentAlarm }: Props) {
  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.site);

  const { enqueueSnackbar } = useSnackbar();

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

  const defaultValues = useMemo(
    () => ({
      name: currentAlarm?.name || '',
      type: currentAlarm?.type || ALARM_TYPE_EMAIL,
      notify: currentAlarm ? currentAlarm.notify : true,
      siteId: currentAlarm?.siteId || selectedSite?.id,
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentAlarm],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewAlarmSchema),
    defaultValues,
  });

  const {
    reset,
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

  useEffect(() => {
    if (isEdit && currentAlarm) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentAlarm]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { emails, line, ...dto } = data;
      let alarm: Alarm;

      if (dto.type === ALARM_TYPE_EMAIL) {
        dto.data = emails;
      } else if (dto.type === ALARM_TYPE_LINE) {
        dto.data = line;
      }

      if (isEdit && currentAlarm) {
        await axios.put<Alarm>(`/alarms/${currentAlarm.id}`, dto);
      } else {
        await axios.post<Alarm>(`/alarms`, dto);
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.alarms.root);
    } catch (error) {
      console.error(error);
    }
  };

  const onTypeChanged = (type: string) => {
    setValue('type', type);
  };

  const [oeeOpts, setOeeOpts] = useState<OptionItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<Oee[]>(`/oees/all`);
        const { data: oees } = response;

        setOeeOpts(
          oees.map((oee) => ({
            id: oee.id,
            name: oee.productionName,
          })),
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

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
                onChange: (event) => {
                  handleOEEsSelected(event.target.value as number[]);
                },
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
