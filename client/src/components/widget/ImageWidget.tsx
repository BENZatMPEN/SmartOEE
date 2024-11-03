import { useEffect, useState } from 'react';
import { ImageWidgetProps, ImageWidgetValue } from '../../@types/imageWidget';
import { ReadItem } from '../../@types/tagRead';
import { Widget } from '../../@types/widget';
import useWidgetDialog from '../../hooks/useWidgetDialog';
import Emitter from '../../utils/emitter';
import Image from '../Image';
import ImageWidgetDialog from './ImageWidgetDialog';
import { SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

interface Props {
  widget: Widget;
  sx?: SxProps<Theme>;
  canEdit?: boolean;
  open?: boolean;
  onClose?: VoidFunction;
  onSave?: (widget: Widget) => void;
}

export default function ImageWidget({ widget, canEdit, open, onClose, onSave, ...other }: Props) {
  const widgetProps: ImageWidgetProps = {
    deviceId: widget.deviceId,
    tagId: widget.tagId,
    imageValues: (widget.data ? widget.data : []) as ImageWidgetValue[],
  };

  const { setWidgetDialog } = useWidgetDialog();

  const [tagValue, setTagValue] = useState<string>(!widget || widget.id === 0 ? '0' : '-1');

  const canOpenDialog = canEdit && open && onClose && onSave;

  const handleDialogSave = (props: ImageWidgetProps) => {
    const { deviceId, tagId, imageValues } = props;
    if (onSave && onClose) {
      onSave({
        ...widget,
        deviceId: deviceId !== -1 ? deviceId : null,
        tagId: tagId !== -1 ? tagId : null,
        data: imageValues,
      });
      onClose();
    }
  };

  useEffect(() => {
    console.log('widget', widget);
    const mapRead = (tag: ReadItem) => {
      if (!tag) {
        return;
      }
      console.log('widget tag', tag);
      setTagValue(tag.read);
    };

    const emitter = Emitter.on(`tagReads_${widget.tagId}`, mapRead);

    return () => {
      emitter.off(`tagReads_${widget.tagId}`, mapRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open && canOpenDialog) {
      setWidgetDialog(
        <ImageWidgetDialog widgetProps={widgetProps} open={open} onClose={onClose} onSave={handleDialogSave} />,
      );
    } else {
      setWidgetDialog(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {widgetProps.imageValues
        .filter((item) => item.value === tagValue)
        .map((item) => {
          // TODO: change to proper mime
          return <Image key={item.value} src={`data:image/jpeg;base64,${item.image}`} {...other} />;
        })}
    </>
  );
}
