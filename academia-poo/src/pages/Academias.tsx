import React, { useState } from 'react';
import { Academia, AppState } from '../types';
import { Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Academia, 'id' | 'status' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Academia, 'id' | 'status' | 'empresaId'>) => void;
  onDelete: (entity: any, id: number) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
  readOnly?: boolean;
}

const empty = { nome: '', cidade: '', bairro: '', capacidade: '' };

export const Academias: React.FC<Props> = ({ state, onAdd, onEdit, onDelete, toast, readOnly }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Academia | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (a: Academia) => {
    setEditing(a);
    setForm({ nome: a.nome, cidade: a.cidade, bairro: a.bairro, capacidade: String(a.capacidade) });
    setModal(true);
  };

  const salvar = () => {
    if (!form.nome || !form.cidade) { toast('Preencha nome e cidade', 'error'); return; }
    const dados = { nome: form.nome, cidade: form.cidade, bairro: form.bairro, capacidade: parseInt(form.capacidade) || 0 };
    editing ? onEdit(editing.id, dados) : onAdd(dados);
    toast(editing ? 'Academia atualizada!' : 'Academia cadastrada!');
    setModal(false);
  };

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = state.academias.filter(a => !search || a.nome.toLowerCase().includes(search.toLowerCase()) || a.cidade.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {!readOnly && (
        <div className="topbar-action">
          <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Nova academia</Button>
        </div>
      )}
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou cidade..." />
      <Card>
        <table>
          <thead><tr><th>Nome</th><th>Cidade</th><th>Bairro</th><th>Capacidade</th><th>Alunos</th><th>Status</th>{!readOnly && <th></th>}</tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={readOnly ? 6 : 7}><EmptyState icon="building" label="Nenhuma academia encontrada" /></td></tr>
              : filtered.map(a => {
                const qtd = state.alunos.filter(al => al.academiaId === a.id).length;
                const pct = a.capacidade ? Math.round((qtd / a.capacidade) * 100) : 0;
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.nome}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{a.cidade}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{a.bairro || '—'}</td>
                    <td style={{ fontSize: 12 }}>{a.capacidade}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 80 ? '#e53935' : '#7F77DD', borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#888', minWidth: 32 }}>{qtd}/{a.capacidade}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${a.status === 'Ativa' ? 'bg-green' : 'bg-gray'}`}>{a.status}</span></td>
                    {!readOnly && (
                      <td><div className="action-btns">
                        <IconBtn variant="edit" onClick={() => openEdit(a)}><i className="ti ti-edit" /></IconBtn>
                        <IconBtn variant="del" onClick={() => setConfirm(a.id)}><i className="ti ti-trash" /></IconBtn>
                      </div></td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={<><i className="ti ti-building" style={{ color: '#7F77DD' }} /> {editing ? 'Editar academia' : 'Nova academia'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Nome da academia"><input value={form.nome} onChange={F('nome')} placeholder="Ex: FitLife Centro" /></FormGroup>
          <div className="form-row">
            <FormGroup label="Cidade"><input value={form.cidade} onChange={F('cidade')} placeholder="São Paulo" /></FormGroup>
            <FormGroup label="Bairro"><input value={form.bairro} onChange={F('bairro')} placeholder="Pinheiros" /></FormGroup>
          </div>
          <FormGroup label="Capacidade"><input type="number" value={form.capacidade} onChange={F('capacidade')} placeholder="150" /></FormGroup>
          <ModalFooter onClose={() => setModal(false)} onSave={salvar} saveLabel={editing ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal
          message="Deseja excluir esta academia? Alunos e instrutores vinculados perderão a referência."
          onConfirm={() => { onDelete('academias', confirm); toast('Academia excluída.'); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
