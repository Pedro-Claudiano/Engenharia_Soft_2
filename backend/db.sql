/* 1. Seleciona o banco de dados */
USE `biblioteca_db`;

/* 2. Criação da tabela 'usuarios' (Versão Final) */
CREATE TABLE `usuarios` (

  `id` INT NOT NULL AUTO_INCREMENT,
  
  /* * O 'nome' será opcional por enquanto (NULL).
   * RECOMENDAÇÃO: A próxima tarefa da sua equipe
   * de frontend deve ser adicionar um campo 'Nome'
   * na tela Register.jsx.
   */
  `nome` VARCHAR(255) NULL, 
  
  /* 'email' é obrigatório e único, usado para login */
  `email` VARCHAR(255) NOT NULL UNIQUE,
  
  /* 'senha' é obrigatória */
  `senha` VARCHAR(255) NOT NULL,
  
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`)
);

/* 3. Criação da tabela 'livros' */
CREATE TABLE `livros` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `autor` VARCHAR(255) NOT NULL,
  `isbn` VARCHAR(20) NOT NULL UNIQUE,
  `ano_publicacao` INT,
  `quantidade_estoque` INT UNSIGNED NOT NULL DEFAULT 1,
  `data_aquisicao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

/* 4. Criação da tabela 'emprestimos' */
CREATE TABLE `emprestimos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  
  /* IDs que ligam às outras tabelas */
  `id_usuario` INT NOT NULL, 
  `id_livro` INT NOT NULL,
  
  /* Datas */
  `data_emprestimo` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_devolucao_prevista` DATE NOT NULL,
  `data_devolucao_real` DATE NULL, 
  
  PRIMARY KEY (`id`),
  
  /* Conexões (Foreign Keys) */
  CONSTRAINT `fk_emprestimo_usuario`
    FOREIGN KEY (`id_usuario`)
    REFERENCES `usuarios` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT `fk_emprestimo_livro`
    FOREIGN KEY (`id_livro`)
    REFERENCES `livros` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);