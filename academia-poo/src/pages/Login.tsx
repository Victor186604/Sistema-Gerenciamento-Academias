import React, { useState } from 'react';

interface Props {
  onLogin: (email: string, senha: string) => Promise<boolean>;
  erro: string;
  carregando: boolean;
}

export const Login: React.FC<Props> = ({ onLogin, erro, carregando }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, senha);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <i className="ti ti-barbell" />
          <h1>FitLife</h1>
          <p>Sistema de Gestão de Academia</p>
        </div>

        <form onSubmit={submeter}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {erro && (
            <div className="login-erro" role="alert">
              <i className="ti ti-alert-triangle" /> {erro}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={carregando}
            style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }}
          >
            {carregando
              ? <><i className="ti ti-loader" /> Entrando...</>
              : <><i className="ti ti-login" /> Entrar</>}
          </button>
        </form>

        <p className="login-footer-text">
          Em caso de problemas de acesso, entre em contato com o administrador do sistema.
        </p>
      </div>
    </div>
  );
};
