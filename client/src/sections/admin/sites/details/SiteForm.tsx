import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import dayjs from 'dayjs';
import GoogleMapReact from 'google-map-react';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { PercentSetting } from '../../../../@types/percentSetting';
import { EditSite } from '../../../../@types/site';
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
import { defaultMaps, initialPercentSettings } from '../../../../constants';
import { createSite, updateSite } from '../../../../redux/actions/siteAction';
import { RootState, useDispatch, useSelector } from '../../../../redux/store';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import { getFileUrl } from '../../../../utils/imageHelper';
import SitePercentSettings from './SitePercentSettings';

interface Props {
  isEdit: boolean;
}

interface MapProps {
  map: any;
  maps: any;
}

export default function SiteForm({ isEdit }: Props) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { currentSite } = useSelector((state: RootState) => state.site);

  const { enqueueSnackbar } = useSnackbar();

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
      cutoffTime: currentSite?.cutoffTime || dayjs().startOf('d').toDate(),
      image: null,
      oeeLimit: currentSite?.oeeLimit || -1,
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

  const onSubmit = async (data: EditSite) => {
    data.cutoffTime = dayjs(data.cutoffTime).startOf('m').toDate();

    try {
      if (isEdit && currentSite) {
        await dispatch(updateSite(currentSite.id, data));
      } else {
        await dispatch(createSite(data));
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_ADMINISTRATOR.sites.root);
    } catch (error) {
      if (error instanceof AxiosError) {
        if ('message' in error.response?.data) {
          if (Array.isArray(error.response?.data.message)) {
            for (const item of error.response?.data.message) {
              enqueueSnackbar(item, { variant: 'error' });
            }
          } else {
            enqueueSnackbar(error.response?.data.message, { variant: 'error' });
          }
          return;
        }
        enqueueSnackbar(error.response?.data.error, { variant: 'error' });
      }
    }
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <FormHeader
        heading={!isEdit ? 'Create Site' : 'Edit Site'}
        breadcrumbs={
          <Breadcrumbs
            links={[
              { name: 'Home', href: '/' },
              {
                name: 'Sites',
                href: PATH_ADMINISTRATOR.sites.root,
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
          <Button variant="contained" component={RouterLink} to={PATH_ADMINISTRATOR.sites.root}>
            Cancel
          </Button>
        }
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
                currentFile={isEdit ? getFileUrl(currentSite?.imageName) : ''}
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
                      <RHFSwitch name="active" label="Active" />

                      <RHFSwitch name="sync" label="Sync data" />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="name" label="Site Name" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="branch" label="Branch" />
                  </Grid>

                  <Grid item xs={12}>
                    <RHFTextField name="address" label="Address" />
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                <Typography variant="subtitle1" paragraph>
                  Limit
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      type="number"
                      name="oeeLimit"
                      label="OEE Limit"
                      onChange={(event) => {
                        setValue('oeeLimit', Number(event.target.value));
                      }}
                    />
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
