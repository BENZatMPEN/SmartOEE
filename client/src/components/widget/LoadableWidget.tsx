import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { ElementType, lazy, Suspense, useMemo, useState } from 'react';
import { Widget } from '../../@types/widget';

type Props = {
  widget: Widget;
  canEdit?: boolean;
  open?: boolean;
  onClose?: VoidFunction;
  onSave?: (widget: Widget) => void;
  sx?: SxProps<Theme>;
};

export const LoadableWidget = ({ widget, ...other }: Props) => {
  const componentWidget = useMemo(() => {
    if (widget.type === 'image') {
      return lazy(() => import('./ImageWidget'));
    }

    return lazy(() => import('./EmptyWidget'));
  }, [widget]);

  return Loadable(componentWidget)({ widget, ...other });
};

const Loadable = (Component: ElementType) => (props: any) => {
  return (
    <Suspense fallback={<></>}>
      <Component {...props} />
    </Suspense>
  );
};
