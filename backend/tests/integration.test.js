// --- backend/tests/integration.test.js ---
const request = require('supertest');

// Mocks necessários
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hash')
}));

jest.mock('mysql2', () => {
  const mQuery = jest.fn();
  return {
    createPool: jest.fn(() => ({
      promise: jest.fn(() => ({ query: mQuery }))
    })),
    _mockQuery: mQuery
  };
});

const mysql = require('mysql2');
const mockQuery = mysql._mockQuery;
const app = require('../index');

describe('TESTES DE INTEGRAÇÃO (Cenários de Uso Real)', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CENÁRIO 1: O Caminho Feliz do Empréstimo
  it('Fluxo: Cliente pega livro com estoque -> Devolve livro -> Estoque é reposto', async () => {
    
    // --- ATO 1: PEGAR EMPRESTADO ---
    // Mock 1: Verifica Estoque (Dizemos que tem 5)
    mockQuery.mockResolvedValueOnce([[{ quantidade_estoque: 5 }]]);
    // Mock 2: Verifica Cliente (Dizemos que existe)
    mockQuery.mockResolvedValueOnce([[{ id: 1, nome: 'Maria' }]]);
    // Mock 3: Insere Empréstimo (Sucesso)
    mockQuery.mockResolvedValueOnce([{ insertId: 500 }]);
    // Mock 4: Atualiza Estoque (Diminui 1)
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const resEmprestimo = await request(app)
      .post('/api/loans')
      .send({ clientId: 1, bookId: 10 }); // Agora usa clientId!

    expect(resEmprestimo.statusCode).toEqual(201);
    expect(resEmprestimo.body.message).toContain('sucesso');

    // --- ATO 2: DEVOLVER ---
    // Mock 1: Busca o empréstimo (Dizemos que existe e data_devolucao_real é null)
    mockQuery.mockResolvedValueOnce([[{ id: 500, id_livro: 10, data_devolucao_real: null }]]);
    // Mock 2: Atualiza a data de devolução (UPDATE)
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
    // Mock 3: Atualiza o estoque do livro (+1)
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const resDevolucao = await request(app)
      .put('/api/loans/500/devolver');

    expect(resDevolucao.statusCode).toEqual(200);
    expect(resDevolucao.body.message).toContain('devolvido');
  });

  // CENÁRIO 2: A Falha de Estoque
  it('Fluxo: Tenta pegar livro SEM estoque e sistema bloqueia', async () => {
    // Mock 1: Verifica Estoque (Dizemos que é ZERO)
    mockQuery.mockResolvedValueOnce([[{ quantidade_estoque: 0 }]]);

    const res = await request(app)
      .post('/api/loans')
      .send({ clientId: 1, bookId: 10 });

    // O sistema deve barrar antes de checar cliente ou inserir
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/indisponível/i);
  });
});