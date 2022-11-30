import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Oee, OeeMachine, OeeProduct, OeeTag } from '../../../../@types/oee';
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
import { RootState, useSelector } from '../../../../redux/store';
import { PATH_SETTINGS } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import { getTimeUnitText } from '../../../../utils/formatText';
import { convertToUnit } from '../../../../utils/timeHelper';
import OeeMachineDialog from './OeeMachineDialog';
import OeeMachineTable from './OeeMachineTable';
import OeePercentSettings from './OeePercentSettings';
import OeeProductDialog from './OeeProductDialog';
import OeeProductTable from './OeeProductTable';
import OeeTagDialog from './OeeTagDialog';
import { OeeTagList } from './OeeTagList';

export interface OeeFormValuesProps extends Partial<Oee> {
  image: File;
  percentSettings: PercentSetting[] | null;
}

type SelectedItem<T> = {
  index: number;
  item: T;
};

type Props = {
  isEdit: boolean;
  currentOee: Oee | null;
};

export default function OeeForm({ isEdit, currentOee }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { selectedSite } = useSelector((state: RootState) => state.site);

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

  const defaultValues = useMemo(
    () => ({
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
            item.standardSpeedSeconds = convertToUnit(item.standardSpeedSeconds, currentOee.timeUnit);
            return item;
          })
        : [],
      siteId: currentOee?.siteId || selectedSite?.id,
      timeUnit: currentOee?.timeUnit || TIME_UNIT_OPTIONS[0],
      useSitePercentSettings: currentOee ? currentOee.useSitePercentSettings : true,
      percentSettings: currentOee?.percentSettings ? currentOee.percentSettings : initialPercentSettings,
      tags: currentOee?.tags ? currentOee.tags : initialOeeTags,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentOee],
  );

  const methods = useForm<OeeFormValuesProps>({
    resolver: yupResolver(NewOeeSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    getValues,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    if (isEdit && currentOee) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentOee]);

  const onSubmit = async (data: OeeFormValuesProps) => {
    try {
      const { image, ...dto } = data;
      if (dto.timeUnit === 'minute') {
        dto.minorStopSeconds = Number(dto.minorStopSeconds) * 60;
        dto.breakdownSeconds = Number(dto.breakdownSeconds) * 60;
        dto.oeeProducts = (dto.oeeProducts || []).map((item) => {
          item.standardSpeedSeconds = item.standardSpeedSeconds * 60;
          return item;
        });
      }

      dto.percentSettings = dto.useSitePercentSettings ? null : dto.percentSettings;
      let oee: Oee;

      if (isEdit && currentOee) {
        const response = await axios.put<Oee>(`/oees/${currentOee.id}`, dto);
        oee = response.data;
      } else {
        const response = await axios.post<Oee>(`/oees`, dto);
        oee = response.data;
      }

      if (image) {
        await axios.post(
          `/oees/${oee.id}/upload`,
          { image },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_SETTINGS.oees.root);
    } catch (error) {
      console.error(error);
    }
  };

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

    const oeeMachines = getValues('oeeMachines') as OeeMachine[];
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

        <Stack spacing={theme.spacing(3)}>
          <Grid container spacing={theme.spacing(3)}>
            <Grid item xs={4}>
              <Card>
                <CardContent>
                  <RHFUploadSingleFile
                    name="image"
                    accept="image/*"
                    maxSize={3145728}
                    onDrop={handleDrop}
                    currentFile={currentOee?.imageUrl}
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
                <Stack spacing={theme.spacing(2)} sx={{ mt: theme.spacing(2) }}>
                  {(getValues('percentSettings') || []).map((percentSetting) => (
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
                oeeProducts={getValues('oeeProducts') || []}
                onAdd={() => handleProductAdd()}
                onEdit={(index) => handleProductEdit(index)}
                onDelete={(index) => handleProductDelete(index)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <OeeMachineTable
                oeeMachines={getValues('oeeMachines') || []}
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

      <OeeTagDialog open={openTagForm} onClose={onCloseTagForm} editingTag={editingTag} onSave={handleTagSave} />
    </>
  );
}
