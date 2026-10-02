import { useState, useEffect, useCallback } from 'react';
import { AppState } from '../types';
import { api } from '../services/api';

const estadoVazio: AppState = {
  academias: [], instrutores: [], exercicios: [],
  treinos: [], alunos: [], mensalidades: [],
  nextId: {},
};

export function useAcademia(_empresaId?: number, _academiaFiltro?: number | null) {
  const [state, setState] = useState<AppState>(estadoVazio);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [academias, instrutores, exercicios, treinos, alunos, mensalidades] = await Promise.all([
        api.academias.listar(),
        api.instrutores.listar(),
        api.exercicios.listar(),
        api.treinos.listar(),
        api.alunos.listar(),
        api.mensalidades.listar(),
      ]);
      setState({ academias, instrutores, exercicios, treinos: treinos.map((t: any) => ({ ...t, exIds: t.exercicio_ids ?? [] })), alunos, mensalidades, nextId: {} });
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const adicionarAcademia = async (d: any) => {
    const nova = await api.academias.criar(d);
    setState(p => ({ ...p, academias: [...p.academias, nova] }));
  };

  const editarAcademia = async (id: number, d: any) => {
    const atualizada = await api.academias.editar(id, d);
    setState(p => ({ ...p, academias: p.academias.map(a => a.id === id ? atualizada : a) }));
  };

  const adicionarInstrutor = async (d: any) => {
    const novo = await api.instrutores.criar(d);
    setState(p => ({ ...p, instrutores: [...p.instrutores, novo] }));
  };

  const editarInstrutor = async (id: number, d: any) => {
    const atualizado = await api.instrutores.editar(id, d);
    setState(p => ({ ...p, instrutores: p.instrutores.map(i => i.id === id ? atualizado : i) }));
  };

  const adicionarAluno = async (d: any) => {
    const novo = await api.alunos.criar(d);
    setState(p => ({ ...p, alunos: [...p.alunos, novo] }));
  };

  const editarAluno = async (id: number, d: any) => {
    const atualizado = await api.alunos.editar(id, d);
    setState(p => ({ ...p, alunos: p.alunos.map(a => a.id === id ? atualizado : a) }));
  };

  const deletarAluno = async (id: number): Promise<string | null> => {
    try {
      await api.alunos.excluir(id);
      setState(p => ({ ...p, alunos: p.alunos.filter(a => a.id !== id), mensalidades: p.mensalidades.filter(m => m.alunoId !== id) }));
      return null;
    } catch (e: any) {
      return e.message;
    }
  };

  const adicionarExercicio = async (d: any) => {
    const novo = await api.exercicios.criar(d);
    setState(p => ({ ...p, exercicios: [...p.exercicios, novo] }));
  };

  const editarExercicio = async (id: number, d: any) => {
    const atualizado = await api.exercicios.editar(id, d);
    setState(p => ({ ...p, exercicios: p.exercicios.map(e => e.id === id ? atualizado : e) }));
  };

  const adicionarTreino = async (d: any) => {
    const novo = await api.treinos.criar({ ...d, exercicio_ids: d.exIds });
    setState(p => ({ ...p, treinos: [...p.treinos, { ...novo, exIds: novo.exercicio_ids ?? [] }] }));
  };

  const editarTreino = async (id: number, d: any) => {
    const atualizado = await api.treinos.editar(id, { ...d, exercicio_ids: d.exIds });
    setState(p => ({ ...p, treinos: p.treinos.map(t => t.id === id ? { ...atualizado, exIds: atualizado.exercicio_ids ?? [] } : t) }));
  };

  const adicionarMensalidade = async (d: any) => {
    const nova = await api.mensalidades.criar(d);
    setState(p => ({ ...p, mensalidades: [...p.mensalidades, nova] }));
  };

  const editarMensalidade = async (id: number, d: any) => {
    const atualizada = await api.mensalidades.editar(id, d);
    setState(p => ({ ...p, mensalidades: p.mensalidades.map(m => m.id === id ? atualizada : m) }));
  };

  const pagarMensalidade = async (id: number) => {
    const atualizada = await api.mensalidades.pagar(id);
    setState(p => ({ ...p, mensalidades: p.mensalidades.map(m => m.id === id ? atualizada : m) }));
  };

  const deletar = async (entity: string, id: number) => {
    const mapa: Record<string, (id: number) => Promise<void>> = {
      academias:    api.academias.excluir,
      instrutores:  api.instrutores.excluir,
      exercicios:   api.exercicios.excluir,
      treinos:      api.treinos.excluir,
      mensalidades: api.mensalidades.excluir,
    };
    await mapa[entity]?.(id);
    setState(p => ({ ...p, [entity]: (p[entity as keyof AppState] as any[]).filter((i: any) => i.id !== id) }));
  };

  return {
    state, carregando,
    adicionarAcademia, editarAcademia,
    adicionarInstrutor, editarInstrutor,
    adicionarAluno, editarAluno, deletarAluno,
    adicionarExercicio, editarExercicio,
    adicionarTreino, editarTreino,
    adicionarMensalidade, editarMensalidade,
    pagarMensalidade, deletar,
  };
}
