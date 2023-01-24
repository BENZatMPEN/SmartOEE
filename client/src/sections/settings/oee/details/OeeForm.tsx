import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { EditOee, OeeMachine, OeeProduct, OeeTag } from '../../../../@types/oee';
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
import { initialOeeTags, initialPercentSettings, OEE_TYPE_OPTIONS, TIME_UNIT_OPTIONS } from '../../../../constants';
import useToggle from '../../../../hooks/useToggle';
import { createOee, updateOee } from '../../../../redux/actions/oeeAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import { getOeeTabLabel, getTimeUnitText } from '../../../../utils/formatText';
import { getFileUrl } from '../../../../utils/imageHelper';
import { convertToUnit } from '../../../../utils/timeHelper';
import OeeMachineDialog from './OeeMachineDialog';
import OeeMachineTable from './OeeMachineTable';
import OeePercentSettings from './OeePercentSettings';
import OeeProductDialog from './OeeProductDialog';
import OeeProductTable from './OeeProductTable';
import OeeTagDialog from './OeeTagDialog';
import { OeeTagList } from './OeeTagList';

type SelectedItem<T> = {
  index: number;
  item: T;
};

type Props = {
  isEdit: boolean;
};

export default function OeeForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const { currentOee, saveError } = useSelector((state: RootState) => state.oee);

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const { toggle: openProductForm, onOpen: onOpenProductForm, onClose: onCloseProductForm } = useToggle();

  const { toggle: openMachineForm, onOpen: onOpenMachineForm, onClose: onCloseMachineForm } = useToggle();

  const { toggle: openTagForm, onOpen: onOpenTagForm, onClose: onCloseTagForm } = useToggle();

  const [editingProduct, setEditingProduct] = useState<SelectedItem<OeeProduct> | null>(null);

  const [editingMachine, setEditingMachine] = useState<SelectedItem<OeeMachine> | null>(null);

  const [editingTag, setEditingTag] = useState<OeeTag | null>(null);

  const NewOeeSchema = Yup.object().shape({
    oeeCode: Yup.string().required('OEE Code is required'),
    oeeType: Yup.string().required('OEE Type is required'),
    location: Yup.string().required('Location is required'),
    productionName: Yup.string().required('Production Name is required'),
  });

  const methods = useForm<EditOee>({
    resolver: yupResolver(NewOeeSchema),
    defaultValues: {
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
    },
    values: {
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
    data.oeeMachines = data.oeeMachines.map((item) => {
      if (item.machine) {
        item.machine.widgets = [];
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

    const oeeMachines = getValues('oeeMachines');
    if (editingMachine) {
      const temp = oeeMachines[editingMachine.index];
      oeeMachines[editingMachine.index] = {
        ...temp,
        ...oeeMachine,
      };
    } else {
      oeeMachines.push(oeeMachine);
    }

    setValue('oeeMachines', oeeMachines);
    setEditingMachine(null);
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
                            {oeeType}
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
                        label={`Minor Stop (${getTimeUnitText(values.timeUnit)})`}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <RHFTextField
                        type="number"
                        name="breakdownSeconds"
                        label={`Breakdown Condition (${getTimeUnitText(values.timeUnit)})`}
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
              />
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
        title={editingTag ? getOeeTabLabel(editingTag.key) : ''}
        open={openTagForm}
        onClose={onCloseTagForm}
        editingTag={editingTag}
        onSave={handleTagSave}
      />
    </>
  );
}
