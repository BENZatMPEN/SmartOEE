import { Divider, FormControlLabel, Grid, MenuItem, Switch } from '@mui/material';
import React, { useState } from 'react';
import { FormProvider, RHFSelect } from 'src/components/hook-form';
import { ADVANCED_TYPE } from 'src/constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useDispatch } from 'src/redux/store';
import { setAdvancedType, setModeView } from 'src/redux/actions/oeeAdvancedAction';
type Props = {};
const modeList = [
  {
    name: 'Mode 1',
    key: 'mode1',
  },
  {
    name: 'Mode 2',
    key: 'mode2',
  },
];
const criteriaScheme = Yup.object().shape({
  advancedType: Yup.string().optional(),
  mode : Yup.string().optional()
});

interface bodyReq {
  advancedType : string
  mode : string
}

const AdvancedForm = (props: Props) => {
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(criteriaScheme),
    defaultValues: { advancedType : 'oee', mode : 'mode1'},
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting }, 
  } = methods

  const onModeChange = (valMode:string) => {
    setValue('mode',valMode)
    dispatch(setModeView(valMode));
    
  }
  const onAdvancedChange = (valAdv:string) => {
    setValue('advancedType',valAdv)
    dispatch(setAdvancedType(valAdv))
    
  }
  const onSubmit = (values:any) => {
    console.log('values=>',values);

  }

  return (
    <>
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container>
        <Grid item xs={12} sm={6}></Grid>
          <Grid item xs={12} sm={6} sx={{ display: 'flex', flexDirection: 'column', alignItems:'end', gap: '1.2em' }}>
            <RHFSelect
              name="advancedType"
              label="Advanced Type"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              size="small"
              onChange={(event) => onAdvancedChange(event.target.value)}
             
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body1',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>
              <Divider />
              {ADVANCED_TYPE.map((item) => (
                <MenuItem
                  key={item.key}
                  value={item.key}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body1',
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect
              name="mode"
              label="Mode"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ native: false }}
              size="small"
              onChange={(event) => onModeChange(event.target.value)}
            
            >
              <MenuItem
                value={-1}
                sx={{
                  mx: 1,
                  borderRadius: 0.75,
                  typography: 'body1',
                  fontStyle: 'italic',
                  color: 'text.secondary',
                }}
              >
                None
              </MenuItem>
              <Divider />
              {modeList.map((item) => (
                <MenuItem
                  key={item.key}
                  value={item.key}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 0.75,
                    typography: 'body1',
                  }}
                >
                  {item.name}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};

export default AdvancedForm;
