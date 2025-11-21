// --- backend/tests/app.test.js ---

const request = require('supertest');

// 1. MOCK DO BCRYPT
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt_falso'),
  hash: jest.fn().mockResolvedValue('senha_criptografada_falsa'),
  compare: jest.fn().mockResolvedValue(true)
}));

// 2. MOCK DO MYSQL
jest.mock('mysql2', () => {
  const mQuery = jest.fn(); 
  return {
    createPool: jest.fn(() => ({
      promise: jest.fn(() => ({
        query: mQuery
      }))
    })),
    _mockQuery: mQuery 
  };
});

const mysql = require('mysql2');
const mockQuery = mysql._mockQuery; 
const app = require('../index'); // Importa o servidor

describe('Testes Completos da API', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TESTES DE REGISTRO
  describe('POST /api/register', () => {
    it('Deve registrar um usuário com sucesso', async () => {
      mockQuery.mockResolvedValueOnce([[]]); 
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }]); 

      const res = await request(app)
        .post('/api/register')
        .send({ email: 'novo@teste.com', password: '123' });

      expect(res.statusCode).toEqual(201);
    });

    it('Deve barrar cadastro se o email já existe', async () => {
      mockQuery.mockResolvedValueOnce([[{ id: 1, email: 'existe@teste.com' }]]); 

      const res = await request(app)
        .post('/api/register')
        .send({ email: 'existe@teste.com', password: '123' });

      expect(res.statusCode).toEqual(409);
    });
  });

  // TESTES DE LOGIN
  describe('POST /api/login', () => {
    it('Deve logar com sucesso', async () => {
      const fakeUser = { id: 1, email: 'teste@teste.com', senha: 'hash' };
      mockQuery.mockResolvedValueOnce([[fakeUser]]);
      
      const res = await request(app)
        .post('/api/login')
        .send({ email: 'teste@teste.com', password: '123' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('Deve negar login se o email não existir', async () => {
      mockQuery.mockResolvedValueOnce([[]]); 

      const res = await request(app)
        .post('/api/login')
        .send({ email: 'fantasma@teste.com', password: '123' });

      expect(res.statusCode).toEqual(401);
    });
  });

  // TESTES DE LIVROS
  describe('POST /api/books', () => {
    it('Deve cadastrar um livro com sucesso', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 10 }]);

      const res = await request(app)
        .post('/api/books')
        .send({ titulo: 'Harry Potter', autor: 'JK', isbn: '12345' });

      expect(res.statusCode).toEqual(201);
    });

    it('Deve dar erro se faltar dados', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({ titulo: 'Sem Autor' });

      expect(res.statusCode).toEqual(400);
    });
  });

  // TESTES DE EMPRÉSTIMOS
  describe('Rotas de Empréstimos', () => {
    it('POST /api/loans - Deve criar empréstimo', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 50 }]);

      const res = await request(app)
        .post('/api/loans')
        .send({ userId: 1, bookId: 10 });

      expect(res.statusCode).toEqual(201);
    });

    it('GET /api/loans - Deve listar empréstimos', async () => {
      const listaFalsa = [{ id: 1, nome_usuario: 'Joao', titulo_livro: 'Livro X' }];
      mockQuery.mockResolvedValueOnce([listaFalsa]);

      const res = await request(app).get('/api/loans');

      expect(res.statusCode).toEqual(200);
    });
  });
});