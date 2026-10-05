import React, { useState } from 'react';
import { Empresa, Usuario } from '../types';
import { Card, Modal, ModalFooter, FormGroup, Button, IconBtn, ConfirmModal, PlanoBadge, PaperBadge } from '../components/UI';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/UI';

interface Props { onLogout: () => void; nomeAdmin: string; }

type Tab = 'empresas' | 'usuarios';

const emptyEmpresa = { nome: '', cnpj: '', plano: 'basic' as Empresa['plano'], ativa: true };
const emptyUsuario = { empresaId: '' as unknown as number, empresaNome: '' as string | undefined, nome: '', email: '', papel: 'admin' as Usuario['papel'], academiaId: null as number | null, ativo: true };

export const SuperAdmin: React.FC<Props> = ({ onLogout, nomeAdmin }) => {
  const { state, adicionarEmpresa, editarEmpresa, toggleEmpresa, deletarEmpresa, adicionarUsuario, editarUsuario, toggleUsuario, deletarUsuario } = useSuperAdmin();
  const { toasts, toast } = useToast();
  const [tab, setTab] = useState<Tab>('empresas');
  const [modal, setModal] = useState<null | 'empresa' | 'usuario'>(null);
  const [editingE, setEditingE] = useState<Empresa | null>(null);
  const [editingU, setEditingU] = useState<Usuario | null>(null);
  const [formE, setFormE] = useState(emptyEmpresa);
  const [formU, setFormU] = useState(emptyUsuario);
  const [confirm, setConfirm] = useState<null | { msg: string; fn: () => void }>(null);

  const FE = (k: keyof typeof formE) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormE(p => ({ ...p, [k]: e.target.value }));
  const FU = (k: keyof typeof formU) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormU(p => ({ ...p, [k]: e.target.value }));

  const openNewEmpresa = () => { setEditingE(null); setFormE(emptyEmpresa); setModal('empresa'); };
  const openEditEmpresa = (e: Empresa) => { setEditingE(e); setFormE({ nome: e.nome, cnpj: e.cnpj, plano: e.plano, ativa: e.ativa }); setModal('empresa'); };
  const salvarEmpresa = () => {
    if (!formE.nome) return;
    editingE ? editarEmpresa(editingE.id, { ...formE }) : adicionarEmpresa({ ...formE });
    toast(editingE ? 'Empresa atualizada!' : 'Empresa cadastrada!');
    setModal(null);
  };

  const openNewUsuario = () => { setEditingU(null); setFormU(emptyUsuario); setModal('usuario'); };
  const openEditUsuario = (u: Usuario) => { setEditingU(u); setFormU({ ...u, empresaId: u.empresaId ?? '' as any, empresaNome: u.empresaNome ?? '' }); setModal('usuario'); };
  const salvarUsuario = () => {
    if (!formU.nome || !formU.email) return;
    const dados: Omit<Usuario, 'id'> = { ...formU, empresaId: Number(formU.empresaId) || null, empresaNome: state.empresas.find(e => e.id === Number(formU.empresaId))?.nome ?? '' };
    editingU ? editarUsuario(editingU.id, dados) : adicionarUsuario(dados);
    toast(editingU ? 'Usuário atualizado!' : 'Usuário cadastrado!');
    setModal(null);
  };

  const totalAtrasadas = state.empresas.reduce((s, e) => s + (e.mensalidadesAtrasadas ?? 0), 0);
  const totalAlunos = state.empresas.reduce((s, e) => s + (e.totalAlunos ?? 0), 0);
  const totalReceita = state.empresas.reduce((s, e) => s + (e.receitaTotal ?? 0), 0);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">
          <h1><i className="ti ti-shield" style={{ color: '#7F77DD' }} /> FitLife</h1>
          <p>Painel Super Admin</p>
        </div>
        <span className="nav-section">Gestão</span>
        <div className={`nav-item ${tab === 'empresas' ? 'active' : ''}`} onClick={() => setTab('empresas')}><i className="ti ti-building-store" /> Empresas</div>
        <div className={`nav-item ${tab === 'usuarios' ? 'active' : ''}`} onClick={() => setTab('usuarios')}><i className="ti ti-users" /> Usuários</div>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar av-purple" style={{ width: 28, height: 28, fontSize: 10 }}>SA</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.75)' }}>{nomeAdmin}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>Super Admin</div>
            </div>
            <button onClick={onLogout} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.4)', fontSize: 16 }}><i className="ti ti-logout" /></button>
          </div>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{tab === 'empresas' ? 'Empresas Clientes' : 'Usuários do Sistema'}</h2>
            <p>{tab === 'empresas' ? 'Gerencie todos os clientes da plataforma' : 'Gerencie admins e operadores'}</p>
          </div>
        </div>

        <div className="content">
          {tab === 'empresas' && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#ede7f6' }}><i className="ti ti-building-store" style={{ color: '#4527a0' }} /></div>
                  <div><div className="stat-num">{state.empresas.length}</div><div className="stat-lbl">Empresas</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e3f2fd' }}><i className="ti ti-users" style={{ color: '#1565c0' }} /></div>
                  <div><div className="stat-num">{totalAlunos}</div><div className="stat-lbl">Alunos totais</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: totalAtrasadas > 0 ? '#ffebee' : '#e8f5e9' }}><i className="ti ti-alert-triangle" style={{ color: totalAtrasadas > 0 ? '#c62828' : '#2e7d32' }} /></div>
                  <div><div className="stat-num" style={{ color: totalAtrasadas > 0 ? '#c62828' : 'inherit' }}>{totalAtrasadas}</div><div className="stat-lbl">Atrasadas</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e8f5e9' }}><i className="ti ti-currency-dollar" style={{ color: '#2e7d32' }} /></div>
                  <div><div className="stat-num" style={{ fontSize: 16 }}>R$ {totalReceita.toFixed(0)}</div><div className="stat-lbl">Receita total</div></div>
                </div>
              </div>

              <div className="topbar-action">
                <Button variant="primary" onClick={openNewEmpresa}><i className="ti ti-plus" /> Nova empresa</Button>
              </div>

              <Card>
                <table>
                  <thead><tr><th>Empresa</th><th>CNPJ</th><th>Plano</th><th>Academias</th><th>Alunos</th><th>Atrasadas</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {state.empresas.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.nome}</strong></td>
                        <td style={{ fontSize: 12, color: '#888' }}>{e.cnpj}</td>
                        <td><PlanoBadge plano={e.plano} /></td>
                        <td style={{ textAlign: 'center' }}>{e.totalAcademias}</td>
                        <td style={{ textAlign: 'center' }}>{e.totalAlunos}</td>
                        <td style={{ textAlign: 'center' }}>
                          {(e.mensalidadesAtrasadas ?? 0) > 0
                            ? <span className="badge bg-red">{e.mensalidadesAtrasadas}</span>
                            : <span style={{ color: '#aaa' }}>—</span>}
                        </td>
                        <td><span className={`badge ${e.ativa ? 'bg-green' : 'bg-red'}`}>{e.ativa ? 'Ativa' : 'Inativa'}</span></td>
                        <td><div className="action-btns">
                          <IconBtn variant="edit" onClick={() => openEditEmpresa(e)}><i className="ti ti-edit" /></IconBtn>
                          <Button size="sm" onClick={() => { toggleEmpresa(e.id); toast(e.ativa ? 'Empresa desativada.' : 'Empresa reativada.'); }} style={{ fontSize: 11 }}>
                            {e.ativa ? 'Desativar' : 'Ativar'}
                          </Button>
                          <IconBtn variant="del" onClick={() => setConfirm({ msg: `Deseja excluir "${e.nome}" e todos os seus dados?`, fn: () => { deletarEmpresa(e.id); toast('Empresa excluída.'); } })}><i className="ti ti-trash" /></IconBtn>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}

          {tab === 'usuarios' && (
            <>
              <div className="topbar-action">
                <Button variant="primary" onClick={openNewUsuario}><i className="ti ti-plus" /> Novo usuário</Button>
              </div>
              <Card>
                <table>
                  <thead><tr><th>Nome</th><th>E-mail</th><th>Empresa</th><th>Papel</th><th>Academia</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {state.usuarios.map(u => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.nome}</td>
                        <td style={{ fontSize: 12, color: '#888' }}>{u.email}</td>
                        <td style={{ fontSize: 12 }}>{u.empresaNome ?? '—'}</td>
                        <td><PaperBadge papel={u.papel} /></td>
                        <td style={{ fontSize: 12, color: '#888' }}>{u.academiaId ? `#${u.academiaId}` : 'Todas'}</td>
                        <td><span className={`badge ${u.ativo ? 'bg-green' : 'bg-gray'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                        <td><div className="action-btns">
                          <IconBtn variant="edit" onClick={() => openEditUsuario(u)}><i className="ti ti-edit" /></IconBtn>
                          <Button size="sm" onClick={() => { toggleUsuario(u.id); toast(u.ativo ? 'Usuário desativado.' : 'Usuário reativado.'); }} style={{ fontSize: 11 }}>
                            {u.ativo ? 'Desativar' : 'Ativar'}
                          </Button>
                          <IconBtn variant="del" onClick={() => setConfirm({ msg: `Deseja excluir o usuário "${u.nome}"?`, fn: () => { deletarUsuario(u.id); toast('Usuário excluído.'); } })}><i className="ti ti-trash" /></IconBtn>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </div>

      {modal === 'empresa' && (
        <Modal title={<><i className="ti ti-building-store" style={{ color: '#7F77DD' }} /> {editingE ? 'Editar empresa' : 'Nova empresa'}</>} onClose={() => setModal(null)}>
          <FormGroup label="Nome da empresa"><input value={formE.nome} onChange={FE('nome')} placeholder="Ex: Academia Alpha" /></FormGroup>
          <FormGroup label="CNPJ"><input value={formE.cnpj} onChange={FE('cnpj')} placeholder="00.000.000/0001-00" /></FormGroup>
          <FormGroup label="Plano">
            <select value={formE.plano} onChange={FE('plano')}>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </FormGroup>
          <ModalFooter onClose={() => setModal(null)} onSave={salvarEmpresa} saveLabel={editingE ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {modal === 'usuario' && (
        <Modal title={<><i className="ti ti-user" style={{ color: '#7F77DD' }} /> {editingU ? 'Editar usuário' : 'Novo usuário'}</>} onClose={() => setModal(null)}>
          <FormGroup label="Nome"><input value={formU.nome} onChange={FU('nome')} placeholder="Nome completo" /></FormGroup>
          <FormGroup label="E-mail"><input type="email" value={formU.email} onChange={FU('email')} placeholder="email@empresa.com" /></FormGroup>
          <FormGroup label="Empresa">
            <select value={String(formU.empresaId)} onChange={FU('empresaId')}>
              <option value="">Selecione</option>
              {state.empresas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
            </select>
          </FormGroup>
          <FormGroup label="Papel">
            <select value={formU.papel} onChange={FU('papel')}>
              <option value="admin">Admin</option>
              <option value="operador">Operador</option>
            </select>
          </FormGroup>
          <ModalFooter onClose={() => setModal(null)} onSave={salvarUsuario} saveLabel={editingU ? 'Atualizar' : 'Salvar'} />
        </Modal>
      )}

      {confirm && (
        <ConfirmModal
          message={confirm.msg}
          onConfirm={() => { confirm.fn(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
};
