import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { io, ManagerOptions, Socket, SocketOptions } from 'socket.io-client';
import { TagRead } from '../@types/tagRead';
import { HOST_API } from '../config';
import Emitter from '../utils/emitter';

export type WebSocketContextProps = {
  socket: Socket | null;
};

const initialState: WebSocketContextProps = {
  socket: null,
};

const WebSocketContext = createContext(initialState);

type SocketProviderProps = {
  children: ReactNode;
};

function WebSocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketOptions: Partial<SocketOptions & ManagerOptions> = {
      rejectUnauthorized: false,
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: localStorage.getItem('accessToken'),
          },
        },
      },
    };

    const socket = io(HOST_API, socketOptions);
    socket.on('disconnect', () => {});
    socket.on('connect', () => {});

    socket.io.on('reconnect_attempt', () => {
      console.log('reconnect_attempt');
    });

    socket.io.on('reconnect', () => {
      console.log('reconnect');
    });

    const updateTagRead = (data: TagRead) => {
      data.reads.forEach((tag) => {
        Emitter.emit(`tagReads_${tag.tagId}`, tag);
      });
    };

    socket.on(`tag-reads.updated`, updateTagRead);
    setSocket(socket);

    return () => {
      socket.off(`tag-reads.updated`, updateTagRead);
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export { WebSocketProvider, WebSocketContext };

const useWebSocket = () => useContext(WebSocketContext);

export default useWebSocket;
