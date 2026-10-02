import React, { useState } from 'react';
import { Instrutor, AppState } from '../types';
import { Avatar, Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Instrutor, 'id' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Instrutor, 'id' | 'empresaId'>) => void;
  onDelete: (entity: any, id: number) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

const empty = { nome: '', idade: '', cpf: '', especialidade: '', academiaId: '' };

export const Instrutores: React.FC<Props> = ({ state, onAdd, onEdit, onDelete, toast }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Instrutor | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (i: Instrutor) => {
    setEditing(i);
    setForm({ nome: i.nome, idade: String(i.idade), cpf: i.cpf, especialidade: i.especialidade, academiaId: String(i.academiaId || '') });
    setModal(true);
  };

  const salvar = () => {
    try {
      if (!form.nome || !form.cpf) { toast('Preencha nome e CPF', 'error'); return; }
      const dados: Omit<Instrutor, 'id' | 'empresaId'> = { nome: form.nome, idade: parseInt(form.idade) || 0, cpf: form.cpf, especialidade: form.especialidade, academiaId: parseInt(form.academiaId) || null };
      editing ? onEdit(editing.id, dados) : onAdd(dados);
      toast(editing ? 'Instrutor atualizado!' : 'Instrutor cadastrado!');
      setModal(false);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = state.instrutores.filter(i => !search || i.nome.toLowerCase().includes(search.toLowerCase()) || i.especialidade.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="topbar-action">
        <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Novo instrutor</Button>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou especialidade..." />
      <Card>
        <table>
          <thead><tr><th>Instrutor</th><th>CPF</th><th>Especialidade</th><th>Academia</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5}><EmptyState icon="user-star" label="Nenhum instrutor encontrado" /></td></tr>
              : filtered.map(i => {
                const ac = state.academias.find(a => a.id === i.academiaId);
                return (
                  <tr key={i.id}>
                    <td><div className="person-cell"><Avatar nome={i.nome} /><div><div style={{ fontWeight: 500 }}>{i.nome}</div><div style={{ fontSize: 11, color: '#888' }}>{i.idade} anos</div></div></div></td>
                    <td style={{ color: '#888', fontSize: 12 }}>{i.cpf}</td>
                    <td><span className="badge bg-blue">{i.especialidade}</span></td>
                    <td style={{ fontSize: 12 }}>{ac ? ac.nome : '—'}</td>
                    <td><div className="action-btns">
                      <IconBtn variant="edit" onClick={() => openEdit(i)}><i className="ti ti-edit" /></IconBtn>
                      <IconBtn variant="del" onClick={() => setConfirm(i.id)}><i className="ti ti-trash" /></IconBtn>
                    </div></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={<><i className="ti ti-user-star" style={{ color: '#7F77DD' }} /> {editing ? 'Editar instrutor' : 'Novo instrutor'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Nome"><input value={form.nome} onChange={F('nome')} placeholder="Nome completo" /></FormGroup>
          <div className="form-row">
            <FormGroup label="Idade"><input type="number" value={form.idade} onChange={F('idade')} placeholder="30" /></FormGroup>
            <FormGroup label="CPF"><input value={form.cpf} onChange={F('cpf')} placeholder="000.000.000-00" /></FormGroup>
          </div>
          <FormGroup label="Especialidade"><input value={form.especialidade} onChange={F('especialidade')} placeholder="Ex: Musculação, Yoga..." /></FormGroup>
          <FormGroup label="Academia">
            <select value={form.academiaId} onChange={F('academiaId')}>
              <option value="">Selecione</option>
              {state.academias.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </FormGroup>
          <ModalFooter onClose={() => setModal(false)} onSave={salvar} saveLabel={editing ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal
          message="Deseja excluir este instrutor? Treinos vinculados perderão a referência."
          onConfirm={() => { onDelete('instrutores', confirm); toast('Instrutor excluído.'); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
