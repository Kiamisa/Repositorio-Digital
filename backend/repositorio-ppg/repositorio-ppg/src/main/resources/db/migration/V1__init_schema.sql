CREATE EXTENSION IF NOT EXISTS citext;

-- --- TIPOS ENUM (valores fechados) ---
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'GESTOR', 'FUNCIONARIO', 'ESTAGIARIO');

CREATE TYPE tipo_documento AS ENUM (
    'EDITAIS', 'RESULTADOS', 'FORMULARIOS', 'CERTIFICADOS',
    'DOCUMENTACOES', 'RESOLUCOES', 'NORMAS', 'OUTROS'
    );

CREATE TYPE estado_aprovacao AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- --- TABELA PROGRAMAS ---
CREATE TABLE programas (
                           id BIGSERIAL PRIMARY KEY,
                           nome VARCHAR(255) NOT NULL,
                           sigla CITEXT NOT NULL UNIQUE,
                           descricao TEXT,
                           created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                           updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- TABELA USUÁRIOS ---
CREATE TABLE usuarios (
                          id BIGSERIAL PRIMARY KEY,
                          nome VARCHAR(255) NOT NULL,
                          email CITEXT NOT NULL UNIQUE,
                          senha TEXT NOT NULL,
                          perfil perfil_usuario NOT NULL DEFAULT 'FUNCIONARIO',
                          ativo BOOLEAN NOT NULL DEFAULT TRUE,
                          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- TABELA DOCUMENTOS (central) ---
CREATE TABLE documentos (
                            id BIGSERIAL PRIMARY KEY,
                            titulo VARCHAR(255) NOT NULL,
                            descricao TEXT,
                            tipo tipo_documento NOT NULL,
                            data_publicacao DATE NOT NULL,
                            caminho_arquivo TEXT NOT NULL,
                            programa_id BIGINT NOT NULL REFERENCES programas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
                            usuario_id BIGINT REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL,
                            resumo_ia TEXT,
                            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                            search_tsv tsvector
);

-- --- VERSÕES DOS DOCUMENTOS (controle de versão) ---
CREATE TABLE documento_versoes (
                                   id BIGSERIAL PRIMARY KEY,
                                   documento_id BIGINT NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
                                   caminho_arquivo TEXT NOT NULL,
                                   usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
                                   observacao TEXT,
                                   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- LOGS / AUDITORIA (acessos e ações) ---
CREATE TABLE logs (
                      id BIGSERIAL PRIMARY KEY,
                      acao VARCHAR(100) NOT NULL, -- Ex: 'UPLOAD','DOWNLOAD','LOGIN','UPDATE_DOCUMENT'
                      descricao TEXT,
                      usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
                      documento_id BIGINT REFERENCES documentos(id) ON DELETE SET NULL,
                      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- FLUXO DE APROVAÇÃO ---
CREATE TABLE fluxo_aprovacao (
                                 id BIGSERIAL PRIMARY KEY,
                                 documento_id BIGINT NOT NULL REFERENCES documentos(id) ON DELETE CASCADE,
                                 usuario_aprovador_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
                                 estado estado_aprovacao NOT NULL DEFAULT 'PENDENTE',
                                 comentarios TEXT,
                                 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                                 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --- DADOS INICIAIS (PROGRAMAS) ---
INSERT INTO programas (nome, sigla, descricao) VALUES
                                                   ('Pró-Reitoria de Pesquisa e Pós-Graduação', 'PPG', 'Descrição opcional'),
                                                   ('Programa de Pós-Graduação profissional em Gestão e Regulação de Recursos hidricos', 'PROFAGUA', NULL),
                                                   ('Programa de Pós-Graduação em Produção Animal', 'PPGPA', NULL),
                                                   ('Programa de Pós-Graduação em Processos e Tecnologias Educacionais', 'PPGPTE', NULL),
                                                   ('Programa de Pós-Graduação em Letras', 'PPGLETRAS', NULL),
                                                   ('Programa de Pós-Graduação em História', 'PPGHIST', NULL),
                                                   ('Programa de Pós-Graduação em Geografia, Natureza e Dinâmica do Espaço', 'PPGGEO', NULL),
                                                   ('Programa de Pós-Graduação em Estudos da Linguagem', 'PPGEL', NULL),
                                                   ('Programa de Pós-Graduação em Estudos Criminológicos', 'PPGEC', NULL),
                                                   ('Programa de Pós-Graduação em Ensino', 'PPGEN', NULL),
                                                   ('Programa de Pós-Graduação em Engenharia da Computação e Sistemas', 'PECS', NULL),
                                                   ('Programa de Pós-Graduação em Engenharia Aeroespacial', 'PPGAERO', NULL),
                                                   ('Programa de Pós-Graduação em Educação Inclusiva', 'PROFEI', NULL),
                                                   ('Programa de Pós-Graduação em Educação', 'PPGE', NULL),
                                                   ('Programa de Pós-Graduação em Ecologia e Conservação da Biodiversidade', 'PPGECB', NULL),
                                                   ('Programa de Pós-Graduação em Desenvolvimento Socioespacial e Regional', 'PPGDSR', NULL),
                                                   ('Programa de Pós-Graduação em Defesa Sanitária Animal', 'PPGPDSA', NULL),
                                                   ('Programa de Pós-Graduação em Ciências Agrárias', 'PPGCIAG', NULL),
                                                   ('Programa de Pós-Graduação em Ciência Animal', 'PPGCA', NULL),
                                                   ('Programa de Pós-Graduação em Cartografia Social e Política da Amazônia', 'PPGCSPA', NULL),
                                                   ('Programa de Pós-Graduação em Biodiversidade, Ambiente e Saúde', 'PPGBAS', NULL),
                                                   ('Programa de Pós-Graduação em Biodiversidade e Biotecnologia', 'BIONORTE', NULL),
                                                   ('Programa de Pós-Graduação Profissional em Saúde da Família', 'PROFSAUDE', NULL),
                                                   ('Programa de Mestrado Profissional em Matemática em Rede Nacional', 'PROFMAT', NULL);