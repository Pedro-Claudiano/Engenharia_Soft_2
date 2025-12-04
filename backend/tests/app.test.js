// --- backend/tests/app.test.js (VERSÃO FINAL: VISUAL + COBERTURA MÁXIMA) ---
const request = require('supertest');

// MOCKS
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hash'),
  compare: jest.fn().mockResolvedValue(true)
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

describe('🧪 SUÍTE DE TESTES UNITÁRIOS', () => {
  
  beforeEach(() => { 
    jest.clearAllMocks();
    // SILENCIADOR: O console.error vermelho não aparece, só os nossos logs bonitos
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================================
  // 1. REGISTRO & LOGIN
  // ==========================================================
  describe('👤 Módulo de Autenticação', () => {
    it('Deve registrar um usuário com sucesso', async () => {
      mockQuery.mockResolvedValueOnce([[]]); 
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]); 
      const res = await request(app).post('/api/register').send({ nome: 'Vinicius', email: 'novo@teste.com', password: '123' });
      expect(res.statusCode).toEqual(201);
    });

    it('Deve BARRAR cadastro se o email já existe (Validação)', async () => {
      console.log("      ℹ️  Tentando cadastrar email duplicado..."); 
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]); 
      const res = await request(app).post('/api/register').send({ nome: 'Vinicius', email: 'existe@teste.com', password: '123' });
      expect(res.statusCode).toEqual(409);
      console.log("      ✅ Sistema bloqueou duplicidade corretamente!");
    });

    it('Deve realizar Login com sucesso', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, email: 'teste@teste.com', senha: 'hash' }]]);
      const res = await request(app).post('/api/login').send({ email: 'teste@teste.com', password: '123' });
      expect(res.statusCode).toEqual(200);
    });
  });

  // ==========================================================
  // 2. LIVROS (CRUD COMPLETO)
  // ==========================================================
  describe('📚 Módulo de Livros', () => {
    it('Deve criar um novo livro', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 10 }]);
      const res = await request(app).post('/api/books').send({ titulo: 'Harry Potter', autor: 'JK', isbn: '12345', quantidade: 5 });
      expect(res.statusCode).toEqual(201);
    });

    it('Deve buscar livros (Filtro)', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, titulo: 'Harry Potter', quantidade_estoque: 2 }]]);
      const res = await request(app).get('/api/books?q=Harry');
      expect(res.statusCode).toEqual(200);
    });

    it('Deve buscar livro por ID', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, titulo: 'Livro X' }]]);
      const res = await request(app).get('/api/books/1');
      expect(res.statusCode).toEqual(200);
    });

    it('Deve tratar erro 404 ao buscar livro inexistente', async () => {
       mockQuery.mockResolvedValueOnce([[]]); 
       const res = await request(app).get('/api/books/999');
       expect(res.statusCode).toEqual(404);
    });

    it('Deve atualizar livro', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const res = await request(app).put('/api/books/1').send({ titulo: 'Editado', autor: 'Novo', isbn: '000' });
      expect(res.statusCode).toEqual(200);
    });

    it('Deve deletar um livro', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const res = await request(app).delete('/api/books/1');
      expect(res.statusCode).toEqual(200);
    });

    it('Deve IMPEDIR delete se o livro está emprestado (FK)', async () => {
      console.log("      ℹ️  Tentando deletar livro emprestado...");
      const err = new Error('FK Error');
      err.code = 'ER_ROW_IS_REFERENCED_2';
      mockQuery.mockRejectedValueOnce(err); 
      const res = await request(app).delete('/api/books/1');
      expect(res.statusCode).toEqual(400);
      console.log("      ✅ Sistema protegeu a integridade dos dados!");
    });
  });

  // ==========================================================
  // 3. CLIENTES (CRUD COMPLETO - AQUI QUE FALTAVA!)
  // ==========================================================
  describe('👥 Módulo de Clientes', () => {
    it('Deve cadastrar cliente', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 99 }]);
      const res = await request(app).post('/api/clients').send({ nome: 'Leitor', cpf: '123' });
      expect(res.statusCode).toEqual(201);
    });

    it('Deve BARRAR CPF duplicado', async () => {
      console.log("      ℹ️  Tentando cadastrar CPF repetido...");
      const err = new Error('Dup');
      err.code = 'ER_DUP_ENTRY';
      mockQuery.mockRejectedValueOnce(err);
      const res = await request(app).post('/api/clients').send({ nome: 'Leitor', cpf: '123' });
      expect(res.statusCode).toEqual(409);
      console.log("      ✅ Sistema identificou CPF já existente!");
    });

    it('Deve listar clientes', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 99, nome: 'Leitor' }]]);
      const res = await request(app).get('/api/clients');
      expect(res.statusCode).toEqual(200);
    });

    it('Deve atualizar cliente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const res = await request(app).put('/api/clients/1').send({ nome: 'Leitor Editado', cpf: '123' });
      expect(res.statusCode).toEqual(200);
    });

    it('Deve deletar cliente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
      const res = await request(app).delete('/api/clients/1');
      expect(res.statusCode).toEqual(200);
    });
  });

  // ==========================================================
  // 4. EMPRÉSTIMOS
  // ==========================================================
  describe('🔄 Módulo de Empréstimos', () => {
    it('Deve realizar empréstimo (Com Estoque)', async () => {
      mockQuery.mockResolvedValueOnce([[{ quantidade_estoque: 5 }]]); 
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]); 
      mockQuery.mockResolvedValueOnce([{ insertId: 50 }]); 
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); 
      const res = await request(app).post('/api/loans').send({ clientId: 1, bookId: 10 });
      expect(res.statusCode).toEqual(201);
    });

    it('Deve devolver livro e repor estoque', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, id_livro: 10, data_devolucao_real: null }]]); 
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); 
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]); 
      const res = await request(app).put('/api/loans/1/devolver');
      expect(res.statusCode).toEqual(200);
    });
  });
});