import React, { useState } from 'react';
import { Treino, AppState } from '../types';
import { Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Treino, 'id' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Treino, 'id' | 'empresaId'>) => void;
  onDelete: (entity: any, id: number) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

const empty = { nome: '', instrutorId: '', exIds: [] as number[] };

export const Treinos: React.FC<Props> = ({ state, onAdd, onEdit, onDelete, toast }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Treino | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (t: Treino) => {
    setEditing(t);
    setForm({ nome: t.nome, instrutorId: String(t.instrutorId || ''), exIds: [...t.exIds] });
    setModal(true);
  };

  const toggleEx = (id: number) => setForm(p => ({ ...p, exIds: p.exIds.includes(id) ? p.exIds.filter(x => x !== id) : [...p.exIds, id] }));

  const salvar = () => {
    if (!form.nome) { toast('Preencha o nome do treino', 'error'); return; }
    const dados: Omit<Treino, 'id' | 'empresaId'> = { nome: form.nome, instrutorId: parseInt(form.instrutorId) || null, exIds: form.exIds };
    editing ? onEdit(editing.id, dados) : onAdd(dados);
    toast(editing ? 'Treino atualizado!' : 'Treino cadastrado!');
    setModal(false);
  };

  const filtered = state.treinos.filter(t => !search || t.nome.toLowerCase().includes(search.toLowerCase()));

  const grupos = [...new Set(state.exercicios.map(e => e.grupo))];

  return (
    <>
      <div className="topbar-action">
        <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Novo treino</Button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar treino..." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14, marginTop: 12 }}>
        {filtered.length === 0
          ? <div style={{ gridColumn: '1/-1' }}><Card><EmptyState icon="clipboard-list" label="Nenhum treino encontrado" /></Card></div>
          : filtered.map(t => {
            const inst = state.instrutores.find(i => i.id === t.instrutorId);
            const exs = state.exercicios.filter(e => t.exIds.includes(e.id));
            return (
              <Card key={t.id}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.nome}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{inst ? `👤 ${inst.nome}` : 'Sem instrutor'}</div>
                  </div>
                  <div className="action-btns">
                    <IconBtn variant="edit" onClick={() => openEdit(t)}><i className="ti ti-edit" /></IconBtn>
                    <IconBtn variant="del" onClick={() => setConfirm(t.id)}><i className="ti ti-trash" /></IconBtn>
                  </div>
                </div>
                <div style={{ padding: '12px 16px' }}>
                  {exs.length === 0
                    ? <div style={{ fontSize: 12, color: '#bbb' }}>Nenhum exercício vinculado</div>
                    : exs.map(e => (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13 }}>
                        <span>{e.nome}</span>
                        <span style={{ color: '#888', fontSize: 11 }}>{e.series}x{e.reps}</span>
                      </div>
                    ))}
                  <div style={{ marginTop: 10, fontSize: 11, color: '#aaa' }}>{exs.length} exercício{exs.length !== 1 ? 's' : ''}</div>
                </div>
              </Card>
            );
          })}
      </div>

      {modal && (
        <Modal title={<><i className="ti ti-clipboard-list" style={{ color: '#7F77DD' }} /> {editing ? 'Editar treino' : 'Novo treino'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Nome do treino"><input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Treino A – Peito" /></FormGroup>
          <FormGroup label="Instrutor responsável">
            <select value={form.instrutorId} onChange={e => setForm(p => ({ ...p, instrutorId: e.target.value }))}>
              <option value="">Sem instrutor</option>
              {state.instrutores.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </FormGroup>
          <FormGroup label={`Exercícios (${form.exIds.length} selecionados)`}>
            <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, padding: 4 }}>
              {grupos.map(g => (
                <div key={g}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', padding: '6px 8px 2px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{g}</div>
                  {state.exercicios.filter(e => e.grupo === g).map(e => (
                    <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                      onMouseEnter={el => (el.currentTarget.style.background = '#f7f7f9')}
                      onMouseLeave={el => (el.currentTarget.style.background = 'transparent')}>
                      <input type="checkbox" checked={form.exIds.includes(e.id)} onChange={() => toggleEx(e.id)} style={{ accentColor: '#7F77DD' }} />
                      <span style={{ flex: 1 }}>{e.nome}</span>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{e.series}x{e.reps}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </FormGroup>
          <ModalFooter onClose={() => setModal(false)} onSave={salvar} saveLabel={editing ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal
          message="Deseja excluir este treino? Alunos vinculados perderão a referência."
          onConfirm={() => { onDelete('treinos', confirm); toast('Treino excluído.'); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
