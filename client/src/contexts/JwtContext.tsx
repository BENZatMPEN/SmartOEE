import jwtDecode from 'jwt-decode';
import { createContext, ReactNode, useEffect, useReducer } from 'react';
import { ActionMap, AuthState, AuthUser, JwtContextType, Token } from '../@types/auth';
import { PATH_AUTH } from '../routes/paths';
import axios from '../utils/axios';

enum Types {
  Initial = 'INITIALIZE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  // Register = 'REGISTER',
}

type JwtAuthPayload = {
  [Types.Initial]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [Types.Login]: {
    user: AuthUser;
  };
  [Types.Logout]: undefined;
  // [Types.Register]: {
  //   user: AuthUser;
  // };
};

export type JwtActions = ActionMap<JwtAuthPayload>[keyof ActionMap<JwtAuthPayload>];

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const JwtReducer = (state: AuthState, action: JwtActions) => {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    // case 'REGISTER':
    //   return {
    //     ...state,
    //     isAuthenticated: true,
    //     // user: action.payload.user,
    //   };

    default:
      return state;
  }
};

const AuthContext = createContext<JwtContextType | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  // const { enqueueSnackbar } = useSnackbar();

  const [state, dispatch] = useReducer(JwtReducer, initialState);

  const isValidToken = (accessToken: string) => {
    if (!accessToken) {
      return false;
    }
    const decoded = jwtDecode<{ exp: number }>(accessToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  };

  const handleTokenExpired = (exp: number) => {
    // let expiredTimer;
    //
    const currentTime = Date.now();

    // Test token expires after 10s
    // const timeLeft = currentTime + 10000 - currentTime; // ~10s
    const timeLeft = exp * 1000 - currentTime;

    if (timeLeft < 0) {
      // enqueueSnackbar('Token expired');

      localStorage.removeItem('accessToken');
      // TODO: change to the current url
      window.location.href = PATH_AUTH.login;
    }

    // if (expiredTimer) {
    //   clearTimeout(expiredTimer);
    // }
    //
    // expiredTimer = setTimeout(() => {
    //   alert('Token expired');
    //
    //   localStorage.removeItem('accessToken');
    //
    //   window.location.href = PATH_AUTH.login;
    // }, timeLeft);
  };

  const setSession = (accessToken: string | null) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

      // This function below will handle when token is expired
      const { exp } = jwtDecode<{ exp: number }>(accessToken); // ~3 days by minimals server
      handleTokenExpired(exp);
    } else {
      localStorage.removeItem('accessToken');
      // delete axios.defaults.headers.common.Authorization;
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          const response = await axios.get<AuthUser>('/auth/account');
          const user = response.data;

          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: true,
              user,
            },
          });
        } else {
          dispatch({
            type: Types.Initial,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: Types.Initial,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post<Token>('/auth/login', {
      email,
      password,
    });
    const { accessToken, user } = response.data;
    setSession(accessToken);

    dispatch({
      type: Types.Login,
      payload: {
        user,
      },
    });
  };

  // const register = async (email: string, password: string, firstName: string, lastName: string) => {
  //   const response = await axios.post('/api/account/register', {
  //     email,
  //     password,
  //     firstName,
  //     lastName,
  //   });
  //   const { accessToken, user } = response.data;
  //
  //   localStorage.setItem('accessToken', accessToken);
  //
  //   dispatch({
  //     type: Types.Register,
  //     payload: {
  //       user,
  //     },
  //   });
  // };

  const logout = async () => {
    setSession(null);
    dispatch({ type: Types.Logout });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        // register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
