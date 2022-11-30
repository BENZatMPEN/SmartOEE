import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { ReadItem, TagRead } from '../@types/tagRead';
import Emitter from '../utils/emitter';

const RootStyle = styled('div')(({ theme }) => ({
  // padding: theme.spacing(3),
  // [theme.breakpoints.up(1368)]: {
  //   padding: theme.spacing(5, 8),
  // },
}));

interface IProps {
  tagId: number;
  onUpdate?: (read: string) => void;
}

export default function TagReader({ tagId, onUpdate, ...other }: IProps) {
  const [tagRead, setTagRead] = useState<ReadItem>({
    tagId: 0,
    read: '0',
  });

  useEffect(() => {
    const mapRead = (tag: ReadItem) => {
      setTagRead(tag);
      if (onUpdate) {
        onUpdate(tag.read);
      }
    };

    Emitter.on(`tagReads_${tagId}`, mapRead);

    return () => {
      Emitter.off(`tagReads_${tagId}`, mapRead);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <RootStyle {...other}>{tagRead.read}</RootStyle>;
}
