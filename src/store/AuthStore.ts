import type { User } from "@/interfaces/types"

/** Store user info after login */
export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
}

export type AuthAction =
  | { type: "LOGIN"; payload: { token: string; user: AuthState["user"] } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: AuthState["user"] }

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}