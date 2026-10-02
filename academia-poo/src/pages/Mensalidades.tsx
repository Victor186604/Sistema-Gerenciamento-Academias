import React, { useState } from 'react';
import { Mensalidade, AppState } from '../types';
import { Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Mensalidade, 'id' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Mensalidade, 'id' | 'empresaId'>) => void;
  onPagar: (id: number) => void;
  onDelete: (entity: any, id: number) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

const empty = { alunoId: '', valor: '', vencimento: '', status: 'Pendente' as Mensalidade['status'] };
const statusCor: Record<string, string> = { Pago: 'bg-green', Pendente: 'bg-amber', Atrasado: 'bg-red' };
const statusIcon: Record<string, string> = { Pago: 'ti-check', Pendente: 'ti-clock', Atrasado: 'ti-alert-triangle' };

export const Mensalidades: React.FC<Props> = ({ state, onAdd, onEdit, onPagar, onDelete, toast }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Mensalidade | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (m: Mensalidade) => {
    setEditing(m);
    setForm({ alunoId: String(m.alunoId), valor: String(m.valor), vencimento: m.vencimento, status: m.status });
    setModal(true);
  };

  const salvar = () => {
    if (!form.alunoId || !form.valor || !form.vencimento) { toast('Preencha todos os campos', 'error'); return; }
    const dados: Omit<Mensalidade, 'id' | 'empresaId'> = { alunoId: parseInt(form.alunoId), valor: parseFloat(form.valor), vencimento: form.vencimento, status: form.status };
    editing ? onEdit(editing.id, dados) : onAdd(dados);
    toast(editing ? 'Mensalidade atualizada!' : 'Mensalidade lançada!');
    setModal(false);
  };

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = state.mensalidades.filter(m => {
    const aluno = state.alunos.find(a => a.id === m.alunoId);
    return (filtroStatus === 'Todos' || m.status === filtroStatus) &&
      (!search || aluno?.nome.toLowerCase().includes(search.toLowerCase()));
  });

  const totPago = state.mensalidades.filter(m => m.status === 'Pago').reduce((s, m) => s + m.valor, 0);
  const totAtrasado = state.mensalidades.filter(m => m.status === 'Atrasado').reduce((s, m) => s + m.valor, 0);

  return (
    <>
      <div className="topbar-action">
        <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Nova mensalidade</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e9' }}><i className="ti ti-check" style={{ color: '#2e7d32' }} /></div>
          <div><div className="stat-num" style={{ fontSize: 18 }}>R$ {totPago.toFixed(2)}</div><div className="stat-lbl">Recebido</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff8e1' }}><i className="ti ti-clock" style={{ color: '#f9a825' }} /></div>
          <div><div className="stat-num" style={{ fontSize: 18 }}>{state.mensalidades.filter(m => m.status === 'Pendente').length}</div><div className="stat-lbl">Pendentes</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ffebee' }}><i className="ti ti-alert-triangle" style={{ color: '#c62828' }} /></div>
          <div><div className="stat-num" style={{ fontSize: 18, color: '#c62828' }}>R$ {totAtrasado.toFixed(2)}</div><div className="stat-lbl">Em atraso</div></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por aluno..." />
        {['Todos', 'Pago', 'Pendente', 'Atrasado'].map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)}
            style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', border: '1px solid', borderColor: filtroStatus === s ? '#7F77DD' : '#ddd', background: filtroStatus === s ? '#7F77DD' : '#fff', color: filtroStatus === s ? '#fff' : '#555', transition: 'all .15s' }}>
            {s}
          </button>
        ))}
      </div>

      <Card>
        <table>
          <thead><tr><th>Aluno</th><th>Valor</th><th>Vencimento</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5}><EmptyState icon="receipt" label="Nenhuma mensalidade encontrada" /></td></tr>
              : filtered.map(m => {
                const aluno = state.alunos.find(a => a.id === m.alunoId);
                const venc = new Date(m.vencimento + 'T00:00:00');
                const hoje = new Date(); hoje.setHours(0,0,0,0);
                const dias = Math.round((venc.getTime() - hoje.getTime()) / 86400000);
                return (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{aluno?.nome ?? '—'}</td>
                    <td style={{ fontWeight: 600 }}>R$ {m.valor.toFixed(2)}</td>
                    <td>
                      <div>{venc.toLocaleDateString('pt-BR')}</div>
                      {m.status !== 'Pago' && (
                        <div style={{ fontSize: 11, color: dias < 0 ? '#c62828' : dias <= 5 ? '#e65100' : '#aaa' }}>
                          {dias < 0 ? `${Math.abs(dias)}d em atraso` : dias === 0 ? 'Vence hoje' : `${dias}d restantes`}
                        </div>
                      )}
                    </td>
                    <td><span className={`badge ${statusCor[m.status]}`}><i className={`ti ${statusIcon[m.status]}`} style={{ marginRight: 3 }} />{m.status}</span></td>
                    <td><div className="action-btns">
                      {m.status !== 'Pago' && (
                        <Button size="sm" variant="primary" onClick={() => { onPagar(m.id); toast('Mensalidade marcada como paga!'); }}>
                          <i className="ti ti-check" /> Pagar
                        </Button>
                      )}
                      <IconBtn variant="edit" onClick={() => openEdit(m)}><i className="ti ti-edit" /></IconBtn>
                      <IconBtn variant="del" onClick={() => setConfirm(m.id)}><i className="ti ti-trash" /></IconBtn>
                    </div></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={<><i className="ti ti-receipt" style={{ color: '#7F77DD' }} /> {editing ? 'Editar mensalidade' : 'Nova mensalidade'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Aluno">
            <select value={form.alunoId} onChange={F('alunoId')}>
              <option value="">Selecione</option>
              {state.alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </FormGroup>
          <div className="form-row">
            <FormGroup label="Valor (R$)"><input type="number" step="0.01" value={form.valor} onChange={F('valor')} placeholder="99.90" /></FormGroup>
            <FormGroup label="Vencimento"><input type="date" value={form.vencimento} onChange={F('vencimento')} /></FormGroup>
          </div>
          <FormGroup label="Status">
            <select value={form.status} onChange={F('status')}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Atrasado">Atrasado</option>
            </select>
          </FormGroup>
          <ModalFooter onClose={() => setModal(false)} onSave={salvar} saveLabel={editing ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal
          message="Deseja excluir esta mensalidade permanentemente?"
          onConfirm={() => { onDelete('mensalidades', confirm); toast('Mensalidade excluída.'); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
