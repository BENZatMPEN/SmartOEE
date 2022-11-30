import { createContext, ElementType, ReactNode, useState } from 'react';

export type WidgetDialogContextProps = {
  // allWidgetDialogs: WidgetDialog[];
  // selectedWidgetDialog: WidgetDialog | null;
  // onChange: (id: number) => void;
  // refreshWidgetDialogs: VoidFunction;
  // widgetDialog: ReactNode;
  setWidgetDialog: (widgetDialog: ReactNode | null) => void;
};

const initialState: WidgetDialogContextProps = {
  // allWidgetDialogs: [],
  // selectedWidgetDialog: null,
  // onChange: (id: number) => {},
  setWidgetDialog: (widgetDialog: ReactNode | null) => {},
};

const WidgetDialogContext = createContext(initialState);

type WidgetDialogProviderProps = {
  children: ReactNode;
};

function WidgetDialogProvider({ children }: WidgetDialogProviderProps) {
  const [dialog, setDialog] = useState<ReactNode | null>(null);

  const setWidgetDialog = (widgetDialog: ReactNode | null) => {
    setDialog(widgetDialog);
  };
  // const [selectedWidgetDialog, setSelectedWidgetDialog] = useState<WidgetDialog | null>(null);
  //
  // const [allWidgetDialogs, setAllWidgetDialogs] = useState<WidgetDialog[]>([]);
  //
  // const setAxiosWidgetDialogId = (siteId: number) => {
  //   axios.defaults.params = { siteId };
  // };
  //
  // useEffect(() => {
  //   (async () => {
  //     const response = await axios.get<WidgetDialog[]>(`/sites/all`);
  //     const sites = response.data;
  //     setAllWidgetDialogs(sites);
  //
  //     if (sites.length > 0) {
  //       const selectedWidgetDialogId = localStorage.getItem('selectedWidgetDialogId');
  //       if (selectedWidgetDialogId) {
  //         const filtered = sites.filter((site) => site.id === Number(selectedWidgetDialogId));
  //         changeSelectedWidgetDialog(filtered[0]);
  //       } else {
  //         changeSelectedWidgetDialog(sites[0]);
  //       }
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  //
  // const changeSelectedWidgetDialog = (site: WidgetDialog): void => {
  //   localStorage.setItem('selectedWidgetDialogId', String(site.id));
  //   setAxiosWidgetDialogId(site.id);
  //   setSelectedWidgetDialog(site);
  // };
  //
  // const handleOnChange = (id: number) => {
  //   localStorage.setItem('selectedWidgetDialogId', String(id));
  //   window.location.reload();
  // };
  //
  // const refreshWidgetDialogs = () => {
  //   window.location.reload();
  // };

  return (
    <WidgetDialogContext.Provider
      value={{
        setWidgetDialog,
        // widgetDialog
        // DialogComponent
        // allWidgetDialogs,
        // selectedWidgetDialog,
        // onChange: handleOnChange,
        // refreshWidgetDialogs,
      }}
    >
      {dialog}
      {children}
    </WidgetDialogContext.Provider>
  );
}

export { WidgetDialogProvider, WidgetDialogContext };
