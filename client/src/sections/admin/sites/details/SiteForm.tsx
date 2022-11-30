import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, Grid, MenuItem, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import GoogleMapReact from 'google-map-react';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { PercentSetting } from '../../../../@types/percentSetting';
import { Site } from '../../../../@types/site';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import FormHeader from '../../../../components/FormHeader';
import FormLabelStyle from '../../../../components/FormLabelStyle';
import {
  FormProvider,
  RHFEditor,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadSingleFile,
} from '../../../../components/hook-form';
import Iconify from '../../../../components/Iconify';
import { defaultMaps, initialPercentSettings, TIME_UNIT_OPTIONS } from '../../../../constants';
import { PATH_ADMINISTRATOR } from '../../../../routes/paths';
import axios from '../../../../utils/axios';
import SitePercentSettings from './SitePercentSettings';

interface FormValuesProps extends Partial<Site> {
  image: File;
  percentSettings: PercentSetting[];
}

interface Props {
  isEdit: boolean;
  currentSite: Site | undefined;
}

interface mapProps {
  map: any;
  maps: any;
}

export default function SiteForm({ isEdit, currentSite }: Props) {
  const theme = useTheme();

  const navigate = useNavigate();

  const { enqueueSnackbar } = useSnackbar();

  const [mapApi, setMapApi] = useState<mapProps>({ map: null, maps: null });

  const [marker, setMarker] = useState<any>(null);

  const NewSiteSchema = Yup.object().shape({
    name: Yup.string().required('Site Name is required'),
    lat: Yup.number().required('Latitude is required'),
    lng: Yup.number().required('Longitude is required'),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentSite?.name || '',
      branch: currentSite?.branch || '',
      address: currentSite?.address || '',
      remark: currentSite?.remark || '',
      lat: currentSite?.lat || defaultMaps.center.lat,
      lng: currentSite?.lng || defaultMaps.center.lng,
      active: currentSite ? currentSite.active : true,
      sync: currentSite ? currentSite.sync : true,
      percentSettings: currentSite ? currentSite.defaultPercentSettings : initialPercentSettings,
    }),
    [currentSite],
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewSiteSchema),
    defaultValues,
  });

  const {
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEdit && currentSite) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentSite]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const { image, percentSettings, ...dto } = data;
      dto.defaultPercentSettings = percentSettings;
      let site: Site;

      if (isEdit && currentSite) {
        const response = await axios.put<Site>(`/sites/${currentSite?.id}`, dto);
        site = response.data;
      } else {
        const response = await axios.post<Site>(`/sites`, dto);
        site = response.data;
      }

      if (image) {
        await axios.post<Site>(
          `/sites/${site.id}/upload`,
          { image },
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      }

      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      window.location.href = PATH_ADMINISTRATOR.sites.root;
      // if (isEdit) {
      //   window.location.href = PATH_ADMINISTRATOR.sites.root;
      // } else {
      //   navigate(PATH_ADMINISTRATOR.sites.root);
      // }
    } catch (error) {
      console.error(error);
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
                currentFile={currentSite?.imageUrl}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={theme.spacing(3)}>
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                      <RHFSwitch name="active" label="Active" />

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

                  <Grid item xs={12}>
                    <FormLabelStyle>Remark</FormLabelStyle>
                    <RHFEditor simple name="remark" />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack spacing={theme.spacing(2)}>
                  {getValues('percentSettings').map((percentSetting) => (
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
                <Grid container spacing={theme.spacing(3)}>
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
                        bootstrapURLKeys={{ key: 'AIzaSyCTZZLIUayWOzR6FWskr8opyfx91mjNkK8' }}
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
