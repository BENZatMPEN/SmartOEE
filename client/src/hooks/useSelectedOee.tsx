import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Oee } from '../@types/oee';
import { OeeBatch, OeeBatchA, OeeBatchP, OeeBatchQ, OeeStats, OeeBatchStatusLog } from '../@types/oeeBatch';
import { initialOeeStats } from '../constants';
import axios from '../utils/axios';
import useQuery from './useQuery';

export type SelectedOeeContextProps = {
  selectedOee: Oee | null;
  selectedBatch: OeeBatch | null;
  oeeBatchAs: OeeBatchA[];
  oeeBatchPs: OeeBatchP[];
  oeeBatchQs: OeeBatchQ[];
  oeeStatus: OeeStats;
  batchStatusLogs: OeeBatchStatusLog[];
  canEditA: boolean;
  canEditP: boolean;
  canEditQ: boolean;
  canUpdate: boolean;
  onBatchUpdated: (simple?: boolean) => void;
  onEnableEditingBatch: VoidFunction;
};

const initialState: SelectedOeeContextProps = {
  selectedOee: null,
  selectedBatch: null,
  oeeBatchAs: [],
  oeeBatchPs: [],
  oeeBatchQs: [],
  oeeStatus: initialOeeStats,
  batchStatusLogs: [],
  canEditA: false,
  canEditP: false,
  canEditQ: false,
  canUpdate: false,
  onBatchUpdated: (simple?: boolean) => {},
  onEnableEditingBatch: () => {},
};

const SelectedOeeContext = createContext(initialState);

type SelectedOeeProviderProps = {
  children: ReactNode;
};

function SelectedOeeProvider({ children }: SelectedOeeProviderProps) {
  const { id } = useParams();

  const query = useQuery();

  const [selectedOee, setSelectedOee] = useState<Oee | null>(null);

  const [oeeStatus, setOeeStatus] = useState<OeeStats>(initialOeeStats);

  const [oeeBatchAs, setOeeBatchAs] = useState<OeeBatchA[]>([]);

  const [oeeBatchPs, setOeeBatchPs] = useState<OeeBatchP[]>([]);

  const [oeeBatchQs, setOeeBatchQs] = useState<OeeBatchQ[]>([]);

  const [selectedBatch, setSelectedBatch] = useState<OeeBatch | null>(null);

  const [batchStatusLogs, setBatchStatusLogs] = useState<OeeBatchStatusLog[]>([]);

  const [canEditA, setCanEditA] = useState<boolean>(false);

  const [canEditP, setCanEditP] = useState<boolean>(false);

  const [canEditQ, setCanEditQ] = useState<boolean>(false);

  const [canUpdate, setCanUpdate] = useState<boolean>(false);

  const getLatestBatch = async (oee: Oee) => {
    try {
      const batchId = query.get('batchId');
      const url = batchId ? `/oee-batches/${batchId}?oeeId=${oee.id}` : `/oees/${oee.id}/latest-batch`;
      const response = await axios.get<OeeBatch>(url);
      const { data } = response;

      if (!batchId) {
        setCanUpdate(true);
      }

      if (data) {
        setSelectedBatch(data);
        setOeeStatus(data.oeeStats);

        await Promise.all([getAParams(data.id), getPParams(data.id), getQParams(data.id), getStatusLogs(data.id)]);
      } else {
        setSelectedBatch(null);
        setOeeStatus(initialOeeStats);
        setOeeBatchAs([]);
        setOeeBatchPs([]);
        setOeeBatchQs([]);
        setBatchStatusLogs([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getLatestSimpleBatch = async (oee: Oee) => {
    try {
      const response = await axios.get<OeeBatch>(`/oees/${oee.id}/latest-batch`);
      const oeeBatch = response.data;

      if (oeeBatch) {
        setSelectedBatch(oeeBatch);
        setOeeStatus(oeeBatch.oeeStats);
      } else {
        setSelectedBatch(null);
        setOeeStatus(initialOeeStats);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<Oee>(`/oees/${id}`);
        const oee = response.data;
        setSelectedOee(oee);
      } catch (error) {
        console.log(error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedOee) {
      return;
    }

    (async () => {
      await getLatestBatch(selectedOee);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOee]);

  useEffect(() => {
    if (!selectedBatch) {
      return;
    }

    setCanEditA(selectedBatch.batchStoppedDate === null);
    setCanEditP(selectedBatch.batchStoppedDate === null);
    setCanEditQ(selectedBatch.batchStoppedDate === null);

    return () => {
      setCanEditA(false);
      setCanEditP(false);
      setCanEditQ(false);
    };
  }, [selectedBatch]);

  const getAParams = async (oeeBatchId: number) => {
    const response = await axios.get<OeeBatchA[]>(`/oee-batches/${oeeBatchId}/a-params`);
    setOeeBatchAs(response.data);
  };

  const getPParams = async (oeeBatchId: number) => {
    const response = await axios.get<OeeBatchP[]>(`/oee-batches/${oeeBatchId}/p-params`);
    setOeeBatchPs(response.data);
  };

  const getQParams = async (oeeBatchId: number) => {
    const response = await axios.get<OeeBatchQ[]>(`/oee-batches/${oeeBatchId}/q-params`);
    setOeeBatchQs(response.data);
  };

  const getStatusLogs = async (oeeBatchId: number) => {
    const response = await axios.get<OeeBatchStatusLog[]>(`/oee-batches/${oeeBatchId}/status-logs`);
    setBatchStatusLogs(response.data);
  };

  const onBatchUpdated = (simple: boolean = false) => {
    if (!selectedOee) {
      return;
    }

    (async () => {
      if (simple) {
        await getLatestSimpleBatch(selectedOee);
        return;
      }

      await getLatestBatch(selectedOee);
    })();
  };

  const onEnableEditingBatch = () => {
    setCanEditA(true);
    setCanEditP(true);
    setCanEditQ(true);
  };

  return (
    <SelectedOeeContext.Provider
      value={{
        selectedOee,
        selectedBatch,
        oeeStatus,
        oeeBatchAs,
        oeeBatchPs,
        oeeBatchQs,
        batchStatusLogs,
        canEditA,
        canEditP,
        canEditQ,
        canUpdate,
        onBatchUpdated,
        onEnableEditingBatch,
      }}
    >
      {children}
    </SelectedOeeContext.Provider>
  );
}

export { SelectedOeeProvider, SelectedOeeContext };

const useSelectedOee = () => useContext(SelectedOeeContext);

export default useSelectedOee;
