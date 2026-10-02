const BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('fitlife_token') ?? '';
}

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ erro: 'Erro desconhecido' }));
    throw new Error(err.erro || 'Erro na requisição');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, senha: string) =>
    req<{ token: string; usuario: any }>('POST', '/auth/login', { email, senha }),

  academias: {
    listar: ()                   => req<any[]>('GET',    '/academias'),
    criar:  (d: any)             => req<any>  ('POST',   '/academias', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/academias/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/academias/${id}`),
  },

  alunos: {
    listar: ()                   => req<any[]>('GET',    '/alunos'),
    criar:  (d: any)             => req<any>  ('POST',   '/alunos', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/alunos/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/alunos/${id}`),
  },

  instrutores: {
    listar: ()                   => req<any[]>('GET',    '/instrutores'),
    criar:  (d: any)             => req<any>  ('POST',   '/instrutores', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/instrutores/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/instrutores/${id}`),
  },

  exercicios: {
    listar: ()                   => req<any[]>('GET',    '/exercicios'),
    criar:  (d: any)             => req<any>  ('POST',   '/exercicios', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/exercicios/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/exercicios/${id}`),
  },

  treinos: {
    listar: ()                   => req<any[]>('GET',    '/treinos'),
    criar:  (d: any)             => req<any>  ('POST',   '/treinos', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/treinos/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/treinos/${id}`),
  },

  mensalidades: {
    listar: ()                   => req<any[]>('GET',    '/mensalidades'),
    criar:  (d: any)             => req<any>  ('POST',   '/mensalidades', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/mensalidades/${id}`, d),
    pagar:  (id: number)         => req<any>  ('PATCH',  `/mensalidades/${id}/pagar`),
    excluir:(id: number)         => req<void> ('DELETE', `/mensalidades/${id}`),
  },

  empresas: {
    listar: ()                   => req<any[]>('GET',    '/empresas'),
    criar:  (d: any)             => req<any>  ('POST',   '/empresas', d),
    editar: (id: number, d: any) => req<any>  ('PUT',    `/empresas/${id}`, d),
    excluir:(id: number)         => req<void> ('DELETE', `/empresas/${id}`),
  },
};
