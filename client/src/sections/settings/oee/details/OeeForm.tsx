import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  Autocomplete,
  TextField,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import {
  EditOee,
  MachinePlanDownTime,
  OeeMachine,
  OeeProduct,
  OeeTag,
  ShiftWork,
  WorkShiftsDetail,
  WorkShiftsDetailAPIS,
} from '../../../../@types/oee';
import { User, UserPagedList } from '../../../../@types/user';
import { PercentSetting } from '../../../../@types/percentSetting';
import { EditorLabelStyle } from '../../../../components/EditorLabelStyle';
import FormHeader from '../../../../components/FormHeader';
import {
  FormProvider,
  RHFCheckbox,
  RHFEditor,
  RHFSelect,
  RHFTextField,
  RHFUploadSingleFile,
} from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import {
  initialOeeTags,
  initialPercentSettings,
  OEE_TYPE_OPTIONS,
  OEE_TYPE_STANDALONE,
  TIME_UNIT_OPTIONS,
} from '../../../../constants';
import useToggle from '../../../../hooks/useToggle';
import { createOee, updateOee } from '../../../../redux/actions/oeeAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { fOeeTabLabel, fOeeTypeText, fTimeUnitText } from '../../../../utils/textHelper';
import { getFileUrl } from '../../../../utils/imageHelper';
import { convertToUnit } from '../../../../utils/timeHelper';
import OeeMachineDialog from './OeeMachineDialog';
import OeeMachineTable from './OeeMachineTable';
import OeePercentSettings from './OeePercentSettings';
import OeeProductDialog from './OeeProductDialog';
import OeeProductTable from './OeeProductTable';
import OeeTagDialog from './OeeTagDialog';
import { OeeTagList } from './OeeTagList';
import { FilterUser } from '../../../../@types/user';
import axios from '../../../../utils/axios';

import OeeWorkScheduleDialog from './OeeWorkScheduleDialog';

import WorkShiftSchedule from './WorkShiftSchedule';
import dayjs from 'dayjs';

interface ValuesScheduleProps {
  workName: string;
}

type SelectedItem<T> = {
  index: number;
  item: T;
};

type Props = {
  isEdit: boolean;
};

type ShiftKey = 'day' | 'ot' | 'night';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

type Shifts = {
  [key: string]: Shift; // Allow any string key
};
type Shift = {
  name: string;
  active: boolean;
  start: Date; // e.g., "08:00"
  end: Date; // e.g., "17:00"
};

// Type for a single day's data
type DayData = {
  day: string; // e.g., "Monday"
  active: boolean; // Whether the entire day is active
  shifts: {
    day: Shift;
    ot: Shift;
    night: Shift;
  };
};

const shiftKeys: ShiftKey[] = ['day', 'ot', 'night'];
const startMorning = new Date(new Date().setHours(8, 0, 0, 0));
const endMorning = new Date(new Date().setHours(17, 0, 0, 0));
const startOt = new Date(new Date().setHours(17, 30, 0, 0));
const endOt = new Date(new Date().setHours(20, 0, 0, 0));
const startNight = new Date(new Date().setHours(20, 0, 0, 0));
const endNight = new Date(new Date().setHours(8, 0, 0, 0));

const initialDataWorkSchedule = [
  {
    dayOfWeek: 'Monday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Tuesday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Wednesday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Thursday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Friday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Saturday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
  {
    dayOfWeek: 'Sunday',
    isDayActive: true,
    oeeId: null,
    shifts: [
      {
        id: null,
        shiftNumber: 1,
        shiftName: 'Day Test 1',
        startTime: startMorning,
        endTime: endMorning,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 2,
        shiftName: 'Ot Test 1',
        startTime: startOt,
        endTime: endOt,
        isShiftActive: true,
      },
      {
        id: null,
        shiftNumber: 3,
        shiftName: 'Night Test 1',
        startTime: startNight,
        endTime: endNight,
        isShiftActive: true,
      },
    ],
  },
];

export default function OeeForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentOee, saveError } = useSelector((state: RootState) => state.oee);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { toggle: openProductForm, onOpen: onOpenProductForm, onClose: onCloseProductForm } = useToggle();

  const { toggle: openMachineForm, onOpen: onOpenMachineForm, onClose: onCloseMachineForm } = useToggle();

  const { toggle: openTagForm, onOpen: onOpenTagForm, onClose: onCloseTagForm } = useToggle();

  const { toggle: openWorkSchedule, onOpen: onOpenWorkScheduleForm, onClose: onCloseWorkScheduleForm } = useToggle();

  const [editingProduct, setEditingProduct] = useState<SelectedItem<OeeProduct> | null>(null);

  const [editingMachine, setEditingMachine] = useState<SelectedItem<OeeMachine> | null>(null);

  const [editingTag, setEditingTag] = useState<OeeTag | null>(null);

  const [operators, setOperators] = useState<User[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  // const { pagedList, isLoading } = useSelector((state: RootState) => state.user);
  const [pagedList, setPagedList] = useState<UserPagedList>({} as UserPagedList);

  const [machineId, setMachineId] = useState<number>(0);

  // const [workShift, setWorkShift] = useState<DayData[]>(initialDataWorkSchedule);

  const NewOeeSchema = Yup.object().shape({
    oeeCode: Yup.string().required('OEE Code is required'),
    oeeType: Yup.string().required('OEE Type is required'),
    location: Yup.string().required('Location is required'),
    productionName: Yup.string().required('Production Name is required'),
  });
  function convertTimeToDate(timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date;
  }
  const formatDateWorkShift = (dataWorkShifts: WorkShiftsDetail[]) => {
    const result = dataWorkShifts.map((item) => {
      item.shifts.map((shift) => {
        console.log(shift);
        return {
          ...shift,
          startTime: convertTimeToDate(shift.startTime as string),
          endTime: convertTimeToDate(shift.endTime as string),
        };
      });
    });

    return result;
  };

  const methods = useForm<EditOee>({
    resolver: yupResolver(NewOeeSchema),
    defaultValues: {
      activeSecondUnit: false,
      oeeCode: '',
      oeeType: OEE_TYPE_OPTIONS[0],
      location: '',
      productionName: '',
      minorStopSeconds: 0,
      breakdownSeconds: 0,
      remark: '',
      oeeMachines: [],
      oeeProducts: [],
      timeUnit: TIME_UNIT_OPTIONS[0],
      useSitePercentSettings: true,
      percentSettings: initialPercentSettings,
      tags: initialOeeTags,
      image: null,
      operators: [],
      workShifts: [],
    },
    values: {
      activeSecondUnit: currentOee?.activeSecondUnit || false,
      oeeCode: currentOee?.oeeCode || '',
      oeeType: currentOee?.oeeType || OEE_TYPE_OPTIONS[0],
      location: currentOee?.location || '',
      productionName: currentOee?.productionName || '',
      minorStopSeconds: currentOee ? convertToUnit(currentOee.minorStopSeconds, currentOee.timeUnit) : 0,
      breakdownSeconds: currentOee ? convertToUnit(currentOee.breakdownSeconds, currentOee.timeUnit) : 0,
      remark: currentOee?.remark || '',
      oeeMachines: currentOee?.oeeMachines || [],
      oeeProducts: currentOee
        ? (currentOee.oeeProducts || []).map((item) => {
            return {
              ...item,
              standardSpeedSeconds: convertToUnit(item.standardSpeedSeconds, currentOee.timeUnit),
            };
          })
        : [],
      timeUnit: currentOee?.timeUnit || TIME_UNIT_OPTIONS[0],
      useSitePercentSettings: currentOee ? currentOee.useSitePercentSettings : true,
      percentSettings: currentOee?.percentSettings ? currentOee.percentSettings : initialPercentSettings,
      tags: currentOee?.tags
        ? [
            ...currentOee.tags,
            ...initialOeeTags.filter((item) => currentOee.tags.findIndex((tag) => tag.key === item.key) < 0),
          ]
        : initialOeeTags,
      image: null,
      operators: currentOee?.operators || [],
      workShifts: initialDataWorkSchedule,
    },
  });

  const {
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: EditOee) => {
    data.operators = operators;
    data.oeeMachines = data.oeeMachines.map((item: any) => {
      if (item.machine) {
        item.machine.widgets = [];
        item.machine.remark = '';
      }
      return item;
    });

    data.percentSettings = data.useSitePercentSettings ? null : data.percentSettings;
    if (data.timeUnit === 'minute') {
      data.minorStopSeconds = Number(data.minorStopSeconds) * 60;
      data.breakdownSeconds = Number(data.breakdownSeconds) * 60;
      data.oeeProducts = (data.oeeProducts || []).map((item) => {
        item.standardSpeedSeconds = item.standardSpeedSeconds * 60;
        return item;
      });
    }

  const mapSchedule = data.workShifts.map((work) => {
    
      return {
        ...work,
        shifts : work.shifts.map((shift:ShiftWork) => {
          return {
            ...shift,
            startTime: dayjs(shift.startTime).format('HH:mm') as string,
            endTime: dayjs(shift.endTime).format('HH:mm') as string,
           
          }
        })
      }
    }) || []
    
    data.workShifts = mapSchedule
   
    const oee = isEdit && currentOee ? await dispatch(updateOee(currentOee.id, data)) : await dispatch(createOee(data));

    if (oee) {
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.oees.root);
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

  const handleProductAdd = () => {
    setEditingProduct(null);
    onOpenProductForm();
  };

  const handleProductEdit = (index: number) => {
    const oeeProducts = getValues('oeeProducts') || [];
    if (oeeProducts.length > 0) {
      setEditingProduct({
        index: index,
        item: oeeProducts[index],
      });
      onOpenProductForm();
    }
  };

  const handleProductDelete = (index: number) => {
    const oeeProducts = getValues('oeeProducts') || [];
    oeeProducts.splice(index, 1);
    setValue('oeeProducts', oeeProducts);
  };

  const handleProductSelected = (oeeProduct: OeeProduct) => {
    if (!oeeProduct.productId) {
      return;
    }

    const oeeProducts = getValues('oeeProducts') || [];
    if (editingProduct) {
      const temp = oeeProducts[editingProduct.index];
      oeeProducts[editingProduct.index] = {
        ...temp,
        ...oeeProduct,
      };
    } else {
      oeeProducts.push(oeeProduct);
    }

    setValue('oeeProducts', oeeProducts);
    setEditingProduct(null);
  };

  const handleMachineAdd = () => {
    setEditingMachine(null);
    onOpenMachineForm();
  };

  const handleMachineEdit = (index: number) => {
    const oeeMachines = getValues('oeeMachines') || [];
    if (oeeMachines.length > 0) {
      setEditingMachine({
        index: index,
        item: oeeMachines[index],
      });
      onOpenMachineForm();
    }
  };

  const handleMachineDelete = (index: number) => {
    const oeeMachines = getValues('oeeMachines') || [];
    oeeMachines.splice(index, 1);
    setValue('oeeMachines', oeeMachines);
  };

  const handleMachineSelected = (oeeMachine: OeeMachine) => {
    if (!oeeMachine.machineId) {
      return;
    }

    const oeeType = getValues('oeeType');
    const oeeMachines = getValues('oeeMachines');
    if (oeeType === OEE_TYPE_STANDALONE && oeeMachines.length === 1) {
      enqueueSnackbar('OEE Standalone cannot have more than one machine', { variant: 'warning' });
      return;
    }

    if (oeeMachines.filter((item) => item.machineId === oeeMachine.machineId).length > 0) {
      enqueueSnackbar(`${oeeMachine.machine?.code} has been selected`, { variant: 'warning' });
      return;
    }
    setMachineId(oeeMachine.machineId);
    if (editingMachine) {
      const temp = oeeMachines[editingMachine.index];
      oeeMachines[editingMachine.index] = {
        ...temp,
        ...oeeMachine,
      };
    } else {
      const initOeeMachinePlannedDowntime: MachinePlanDownTime = {
        machineId: oeeMachine.machineId,
        plannedDownTimeId: 1,
        namePlannedDownTime: '',
        startDate: new Date(),
        endDate: new Date(),
        fixTime: false,
      };
      oeeMachine.oeeMachinePlannedDowntime = [initOeeMachinePlannedDowntime];
      oeeMachines.push(oeeMachine);
    }
    setValue('oeeMachines', oeeMachines);
    setEditingMachine(null);
  };

  useEffect(() => {
    const oeeMachines = getValues('oeeMachines');
    for (const oeeMachine of oeeMachines) {
      if (oeeMachine.oeeMachinePlannedDowntime?.length === 0) {
        const initOeeMachinePlannedDowntime: MachinePlanDownTime = {
          machineId: oeeMachine.machineId,
          plannedDownTimeId: 1,
          namePlannedDownTime: '',
          startDate: new Date(),
          endDate: new Date(),
          fixTime: false,
        };
        oeeMachine.oeeMachinePlannedDowntime = [initOeeMachinePlannedDowntime];
      }
    }
  }, [isEdit]);

  const handleAddPlanDowntime = (index: number) => {
    const oeeMachines = getValues('oeeMachines');
    const initOeeMachinePlannedDowntime: MachinePlanDownTime = {
      machineId: machineId,
      plannedDownTimeId: 1,
      namePlannedDownTime: '',
      startDate: new Date(),
      endDate: new Date(),
      fixTime: false,
    };
    oeeMachines[index]?.oeeMachinePlannedDowntime?.push(initOeeMachinePlannedDowntime);
    setValue('oeeMachines', oeeMachines);
  };

  const handleDeletePlanDowntime = (index: number, indexPlan: number) => {
    const oeeMachines = getValues('oeeMachines');
    oeeMachines[index]?.oeeMachinePlannedDowntime?.splice(indexPlan, 1);
    setValue('oeeMachines', oeeMachines);
  };

  const handleFixTimeChange = (indexPlan: number) => {
    const oeeMachines = getValues('oeeMachines');
    if (
      oeeMachines[0] &&
      oeeMachines[0].oeeMachinePlannedDowntime &&
      oeeMachines[0].oeeMachinePlannedDowntime[indexPlan]
    ) {
      oeeMachines[0].oeeMachinePlannedDowntime[indexPlan].fixTime =
        !oeeMachines[0].oeeMachinePlannedDowntime[indexPlan].fixTime;
    }
    setValue('oeeMachines', oeeMachines);
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      setValue(
        'image',
        Object.assign(acceptedFiles[0], {
          preview: URL.createObjectURL(acceptedFiles[0]),
        }),
      );
    },
    [setValue],
  );

  const handlePercentSettingChange = (percentSetting: PercentSetting) => {
    const percentSettings = getValues('percentSettings') || [];
    const newPercentSettings = [
      ...percentSettings.map((item) => {
        if (item.type === percentSetting.type) {
          item.settings = percentSetting.settings;
        }
        return item;
      }),
    ];
    setValue('percentSettings', newPercentSettings);
  };

  const handleTagSave = (tag: OeeTag) => {
    const tags = getValues('tags') || [];
    const index = tags.findIndex((item) => item.key === tag.key);
    tags[index] = tag;
    setValue('tags', [...tags]);
  };

  const handleTagEdit = (tag: OeeTag) => {
    setEditingTag(tag);
    onOpenTagForm();
  };
  const getOperatorData = async (filterTerm: string = '') => {
    const filter: FilterUser = {
      search: filterTerm,
      order: 'desc',
      orderBy: 'createdAt',
      page: 0,
      rowsPerPage: 100,
    };
    const response = await axios.get<UserPagedList>(`/users`, { params: filter });
    setPagedList(response.data);
    setUsers(response.data.list);
    return response.data;
  };

  const handleToggleDay = (index: number) => {
    const updatedRows = [...values.workShifts];
    updatedRows[index].isDayActive = !updatedRows[index].isDayActive;

    setValue('workShifts', updatedRows);
  };

  const handleToggleShift = (index: number, shift: number) => {
    const updatedRows = [...values.workShifts];
    updatedRows[index].shifts[shift].isShiftActive = !updatedRows[index].shifts[shift].isShiftActive;
    setValue('workShifts', updatedRows);
  };

  useEffect(() => {
    if (currentOee && isEdit) {
      // let updatedRows = [...values.workShifts];

      const result = currentOee?.workShifts.map((item) => {
        return {
          ...item,
          shifts: item.shifts.map((shift) => {
         
            return {
              ...shift,
              startTime: convertTimeToDate(shift.startTime as string),
              endTime: convertTimeToDate(shift.endTime as string),
            };
          }),
        };
      });
    
      setValue('workShifts', result);
    }
  }, [isEdit]);

  useEffect(() => {
    (async () => {
      await getOperatorData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOperators(currentOee?.operators || []);
  }, [currentOee]);

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          heading={!isEdit ? 'Create OEE' : 'Edit OEE'}
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
            <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.oees.root}>
              Cancel
            </Button>
          }
        />

        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <RHFUploadSingleFile
                    name="image"
                    accept="image/*"
                    maxSize={3145728}
                    onDrop={handleDrop}
                    currentFile={isEdit ? getFileUrl(currentOee?.imageName) : ''}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <RHFCheckbox name="activeSecondUnit" label="Second Unit Mode" />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField name="oeeCode" label="OEE Code" />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFSelect name="oeeType" label="OEE Type" SelectProps={{ native: false }}>
                        {OEE_TYPE_OPTIONS.map((oeeType) => (
                          <MenuItem
                            key={oeeType}
                            value={oeeType}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                            }}
                          >
                            {fOeeTypeText(oeeType)}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>
                    <Grid item xs={6}>
                      <RHFTextField name="productionName" label="Production Name" />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField name="location" label="Location" />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <RHFSelect name="timeUnit" label="Time Unit" SelectProps={{ native: false }}>
                        {TIME_UNIT_OPTIONS.map((timeUnit) => (
                          <MenuItem
                            key={timeUnit}
                            value={timeUnit}
                            sx={{
                              mx: 1,
                              my: 0.5,
                              borderRadius: 0.75,
                              typography: 'body2',
                            }}
                          >
                            {timeUnit}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Grid>

                    <Grid item xs={4}>
                      <RHFTextField
                        type="number"
                        name="minorStopSeconds"
                        label={`Minor Stop (${fTimeUnitText(values.timeUnit)})`}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField
                        type="number"
                        name="breakdownSeconds"
                        label={`Breakdown Condition (${fTimeUnitText(values.timeUnit)})`}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Autocomplete
                        multiple
                        id="operator"
                        key={`oeeOpts_single`}
                        options={users}
                        value={operators}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                        renderInput={(params) => <TextField {...params} label="Operator Name" />}
                        onChange={(event, value) => {
                          setOperators(value);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <EditorLabelStyle>Remark</EditorLabelStyle>
                      <RHFEditor simple name="remark" />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {values.tags && (
            <Card>
              <CardContent>
                <OeeTagList tags={values.tags} onEdit={handleTagEdit} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <RHFCheckbox name="useSitePercentSettings" label="Use default percent settings" />

              {!values.useSitePercentSettings && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {(values.percentSettings || []).map((percentSetting) => (
                    <OeePercentSettings
                      key={percentSetting.type}
                      percentSetting={percentSetting}
                      onEdit={handlePercentSettingChange}
                    />
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <OeeProductTable
                editingOee={values}
                oeeProducts={values.oeeProducts || []}
                onAdd={() => handleProductAdd()}
                onEdit={(index) => handleProductEdit(index)}
                onDelete={(index) => handleProductDelete(index)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <OeeMachineTable
                oeeMachines={values.oeeMachines || []}
                onAdd={() => handleMachineAdd()}
                onEdit={(index) => handleMachineEdit(index)}
                onDelete={(index) => handleMachineDelete(index)}
                onAddPlanDowntime={(index) => handleAddPlanDowntime(index)}
                onDeletePlanDowntime={(index, indexPlan) => handleDeletePlanDowntime(index, indexPlan)}
                onFixTimeChange={(indexPlan) => handleFixTimeChange(indexPlan)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <WorkShiftSchedule
                workShift={values.workShifts}
                onToggleDay={handleToggleDay}
                onEditWorkShiftName={onOpenWorkScheduleForm}
                onToggleWorkShift={handleToggleShift}
                title={'Edit Work Name'}
                open={openWorkSchedule}
                onClose={onCloseWorkScheduleForm}
              />
              {/* <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 2 }}>
                Save Schedule
              </Button> */}
            </CardContent>
          </Card>
        </Stack>
      </FormProvider>

      <OeeProductDialog
        open={openProductForm}
        onClose={onCloseProductForm}
        currentOee={values}
        editingProduct={editingProduct?.item}
        onSelect={handleProductSelected}
      />

      <OeeMachineDialog
        open={openMachineForm}
        onClose={onCloseMachineForm}
        editingMachine={editingMachine?.item}
        onSelect={handleMachineSelected}
      />

      <OeeTagDialog
        title={editingTag ? fOeeTabLabel(editingTag.key) : ''}
        open={openTagForm}
        onClose={onCloseTagForm}
        editingTag={editingTag}
        onSave={handleTagSave}
      />
    </>
  );
}
