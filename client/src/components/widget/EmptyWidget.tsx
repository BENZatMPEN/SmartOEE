import { useEffect, useState } from 'react';
import { ImageWidgetProps, ImageWidgetValue } from '../../@types/imageWidget';
import { ReadItem } from '../../@types/tagRead';
import { Widget } from '../../@types/widget';
import useWidgetDialog from '../../hooks/useWidgetDialog';
import Emitter from '../../utils/emitter';
import Image from '../Image';
import ImageWidgetDialog from './ImageWidgetDialog';

interface Props {
  widget: Widget;
  canEdit?: boolean;
  open?: boolean;
  onClose?: VoidFunction;
  onSave?: (widget: Widget) => void;
}

export default function EmptyWidget(props: Props) {
  return <></>;
}
