import { useContext } from 'react';
import { WidgetDialogContext } from '../contexts/WidgetDialogContext';

const useWidgetDialog = () => useContext(WidgetDialogContext);

export default useWidgetDialog;
