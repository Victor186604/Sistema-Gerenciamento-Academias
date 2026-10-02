import React, { useState } from 'react';
import { Exercicio, AppState, GRUPOS } from '../types';
import { Card, Modal, ModalFooter, FormGroup, Button, IconBtn, SearchBar, EmptyState, ConfirmModal } from '../components/UI';

interface Props {
  state: AppState;
  onAdd: (d: Omit<Exercicio, 'id' | 'empresaId'>) => void;
  onEdit: (id: number, d: Omit<Exercicio, 'id' | 'empresaId'>) => void;
  onDelete: (entity: any, id: number) => void;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

const empty = { nome: '', grupo: 'Peito', series: '3', reps: '12' };

const grupoCor: Record<string, string> = {
  'Peito': 'bg-red', 'Costas': 'bg-blue', 'Pernas': 'bg-green',
  'Ombro': 'bg-purple', 'Bíceps': 'bg-teal', 'Tríceps': 'bg-orange',
  'Abdômen': 'bg-amber', 'Glúteos': 'bg-pink', 'Funcional': 'bg-gray',
};

export const Exercicios: React.FC<Props> = ({ state, onAdd, onEdit, onDelete, toast }) => {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Exercicio | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('Todos');
  const [confirm, setConfirm] = useState<number | null>(null);

  const openNew = () => { setEditing(null); setForm(empty); setModal(true); };
  const openEdit = (e: Exercicio) => {
    setEditing(e);
    setForm({ nome: e.nome, grupo: e.grupo, series: String(e.series), reps: String(e.reps) });
    setModal(true);
  };

  const salvar = () => {
    if (!form.nome) { toast('Preencha o nome do exercício', 'error'); return; }
    const dados = { nome: form.nome, grupo: form.grupo, series: parseInt(form.series) || 3, reps: parseInt(form.reps) || 12 };
    editing ? onEdit(editing.id, dados) : onAdd(dados);
    toast(editing ? 'Exercício atualizado!' : 'Exercício cadastrado!');
    setModal(false);
  };

  const F = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = state.exercicios.filter(e =>
    (grupoFiltro === 'Todos' || e.grupo === grupoFiltro) &&
    (!search || e.nome.toLowerCase().includes(search.toLowerCase()))
  );

  const grupos = ['Todos', ...GRUPOS];

  return (
    <>
      <div className="topbar-action">
        <Button variant="primary" onClick={openNew}><i className="ti ti-plus" /> Novo exercício</Button>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar exercício..." />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {grupos.map(g => (
            <button key={g} onClick={() => setGrupoFiltro(g)}
              style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, cursor: 'pointer', border: '1px solid', borderColor: grupoFiltro === g ? '#7F77DD' : '#ddd', background: grupoFiltro === g ? '#7F77DD' : '#fff', color: grupoFiltro === g ? '#fff' : '#555', transition: 'all .15s' }}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <table>
          <thead><tr><th>Exercício</th><th>Grupo Muscular</th><th>Séries</th><th>Repetições</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0
              ? <tr><td colSpan={5}><EmptyState icon="barbell" label="Nenhum exercício encontrado" /></td></tr>
              : filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.nome}</td>
                  <td><span className={`badge ${grupoCor[e.grupo] || 'bg-gray'}`}>{e.grupo}</span></td>
                  <td style={{ fontSize: 13 }}>{e.series}x</td>
                  <td style={{ fontSize: 13 }}>{e.reps}</td>
                  <td><div className="action-btns">
                    <IconBtn variant="edit" onClick={() => openEdit(e)}><i className="ti ti-edit" /></IconBtn>
                    <IconBtn variant="del" onClick={() => setConfirm(e.id)}><i className="ti ti-trash" /></IconBtn>
                  </div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </Card>

      {modal && (
        <Modal title={<><i className="ti ti-barbell" style={{ color: '#7F77DD' }} /> {editing ? 'Editar exercício' : 'Novo exercício'}</>} onClose={() => setModal(false)}>
          <FormGroup label="Nome do exercício"><input value={form.nome} onChange={F('nome')} placeholder="Ex: Supino Reto" /></FormGroup>
          <FormGroup label="Grupo muscular">
            <select value={form.grupo} onChange={F('grupo')}>
              {GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </FormGroup>
          <div className="form-row">
            <FormGroup label="Séries"><input type="number" value={form.series} onChange={F('series')} placeholder="3" /></FormGroup>
            <FormGroup label="Repetições"><input type="number" value={form.reps} onChange={F('reps')} placeholder="12" /></FormGroup>
          </div>
          <ModalFooter onClose={() => setModal(false)} onSave={salvar} saveLabel={editing ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm !== null && (
        <ConfirmModal
          message="Deseja excluir este exercício? Ele será removido dos treinos vinculados."
          onConfirm={() => { onDelete('exercicios', confirm); toast('Exercício excluído.'); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
};
