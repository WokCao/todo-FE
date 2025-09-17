/** Authentication */
import api from './Interceptor';

export const login = async (email: string, password: string) => {
  const response = await api.post(`/auth/login`, { email, password });
  return response.data;
}

export const register = async (fullname: string, email: string, password: string) => {
  const response = await api.post(`/auth/register`, { fullname, email, password });
  return response.data;
}

export const fetchUserProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
}
