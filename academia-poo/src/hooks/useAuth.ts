import { useState } from 'react';
import { Usuario } from '../types';
import { api } from '../services/api';

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const login = async (email: string, senha: string) => {
    setCarregando(true);
    setErro('');
    try {
      const { token, usuario: u } = await api.login(email, senha);
      localStorage.setItem('fitlife_token', token);
      setUsuario(u);
      return true;
    } catch (e: any) {
      setErro(e.message || 'Erro ao conectar. Verifique se a API está rodando.');
      return false;
    } finally {
      setCarregando(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fitlife_token');
    setUsuario(null);
  };

  return { usuario, login, logout, erro, carregando };
}
