import { useMemo, useEffect, useReducer, useCallback } from 'react'

import { endpoints, axiosInstance } from 'src/utils/axios'

import { AuthContext } from './auth-context'
import { setSession, isValidToken } from './utils'
import { AuthUserType, ActionMapType, AuthStateType } from '../../types'

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

enum Types {
  INITIAL = 'INITIAL',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  LOGOUT = 'LOGOUT'
}

type Payload = {
  [Types.INITIAL]: {
    user: AuthUserType
  }
  [Types.LOGIN]: {
    user: AuthUserType
  }
  [Types.REGISTER]: {
    user: AuthUserType
  }
  [Types.LOGOUT]: undefined
}

type ActionsType = ActionMapType<Payload>[keyof ActionMapType<Payload>]

// ----------------------------------------------------------------------

const initialState: AuthStateType = {
  user: null,
  loading: true
}

const reducer = (state: AuthStateType, action: ActionsType) => {
  switch (action.type) {
    case Types.INITIAL:
      return {
        loading: false,
        user: action.payload.user
      }
    case Types.LOGIN:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.REGISTER:
      return {
        ...state,
        user: action.payload.user
      }
    case Types.LOGOUT:
      return {
        ...state,
        user: null
      }
    default:
      return state
  }
}

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken'

type Props = {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEY)
      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken)

        dispatch({
          type: Types.INITIAL,
          payload: {
            user: {
              accessToken
            }
          }
        })
      } else {
        dispatch({
          type: Types.INITIAL,
          payload: {
            user: null
          }
        })
      }
    } catch (error) {
      console.error(error)
      dispatch({
        type: Types.INITIAL,
        payload: {
          user: null
        }
      })
    }
  }, [])

  useEffect(() => {
    initialize()
  }, [initialize])

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    const data = {
      email,
      password
    }
    const endPointForStag =
      'https://api-dev-minimal-v510.vercel.app/api/auth/login'
    const res = await axiosInstance.post(endPointForStag, data)

    const { accessToken, user } = res.data

    setSession(accessToken)

    dispatch({
      type: Types.LOGIN,
      payload: {
        user: {
          ...user,
          accessToken
        }
      }
    })
  }, [])

  // REGISTER
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      const data = {
        email,
        password,
        firstName,
        lastName
      }

      const res = await axiosInstance.post(endpoints.auth.register, data)

      const { accessToken, user } = res.data

      sessionStorage.setItem(STORAGE_KEY, accessToken)

      dispatch({
        type: Types.REGISTER,
        payload: {
          user: {
            ...user,
            accessToken
          }
        }
      })
    },
    []
  )

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null)
    dispatch({
      type: Types.LOGOUT
    })
  }, [])

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated'

  const status = state.loading ? 'loading' : checkAuthenticated

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout
    }),
    [login, logout, register, state.user, status]
  )

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  )
}
