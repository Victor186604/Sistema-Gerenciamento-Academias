import { useState, useEffect, useCallback } from 'react';
import { SuperAdminState, Empresa, Usuario } from '../types';
import { api } from '../services/api';

const estadoVazio: SuperAdminState = { empresas: [], usuarios: [], nextId: {} };

export function useSuperAdmin() {
  const [state, setState] = useState<SuperAdminState>(estadoVazio);

  const carregar = useCallback(async () => {
    try {
      const empresas = await api.empresas.listar();
      setState(p => ({ ...p, empresas }));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const adicionarEmpresa = async (d: Omit<Empresa, 'id' | 'totalAcademias' | 'totalAlunos' | 'mensalidadesAtrasadas' | 'receitaTotal'>) => {
    const nova = await api.empresas.criar(d);
    setState(p => ({ ...p, empresas: [...p.empresas, nova] }));
  };

  const editarEmpresa = async (id: number, d: Partial<Empresa>) => {
    const atualizada = await api.empresas.editar(id, d);
    setState(p => ({ ...p, empresas: p.empresas.map(e => e.id === id ? atualizada : e) }));
  };

  const toggleEmpresa = async (id: number) => {
    const empresa = state.empresas.find(e => e.id === id);
    if (!empresa) return;
    await editarEmpresa(id, { ativa: !empresa.ativa });
  };

  const deletarEmpresa = async (id: number) => {
    await api.empresas.excluir(id);
    setState(p => ({ ...p, empresas: p.empresas.filter(e => e.id !== id) }));
  };

  const adicionarUsuario = (d: Omit<Usuario, 'id'>) => {
    console.warn('Criar usuário via API ainda não implementado', d);
  };

  const editarUsuario = (id: number, d: Partial<Usuario>) => {
    console.warn('Editar usuário via API ainda não implementado', id, d);
  };

  const toggleUsuario   = (id: number) => console.warn('Toggle usuário não implementado', id);
  const deletarUsuario  = (id: number) => console.warn('Deletar usuário não implementado', id);

  return {
    state,
    adicionarEmpresa, editarEmpresa, toggleEmpresa, deletarEmpresa,
    adicionarUsuario, editarUsuario, toggleUsuario, deletarUsuario,
  };
}
