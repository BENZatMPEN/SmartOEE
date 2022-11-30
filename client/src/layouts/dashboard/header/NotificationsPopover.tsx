import { useNavigate } from 'react-router-dom';
import { IconButtonAnimate } from '../../../components/animate';
import Iconify from '../../../components/Iconify';
import { PATH_HISTORY } from '../../../routes/paths';

export default function NotificationsPopover() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(PATH_HISTORY.root);
  };

  return (
    <>
      <IconButtonAnimate color="default" onClick={handleClick} sx={{ width: 40, height: 40 }}>
        <Iconify icon="eva:bell-fill" width={30} height={30} />
      </IconButtonAnimate>
    </>
  );
}
