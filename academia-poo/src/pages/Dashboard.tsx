import React from 'react';
import { AppState, Usuario } from '../types';

interface Props { state: AppState; usuario: Usuario; }

export const Dashboard: React.FC<Props> = ({ state, usuario }) => {
  const totalAlunos = state.alunos.length;
  const totalInstrutores = state.instrutores.length;
  const totalAcademias = state.academias.length;
  const mensalidadesPagas = state.mensalidades.filter(m => m.status === 'Pago');
  const mensalidadesAtrasadas = state.mensalidades.filter(m => m.status === 'Atrasado');
  const receita = mensalidadesPagas.reduce((s, m) => s + m.valor, 0);

  const stats = [
    { icon: 'ti-users', label: 'Alunos', value: totalAlunos, bg: '#ede7f6', color: '#4527a0' },
    { icon: 'ti-user-star', label: 'Instrutores', value: totalInstrutores, bg: '#e3f2fd', color: '#1565c0' },
    { icon: 'ti-building', label: 'Academias', value: totalAcademias, bg: '#e8f5e9', color: '#2e7d32' },
    { icon: 'ti-currency-dollar', label: 'Receita', value: `R$ ${receita.toFixed(0)}`, bg: '#e8f5e9', color: '#2e7d32' },
  ];

  const atrasadasComAluno = mensalidadesAtrasadas.map(m => ({
    ...m, aluno: state.alunos.find(a => a.id === m.alunoId),
  }));

  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const proxVenc = state.mensalidades
    .filter(m => m.status === 'Pendente')
    .map(m => ({ ...m, aluno: state.alunos.find(a => a.id === m.alunoId), dias: Math.round((new Date(m.vencimento + 'T00:00:00').getTime() - hoje.getTime()) / 86400000) }))
    .filter(m => m.dias >= 0 && m.dias <= 7)
    .sort((a, b) => a.dias - b.dias);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Olá, {usuario.nome.split(' ')[0]} 👋</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          {usuario.academiaId
            ? `Você está gerenciando a academia #${usuario.academiaId}`
            : `Visão geral de ${usuario.empresaNome ?? 'todas as unidades'}`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><i className={`ti ${s.icon}`} style={{ color: s.color }} /></div>
            <div><div className="stat-num">{s.value}</div><div className="stat-lbl">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header" style={{ background: '#fff8f8' }}>
            <h3 style={{ color: '#c62828' }}><i className="ti ti-alert-triangle" /> Mensalidades Atrasadas ({mensalidadesAtrasadas.length})</h3>
          </div>
          <div style={{ padding: '0' }}>
            {atrasadasComAluno.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>✅ Nenhuma mensalidade em atraso</div>
              : atrasadasComAluno.map(m => {
                const dias = Math.round((hoje.getTime() - new Date(m.vencimento + 'T00:00:00').getTime()) / 86400000);
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #fef0f0' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{m.aluno?.nome ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#e53935' }}>{dias}d em atraso</div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#c62828' }}>R$ {m.valor.toFixed(2)}</span>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ background: '#fffde7' }}>
            <h3 style={{ color: '#f57f17' }}><i className="ti ti-clock" /> Vencendo em 7 dias ({proxVenc.length})</h3>
          </div>
          <div>
            {proxVenc.length === 0
              ? <div style={{ padding: '24px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>Nenhum vencimento próximo</div>
              : proxVenc.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #fffde7' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{m.aluno?.nome ?? '—'}</div>
                    <div style={{ fontSize: 11, color: '#f9a825' }}>{m.dias === 0 ? 'Vence hoje' : `${m.dias}d restantes`}</div>
                  </div>
                  <span style={{ fontWeight: 700 }}>R$ {m.valor.toFixed(2)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card" style={{ gridColumn: '1/-1' }}>
          <div className="card-header"><h3><i className="ti ti-building" /> Ocupação das Academias</h3></div>
          <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12 }}>
            {state.academias.map(a => {
              const qtd = state.alunos.filter(al => al.academiaId === a.id).length;
              const pct = a.capacidade ? Math.round((qtd / a.capacidade) * 100) : 0;
              return (
                <div key={a.id} style={{ padding: '12px 14px', background: '#f9f9fb', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{a.nome}</div>
                  <div style={{ height: 8, background: '#e0e0e0', borderRadius: 99, marginBottom: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 80 ? '#e53935' : '#7F77DD', borderRadius: 99, transition: 'width .3s' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>{qtd} / {a.capacidade} alunos ({pct}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
