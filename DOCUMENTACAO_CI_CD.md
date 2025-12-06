# Documentação de Integração Contínua (CI/CD)

## 📋 Sumário Executivo

Este documento descreve a implementação de um pipeline de CI/CD (Integração Contínua e Entrega Contínua) para o projeto Engenharia_Soft_2 utilizando GitHub Actions.

---

## 🎯 Objetivo

Automatizar o processo de testes e validação do código sempre que houver alterações no repositório, garantindo:
- **Qualidade do código**: Testes automatizados antes de integrar mudanças
- **Detecção precoce de bugs**: Problemas identificados imediatamente
- **Padronização**: Lint e formatação consistentes
- **Confiabilidade**: Build validado antes do deploy

---

## 🛠️ O Que Foi Implementado

### 1. Workflow de CI (`.github/workflows/ci.yml`)

Pipeline principal que executa em **push** e **pull requests** para as branches `main`, `master` e `develop`.

#### **Job 1: Backend Tests**
- **Ambiente**: Ubuntu Latest com Node.js 20
- **Passos**:
  1. Checkout do código
  2. Configuração do Node.js com cache de dependências
  3. Instalação de dependências (`npm ci`)
  4. Execução dos testes com Jest (`npm test`)
  5. Upload de relatório de cobertura para Codecov

**Testes executados:**
- ✅ 19 testes unitários e de integração
- ✅ Cobertura de código: 71.82%
- ✅ Módulos testados: Autenticação, Livros, Clientes, Empréstimos

#### **Job 2: Frontend Lint & Build**
- **Ambiente**: Ubuntu Latest com Node.js 20
- **Passos**:
  1. Checkout do código
  2. Configuração do Node.js com cache
  3. Instalação de dependências
  4. Execução do ESLint (`npm run lint`)
  5. Build de produção com Vite (`npm run build`)
  6. Upload dos artefatos de build

**Validações:**
- ✅ Lint com ESLint (padrões de código)
- ✅ Build de produção bem-sucedido
- ✅ Artefatos salvos por 7 dias

#### **Job 3: Integration Check**
- Executa apenas se os jobs anteriores passarem
- Confirma que todas as verificações foram bem-sucedidas

---

### 2. Workflow de Deploy (`.github/workflows/deploy.yml`)

Pipeline de deploy que executa em **push para main/master** ou **manualmente**.

**Funcionalidades:**
- Build automático do frontend
- Preparação para deploy em produção
- Notificação de conclusão
- Extensível para adicionar deploy real (Vercel, Netlify, AWS, etc.)

---

### 3. Script de Teste Local (`test-ci-local.bat`)

Script Windows para executar os mesmos testes do CI localmente antes do push.

**Executa:**
1. Testes do backend
2. Lint do frontend
3. Build do frontend

**Benefício:** Detectar problemas antes de fazer push para o repositório.

---

### 4. Correções de Código

Durante a implementação, foram corrigidos **2 erros de lint**:

#### **Arquivo: `frontend/src/pages/Clientes.jsx`**
```javascript
// ANTES (linha 42)
} catch (error) {
  setMessage({ type: 'error', text: 'Erro ao carregar clientes.' });
}

// DEPOIS
} catch {
  setMessage({ type: 'error', text: 'Erro ao carregar clientes.' });
}
```

#### **Arquivo: `frontend/src/pages/ForgotPassword.jsx`**
```javascript
// ANTES (linha 37)
} catch (error) {
  setMessage({ type: 'error', text: 'Ocorreu um erro...' });
}

// DEPOIS
} catch {
  setMessage({ type: 'error', text: 'Ocorreu um erro...' });
}
```

**Motivo:** A variável `error` estava declarada mas não utilizada, violando a regra `no-unused-vars` do ESLint.

---

### 5. Atualização do README

Adicionados:
- Badges de status dos workflows
- Documentação sobre CI/CD
- Instruções de uso

---

## 🔄 Fluxo de Trabalho (Workflow)

```
┌─────────────────────────────────────────────────────────────┐
│  Developer faz push ou cria Pull Request                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub Actions detecta o evento                            │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ Backend Tests│          │Frontend Lint │
│              │          │   & Build    │
│ • npm test   │          │ • npm lint   │
│ • Coverage   │          │ • npm build  │
└──────┬───────┘          └──────┬───────┘
       │                         │
       └────────────┬────────────┘
                    │
                    ▼
         ┌──────────────────┐
         │ Integration Check│
         │                  │
         │  ✅ All Passed   │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │  Merge Allowed   │
         └──────────────────┘
```

---

## 📊 Resultados dos Testes

### Backend (Jest)
```
Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Coverage:    71.82% statements
Time:        1.583s
```

**Módulos testados:**
- 👤 Autenticação (3 testes)
- 📚 Livros (7 testes)
- 👥 Clientes (5 testes)
- 🔄 Empréstimos (2 testes)
- 🔗 Integração (2 testes)

### Frontend (ESLint + Vite)
```
✓ ESLint: 0 errors, 0 warnings
✓ Build: 586.03 kB (gzip: 181.42 kB)
✓ Time: 4.98s
```

---

## 🚀 Como Usar

### Automático
Os workflows executam automaticamente quando você:
1. Faz `git push` para main/master/develop
2. Cria um Pull Request para essas branches

### Manual
1. Acesse a aba **Actions** no GitHub
2. Selecione o workflow **Deploy**
3. Clique em **Run workflow**
4. Escolha a branch e execute

### Local (antes do push)
```cmd
test-ci-local.bat
```

---

## 📈 Benefícios Implementados

### 1. **Qualidade Garantida**
- Todo código passa por testes antes de ser integrado
- Cobertura de código monitorada

### 2. **Feedback Rápido**
- Desenvolvedores sabem imediatamente se algo quebrou
- Tempo médio de execução: ~2-3 minutos

### 3. **Colaboração Melhorada**
- Pull Requests mostram status dos testes
- Revisores veem se o código passa nos testes

### 4. **Documentação Viva**
- Badges no README mostram status atual
- Histórico de builds disponível

### 5. **Prevenção de Bugs**
- Problemas detectados antes de chegar em produção
- Regressões identificadas automaticamente

---

## 🔧 Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| **GitHub Actions** | Plataforma de CI/CD |
| **Node.js 20** | Runtime JavaScript |
| **Jest** | Framework de testes (backend) |
| **ESLint** | Linter (frontend) |
| **Vite** | Build tool (frontend) |
| **Codecov** | Análise de cobertura |

---

## 📝 Estrutura de Arquivos Criados

```
.github/
└── workflows/
    ├── ci.yml          # Pipeline principal de CI
    └── deploy.yml      # Pipeline de deploy

test-ci-local.bat       # Script de teste local
DOCUMENTACAO_CI_CD.md   # Este documento
README.md               # Atualizado com badges e docs
```

---

## 🎓 Conceitos de Engenharia de Software Aplicados

### 1. **Integração Contínua (CI)**
- Integração frequente de código
- Testes automatizados em cada mudança
- Detecção precoce de conflitos

### 2. **Entrega Contínua (CD)**
- Build automatizado
- Preparação para deploy
- Artefatos versionados

### 3. **Qualidade de Código**
- Análise estática (ESLint)
- Testes unitários e de integração
- Métricas de cobertura

### 4. **DevOps**
- Automação de processos
- Infraestrutura como código (YAML)
- Feedback loops rápidos

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Testing Framework](https://jestjs.io/)
- [ESLint](https://eslint.org/)
- [Vite Build Tool](https://vitejs.dev/)

---

## ✅ Checklist de Implementação

- [x] Configuração do workflow de CI
- [x] Testes automatizados do backend
- [x] Lint e build do frontend
- [x] Script de teste local
- [x] Correção de erros de lint
- [x] Documentação completa
- [x] Atualização do README
- [x] Validação local bem-sucedida

---

**Data de Implementação:** 06/12/2025  
**Autor:** Pedro Claudiano  
**Projeto:** Engenharia_Soft_2  
**Repositório:** https://github.com/Pedro-Claudiano/Engenharia_Soft_2
