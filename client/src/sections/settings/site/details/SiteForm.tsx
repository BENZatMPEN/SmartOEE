import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import GoogleMapReact from 'google-map-react';
import { useSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { PercentSetting } from '../../../../@types/percentSetting';
import { EditSite, Site } from '../../../../@types/site';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import FormLabelStyle from '../../../../components/FormLabelStyle';
import {
  FormProvider,
  RHFEditor,
  RHFSwitch,
  RHFTextField,
  RHFUploadSingleFile,
} from '../../../../components/hook-form';
import { RHFTimePicker } from '../../../../components/hook-form/RHFDateTimePicker';
import Iconify from '../../../../components/Iconify';
import { GOOGLE_MAPS_KEY } from '../../../../config';
import { defaultMaps, initialAlertTemplate, initialPercentSettings } from '../../../../constants';
import { updateSite } from '../../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { getFileUrl } from '../../../../utils/imageHelper';
import SitePercentSettings from './SitePercentSettings';
import SiteAlertTemplate from './SiteAlertTemplate';
import { RoleAction, RoleSubject } from '../../../../@types/role';
import { AbilityContext } from '../../../../caslContext';

interface MapProps {
  map: any;
  maps: any;
}

export default function SiteForm() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { currentSite, saveError } = useSelector((state: RootState) => state.site);

  const [mapApi, setMapApi] = useState<MapProps>({ map: null, maps: null });

  const [marker, setMarker] = useState<any>(null);

  const NewSiteSchema = Yup.object().shape({
    name: Yup.string().required('Site Name is required'),
    lat: Yup.number().required('Latitude is required'),
    lng: Yup.number().required('Longitude is required'),
  });

  const methods = useForm<EditSite>({
    resolver: yupResolver(NewSiteSchema),
    defaultValues: {
      name: '',
      branch: '',
      address: '',
      remark: '',
      lat: defaultMaps.center.lat,
      lng: defaultMaps.center.lng,
      active: true,
      sync: true,
      defaultPercentSettings: initialPercentSettings,
      alertTemplate: initialAlertTemplate,
      cutoffTime: null,
      image: null,
    },
    values: {
      name: currentSite?.name || '',
      branch: currentSite?.branch || '',
      address: currentSite?.address || '',
      remark: currentSite?.remark || '',
      lat: currentSite?.lat || defaultMaps.center.lat,
      lng: currentSite?.lng || defaultMaps.center.lng,
      active: currentSite ? currentSite.active : true,
      sync: currentSite ? currentSite.sync : true,
      defaultPercentSettings: currentSite ? currentSite.defaultPercentSettings : initialPercentSettings,
      alertTemplate: currentSite?.alertTemplate ? currentSite.alertTemplate : initialAlertTemplate,
      cutoffTime: currentSite?.cutoffTime || dayjs().startOf('d').toDate(),
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

  useEffect(() => {
    handleLocationChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSite]);

  const onSubmit = async (data: EditSite) => {
    let site: Site | null = null;

    if (currentSite) {
      site = await dispatch(updateSite(currentSite.id, data));
    }

    if (site) {
      enqueueSnackbar('Update success!');
      window.location.reload();
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

  const handleApiLoaded = (map: any, maps: any) => {
    setMapApi({ map, maps });

    const newLatLng = {
      lat: getValues('lat'),
      lng: getValues('lng'),
    };
    setMarker(
      new maps.Marker({
        position: newLatLng,
        map,
      }),
    );

    map.setCenter(newLatLng);
  };

  const handleLocationChange = () => {
    if (!mapApi.map) {
      return;
    }

    const newLatLng = {
      lat: getValues('lat'),
      lng: getValues('lng'),
    };

    marker.setMap(null);
    marker.position = newLatLng;
    marker.setMap(mapApi.map);
    mapApi.map.setCenter(newLatLng);
  };

  const handlePercentSettingChange = (percentSetting: PercentSetting) => {
    const percentSettings = getValues('defaultPercentSettings') || [];
    const newPercentSettings = [
      ...percentSettings.map((item) => {
        if (item.type === percentSetting.type) {
          item.settings = percentSetting.settings;
        }
        return item;
      }),
    ];
    setValue('defaultPercentSettings', newPercentSettings);
  };

  const ability = useContext(AbilityContext);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={'Edit Site'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Site',
              },
            ]}
          />
        }
        {...(ability.can(RoleAction.Update, RoleSubject.SiteSettings)
          ? {
              action: (
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  startIcon={<Iconify icon="eva:save-fill" />}
                >
                  Save
                </LoadingButton>
              ),
            }
          : undefined)}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <RHFUploadSingleFile
                name="image"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                currentFile={getFileUrl(currentSite?.imageName)}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                      <RHFSwitch name="sync" label="Sync data" />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField name="name" label="Site Name" />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField name="branch" label="Branch" />
                  </Grid>

                  <Grid item xs={12}>
                    <RHFTextField name="address" label="Address" />
                  </Grid>

                  <Grid item xs={6}>
                    <RHFTimePicker name="cutoffTime" label="Cutoff Time" />
                  </Grid>

                  <Grid item xs={12}>
                    <FormLabelStyle>Remark</FormLabelStyle>
                    <RHFEditor simple name="remark" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {values.defaultPercentSettings.map((percentSetting) => (
                    <SitePercentSettings
                      key={percentSetting.type}
                      percentSetting={percentSetting}
                      onEdit={handlePercentSettingChange}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="subtitle1">Alert Template</Typography>

                  <SiteAlertTemplate
                    label="A without name"
                    value={values.alertTemplate?.aParamWithoutParam || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{time}} = Timestamp, {{seconds}} = Total seconds'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        aParamWithoutParam: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="A with name"
                    value={values.alertTemplate?.aParamWithParam || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{paramName}} = Breakdown Name, {{time}} = Timestamp, {{seconds}} = Total seconds'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        aParamWithParam: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="P without name"
                    value={values.alertTemplate?.pParamWithoutParam || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{time}} = Timestamp, {{seconds}} = Total seconds'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        pParamWithoutParam: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="P with name"
                    value={values.alertTemplate?.pParamWithParam || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{paramName}} = Minor Loss Name, {{time}} = Timestamp, {{seconds}} = Total seconds'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        pParamWithParam: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="Q with name"
                    value={values.alertTemplate?.qParamWithParam || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{paramName}} = Loss name, {{time}} = Timestamp, {{seconds}} = Total seconds'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        qParamWithParam: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="OEE Low"
                    value={values.alertTemplate?.oeeLow || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        oeeLow: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="A Low"
                    value={values.alertTemplate?.aLow || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        aLow: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="P Low"
                    value={values.alertTemplate?.pLow || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        pLow: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="Q Low"
                    value={values.alertTemplate?.qLow || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        qLow: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="OEE High"
                    value={values.alertTemplate?.oeeHigh || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        oeeHigh: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="A High"
                    value={values.alertTemplate?.aHigh || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        aHigh: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="P High"
                    value={values.alertTemplate?.pHigh || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        pHigh: value,
                      });
                    }}
                  />

                  <SiteAlertTemplate
                    label="Q High"
                    value={values.alertTemplate?.qHigh || ''}
                    description={
                      'Variables: {{oeeCode}} = OEE Code, {{productionName}} = Production Name, {{sku}} = Product SKU, {{previousPercent}} = Previous Value, {{currentPercent}} = Current Value'
                    }
                    onChange={(value) => {
                      const currentValue = getValues('alertTemplate');
                      setValue('alertTemplate', {
                        ...currentValue,
                        qHigh: value,
                      });
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      type="number"
                      name="lat"
                      label="Latitude"
                      onChange={(event) => {
                        setValue('lat', Number(event.target.value));
                        handleLocationChange();
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <RHFTextField
                      type="number"
                      name="lng"
                      label="Longitude"
                      onChange={(event) => {
                        setValue('lng', Number(event.target.value));
                        handleLocationChange();
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <div style={{ height: '300px', width: '100%' }}>
                      <GoogleMapReact
                        bootstrapURLKeys={{ key: GOOGLE_MAPS_KEY }}
                        defaultCenter={defaultMaps.center}
                        defaultZoom={defaultMaps.zoom}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
                      />
                    </div>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
