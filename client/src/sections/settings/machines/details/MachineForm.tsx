import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditMachine, MachineParameter } from '../../../../@types/machine';
import { Widget } from '../../../../@types/widget';
import { EditorLabelStyle } from '../../../../components/EditorLabelStyle';
import FormHeader from '../../../../components/FormHeader';
import { FormProvider, RHFEditor, RHFTextField, RHFUploadSingleFile } from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { LoadableWidget } from '../../../../components/widget/LoadableWidget';
import { OEE_TYPE_A, OEE_TYPE_P, OEE_TYPE_Q } from '../../../../constants';
import useToggle from '../../../../hooks/useToggle';
import { createMachine, updateMachine } from '../../../../redux/actions/machineAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getFileUrl } from '../../../../utils/imageHelper';
import MachineParamAList from './MachineParamAList';
import MachineParameterDialog from './MachineParameterDialog';
import MachineParamPList from './MachineParamPList';
import MachineParamQList from './MachineParamQList';

interface FormValuesProps extends EditMachine {
  aParams: MachineParameter[];
  pParams: MachineParameter[];
  qParams: MachineParameter[];
  widgets: Widget[];
}

type Props = {
  isEdit: boolean;
};

const defaultWidget: Widget[] = [{ id: 0, type: 'image', data: null, deviceId: null, tagId: null } as Widget];

export default function MachineForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentMachine, saveError } = useSelector((state: RootState) => state.machine);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { toggle: openForm, onOpen: onOpenForm, onClose: onCloseForm } = useToggle();

  const { toggle: openWidget, onOpen: onOpenWidget, onClose: onCloseWidget } = useToggle();

  const [editingParam, setEditingParam] = useState<{
    param: MachineParameter | null;
    type: string;
    index: number;
  }>({
    param: null,
    type: '',
    index: -1,
  });

  const NewMachineSchema = Yup.object().shape({
    code: Yup.string().required('Machine Code is required'),
    name: Yup.string().required('Machine Name is required'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewMachineSchema),
    defaultValues: {
      code: '',
      name: '',
      location: '',
      remark: '',
      aParams: [],
      pParams: [],
      qParams: [],
      parameters: [],
      widgets: defaultWidget,
      image: null,
    },
    values: {
      code: currentMachine?.code || '',
      name: currentMachine?.name || '',
      location: currentMachine?.location || '',
      remark: currentMachine?.remark || '',
      parameters: currentMachine?.parameters || [],
      aParams: currentMachine?.parameters?.filter((item) => item.oeeType === OEE_TYPE_A) || [],
      pParams: currentMachine?.parameters?.filter((item) => item.oeeType === OEE_TYPE_P) || [],
      qParams: currentMachine?.parameters?.filter((item) => item.oeeType === OEE_TYPE_Q) || [],
      widgets: currentMachine
        ? currentMachine.widgets && !!currentMachine.widgets.length
          ? currentMachine.widgets
          : defaultWidget
        : defaultWidget,
      image: null,
    },
  });

  const {
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = async (data: FormValuesProps) => {
    const { aParams, pParams, qParams, widgets, ...dto } = data;
    dto.parameters = [...aParams, ...pParams, ...qParams];

    const machine =
      isEdit && currentMachine
        ? await dispatch(updateMachine(currentMachine.id, dto))
        : await dispatch(createMachine(dto));

    if (machine) {
      if (!isEdit) {
        (widgets || []).forEach((item) => (item.id = null));
      }

      await axios.post(`/machines/${machine.id}/widgets`, { machineId: machine.id, widgets });

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.machines.root);
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

  const handleSelected = (selectedParam: MachineParameter) => {
    let params = [] as MachineParameter[];
    if (selectedParam.oeeType === OEE_TYPE_A) {
      params = getValues('aParams');
      setValue('aParams', []);
    } else if (selectedParam.oeeType === OEE_TYPE_P) {
      params = getValues('pParams');
      setValue('pParams', []);
    } else if (selectedParam.oeeType === OEE_TYPE_Q) {
      params = getValues('qParams');
      setValue('qParams', []);
    }

    if (editingParam.index === -1) {
      params.push(selectedParam);
    } else {
      const index = params.findIndex((param) => param.id === selectedParam.id);
      if (index >= 0) {
        params[editingParam.index] = selectedParam;
      }
    }

    if (selectedParam.oeeType === OEE_TYPE_A) {
      setValue('aParams', [...params]);
    } else if (selectedParam.oeeType === OEE_TYPE_P) {
      setValue('pParams', [...params]);
    } else if (selectedParam.oeeType === OEE_TYPE_Q) {
      setValue('qParams', [...params]);
    }

    setEditingParam({ param: null, type: '', index: -1 });
  };

  const handleAddParam = (oeeType: string) => {
    setEditingParam({ param: null, type: oeeType, index: -1 });
    onOpenForm();
  };

  const handleEditParam = (oeeType: string, index: number) => {
    let params = [] as MachineParameter[];
    if (oeeType === OEE_TYPE_A) {
      params = getValues('aParams');
    } else if (oeeType === OEE_TYPE_P) {
      params = getValues('pParams');
    } else if (oeeType === OEE_TYPE_Q) {
      params = getValues('qParams');
    }

    setEditingParam({ param: params[index], type: oeeType, index });
    onOpenForm();
  };

  const handleSaveWidget = (index: number, widget: Widget) => {
    const widgets = getValues('widgets') || [];
    widgets[index] = widget;
    setValue('widgets', [...widgets]);
  };

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <FormHeader
          heading={!isEdit ? 'Create Machine' : 'Edit Machine'}
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
            <Button variant="contained" component={RouterLink} to={PATH_SETTINGS.machines.root}>
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
                    currentFile={isEdit ? getFileUrl(currentMachine?.imageName) : ''}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <RHFTextField name="code" label="Machine Code" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <RHFTextField name="location" label="Location" />
                    </Grid>

                    <Grid item xs={12}>
                      <RHFTextField name="name" label="Machine Name" />
                    </Grid>

                    <Grid item xs={12}>
                      <EditorLabelStyle>Remark</EditorLabelStyle>
                      <RHFEditor simple name="remark" />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack spacing={3}>
                        <Button variant="contained" onClick={onOpenWidget}>
                          Set Machine Status Images
                        </Button>

                        {values.widgets && !!values.widgets.length && (
                          <LoadableWidget
                            widget={values.widgets[0]}
                            canEdit={true}
                            open={openWidget}
                            onClose={onCloseWidget}
                            onSave={(widget) => handleSaveWidget(0, widget)}
                            sx={{
                              borderRadius: 1,
                            }}
                          />
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <MachineParamAList
                onAdd={() => handleAddParam(OEE_TYPE_A)}
                onEdit={(index) => handleEditParam(OEE_TYPE_A, index)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <MachineParamPList
                onAdd={() => handleAddParam(OEE_TYPE_P)}
                onEdit={(index) => handleEditParam(OEE_TYPE_P, index)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <MachineParamQList
                onAdd={() => handleAddParam(OEE_TYPE_Q)}
                onEdit={(index) => handleEditParam(OEE_TYPE_Q, index)}
              />
            </CardContent>
          </Card>
        </Stack>
      </FormProvider>

      {editingParam && (
        <MachineParameterDialog
          key={editingParam.param?.id}
          open={openForm}
          onClose={onCloseForm}
          editingParam={editingParam}
          onSelect={handleSelected}
        />
      )}
    </>
  );
}
