// --- backend/login.test.js (TESTE UNITÁRIO COM MOCK) ---

const request = require('supertest');
const app = require('../index'); // Importa o nosso servidor

// === MOCK (SIMULAÇÃO) DO BANCO DE DADOS ===
// Isso engana o sistema. Quando ele tentar chamar o mysql2, vai cair aqui.
jest.mock('mysql2', () => {
  const mQuery = jest.fn();
  return {
    createPool: jest.fn(() => ({
      promise: jest.fn(() => ({
        query: mQuery
      }))
    }))
  };
});

const mysql = require('mysql2');
const dbMock = mysql.createPool().promise(); 

describe('Testes da Rota /api/login', () => {

  // Limpa a memória do mock antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Deve retornar erro 400 se não enviar senha', async () => {
    // AÇÃO: Tenta logar sem mandar a senha
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'teste@gmail.com' }); 

    // VERIFICAÇÃO: Espera que o servidor reclame (Erro 400)
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Dados incompletos.');
  });

  it('Deve retornar erro 401 se o email não existir no banco', async () => {
    // PREPARAÇÃO: Dizemos pro banco de mentira retornar "vazio" (usuário não achado)
    dbMock.query.mockResolvedValueOnce([[]]); 

    // AÇÃO: Tenta logar com um email qualquer
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'naoexiste@gmail.com',
        password: '123'
      });

    // VERIFICAÇÃO: Espera erro 401 (Não autorizado)
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Email ou senha inválidos.');
  });

});