import React, { useState } from 'react';
import { PageName } from './types';
import { useAuth } from './hooks/useAuth';
import { useAcademia } from './hooks/useAcademia';
import { useToast } from './hooks/useToast';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/UI';
import { Login } from './pages/Login';
import { SuperAdmin } from './pages/SuperAdmin';
import { Dashboard } from './pages/Dashboard';
import { Academias } from './pages/Academias';
import { Alunos } from './pages/Alunos';
import { Instrutores } from './pages/Instrutores';
import { Treinos } from './pages/Treinos';
import { Exercicios } from './pages/Exercicios';
import { Mensalidades } from './pages/Mensalidades';

const pageTitle: Record<PageName, [string, string]> = {
  dashboard:    ['Dashboard',     'Visão geral da academia'],
  academias:    ['Academias',     'Gerencie as unidades'],
  alunos:       ['Alunos',        'Gerencie os alunos matriculados'],
  instrutores:  ['Instrutores',   'Gerencie a equipe de instrutores'],
  treinos:      ['Treinos',       'Monte e gerencie os treinos'],
  exercicios:   ['Exercícios',    'Biblioteca de exercícios'],
  mensalidades: ['Mensalidades',  'Controle financeiro de mensalidades'],
};

export default function App() {
  const { usuario, login, logout, erro, carregando } = useAuth();
  const [page, setPage] = useState<PageName>('dashboard');

  if (!usuario) return <Login onLogin={login} erro={erro} carregando={carregando} />;
  if (usuario.papel === 'superadmin') return <SuperAdmin onLogout={logout} nomeAdmin={usuario.nome} />;

  return <AcademiaApp usuario={usuario} page={page} onNavigate={setPage} onLogout={logout} />;
}

interface AcademiaAppProps {
  usuario: any;
  page: PageName;
  onNavigate: (p: PageName) => void;
  onLogout: () => void;
}

function AcademiaApp({ usuario, page, onNavigate, onLogout }: AcademiaAppProps) {
  const {
    state, carregando,
    adicionarAcademia, editarAcademia,
    adicionarInstrutor, editarInstrutor,
    adicionarAluno, editarAluno, deletarAluno,
    adicionarExercicio, editarExercicio,
    adicionarTreino, editarTreino,
    adicionarMensalidade, editarMensalidade,
    pagarMensalidade, deletar,
  } = useAcademia(usuario.empresaId, usuario.academiaId);

  const { toasts, toast } = useToast();
  const isOperador = usuario.papel === 'operador';
  const [title, subtitle] = pageTitle[page];

  const toastAsync = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      toast(successMsg);
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const handleDelete = (_entity: string, id: number) =>
    toastAsync(() => deletar(_entity, id), 'Registro excluído.');

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12, color: '#888' }}>
        <i className="ti ti-loader" style={{ fontSize: 32 }} />
        <span>Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar current={page} onNavigate={onNavigate} usuario={usuario} onLogout={onLogout} />
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <div className="content">
          {page === 'dashboard' && <Dashboard state={state} usuario={usuario} />}

          {page === 'academias' && (
            <Academias
              state={state}
              onAdd={(d) => toastAsync(() => adicionarAcademia(d), 'Academia cadastrada!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarAcademia(id, d), 'Academia atualizada!')}
              onDelete={handleDelete}
              toast={toast}
              readOnly={isOperador}
            />
          )}

          {page === 'alunos' && (
            <Alunos
              state={state}
              onAdd={(d) => toastAsync(() => adicionarAluno(d), 'Aluno cadastrado!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarAluno(id, d), 'Aluno atualizado!')}
              onDelete={(id: number) => {
                deletarAluno(id).then(err => {
                  if (err) toast(err, 'error');
                  else toast('Aluno excluído.');
                });
                return null;
              }}
              toast={toast}
            />
          )}

          {page === 'instrutores' && (
            <Instrutores
              state={state}
              onAdd={(d) => toastAsync(() => adicionarInstrutor(d), 'Instrutor cadastrado!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarInstrutor(id, d), 'Instrutor atualizado!')}
              onDelete={handleDelete}
              toast={toast}
            />
          )}

          {page === 'treinos' && (
            <Treinos
              state={state}
              onAdd={(d) => toastAsync(() => adicionarTreino(d), 'Treino cadastrado!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarTreino(id, d), 'Treino atualizado!')}
              onDelete={handleDelete}
              toast={toast}
            />
          )}

          {page === 'exercicios' && (
            <Exercicios
              state={state}
              onAdd={(d) => toastAsync(() => adicionarExercicio(d), 'Exercício cadastrado!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarExercicio(id, d), 'Exercício atualizado!')}
              onDelete={handleDelete}
              toast={toast}
            />
          )}

          {page === 'mensalidades' && (
            <Mensalidades
              state={state}
              onAdd={(d) => toastAsync(() => adicionarMensalidade(d), 'Mensalidade lançada!')}
              onEdit={(id: number, d: any) => toastAsync(() => editarMensalidade(id, d), 'Mensalidade atualizada!')}
              onPagar={(id: number) => toastAsync(() => pagarMensalidade(id), 'Mensalidade paga!')}
              onDelete={handleDelete}
              toast={toast}
            />
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
