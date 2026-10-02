import React, { useState } from 'react';
import { Aluno, AppState } from '../types';
import { Avatar, Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Aluno, 'id' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Aluno, 'id' | 'empresaId'>) => void;
  onDelete: (id: number) => string | null;
  toast: (msg: string, type?: 'success' | 'error') => void;
  readOnly?: boolean;
}

const empty = { nome: '', idade: '', cpf: '', matricula: '', telefone: '', treinoId: '', academiaId: '' };

export const Alunos: React.FC<Props> = ({ state, onAdd, onEdit, onDelete, toast, readOnly }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Aluno | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (a: Aluno) => {
    setEditing(a);
    setForm({ nome: a.nome, idade: String(a.idade), cpf: a.cpf, matricula: a.matricula, telefone: a.telefone, treinoId: String(a.treinoId || ''), academiaId: String(a.academiaId || '') });
    setModal(true);
  };

  const salvar = () => {
    try {
      if (!form.nome || !form.cpf || !form.matricula) { toast('Preencha nome, CPF e matrícula', 'error'); return; }
      const dados: Omit<Aluno, 'id' | 'empresaId'> = { nome: form.nome, idade: parseInt(form.idade) || 0, cpf: form.cpf, matricula: form.matricula, telefone: form.telefone, treinoId: parseInt(form.treinoId) || null, academiaId: parseInt(form.academiaId) || null };
      editing ? onEdit(editing.id, dados) : onAdd(dados);
      toast(editing ? 'Aluno atualizado!' : 'Aluno cadastrado!');
      setModal(false);
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const handleDelete = (id: number) => {
    const err = onDelete(id);
    if (err) { toast(err, 'error'); } else { toast('Aluno e mensalidades excluídos.'); }
    setConfirm(null);
  };

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));
  const filtered = state.alunos.filter(a => !search || a.nome.toLowerCase().includes(search.toLowerCase()) || a.cpf.includes(search) || a.matricula.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {!readOnly && (
        <div className="topbar-action">
          <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Novo aluno</Button>
        </div>
      )}
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, CPF ou matrícula..." />
      <Card>
        <table>
          <thead><tr><th>Aluno</th><th>CPF</th><th>Matrícula</th><th>Telefone</th><th>Treino</th><th>Academia</th>{!readOnly && <th></th>}</tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={readOnly ? 6 : 7}><EmptyState icon="users" label="Nenhum aluno encontrado" /></td></tr>
              : filtered.map(a => {
                const t = state.treinos.find(t => t.id === a.treinoId);
                const ac = state.academias.find(ac => ac.id === a.academiaId);
                return (
                  <tr key={a.id}>
                    <td><div className="person-cell"><Avatar nome={a.nome} /><div><div style={{ fontWeight: 500 }}>{a.nome}</div><div style={{ fontSize: 11, color: '#888' }}>{a.idade} anos</div></div></div></td>
                    <td style={{ color: '#888', fontSize: 12 }}>{a.cpf}</td>
                    <td><span className="badge bg-purple">{a.matricula}</span></td>
                    <td style={{ fontSize: 12, color: '#888' }}>{a.telefone || '—'}</td>
                    <td style={{ fontSize: 12 }}>{t ? t.nome.split('–')[0].trim() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{ac ? ac.nome : '—'}</td>
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
        <Modal title={<><i className="ti ti-users" style={{ color: '#7F77DD' }} /> {editing ? 'Editar aluno' : 'Novo aluno'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Nome"><input value={form.nome} onChange={F('nome')} placeholder="Nome completo" /></FormGroup>
          <div className="form-row">
            <FormGroup label="Idade"><input type="number" value={form.idade} onChange={F('idade')} placeholder="25" /></FormGroup>
            <FormGroup label="CPF"><input value={form.cpf} onChange={F('cpf')} placeholder="000.000.000-00" /></FormGroup>
          </div>
          <div className="form-row">
            <FormGroup label="Matrícula"><input value={form.matricula} onChange={F('matricula')} placeholder="MAT-004" /></FormGroup>
            <FormGroup label="Telefone"><input value={form.telefone} onChange={F('telefone')} placeholder="(92) 99999-0000" /></FormGroup>
          </div>
          <FormGroup label="Treino">
            <select value={form.treinoId} onChange={F('treinoId')}>
              <option value="">Sem treino</option>
              {state.treinos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </FormGroup>
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
          message="Tem certeza que deseja excluir este aluno? As mensalidades pagas também serão removidas."
          onConfirm={() => handleDelete(confirm)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
