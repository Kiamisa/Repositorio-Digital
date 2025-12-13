# Sistema de Repositório Institucional PPG/UEMA

Sistema completo de gestão documental com busca inteligente e resumos automáticos usando IA, desenvolvido para a Pró-Reitoria de Pesquisa e Pós-Graduação da UEMA.

## 📋 Visão Geral

O sistema é composto por três componentes principais:

- **Backend (Java/Spring Boot)**: API REST para gerenciamento de documentos, usuários e fluxos de aprovação
- **Frontend (React + TypeScript)**: Interface web moderna e responsiva
- **Parser (Python/FastAPI)**: Serviço de IA para busca semântica e geração de resumos usando Ollama

## 🚀 Tecnologias

### Backend
- Java 21
- Spring Boot 3.5.8
- PostgreSQL 16
- Flyway (migrações)
- Spring Security + JWT
- Spring AI (Ollama)

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- Axios
- React Router

### Parser (IA)
- Python 3.11
- FastAPI
- Docling (conversão de documentos)
- Ollama (modelo Qwen3:8b)
- OpenAI SDK (compatível com Ollama)

## 📦 Pré-requisitos

- Docker & Docker Compose
- Ollama instalado localmente (para IA)
- Porta 5432 (PostgreSQL), 8080 (Backend), 5173 (Frontend), 8000 (Parser) disponíveis

## 🔧 Instalação e Execução

### 1. Configurar Ollama

Primeiro, instale e configure o modelo de IA:

```bash
# Instalar Ollama (se ainda não tiver)
# Linux/macOS:
curl -fsSL https://ollama.com/install.sh | sh

# Windows baixe de:
https://ollama.com/download

# Baixar o modelo Qwen3
ollama pull qwen3:8b

# Verificar se está rodando
ollama list
```

### 2. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd repositorio-ppg
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (opcional, o sistema usa valores padrão):

```env
# Backend
DB_URL=jdbc:postgresql://db:5432/ppg_uema
DB_USER=postgres
DB_PASSWORD=p4ssw0rd
JWT_SECRET=12345678-uema-ppg-secret-key-very-safe

# Parser Python
OLLAMA_BASE_URL=http://host.docker.internal:11434
BACKEND_URL=http://backend:8080/documentos
```

### 4. Iniciar o Sistema

```bash
# Subir todos os serviços
docker-compose up -d

# Acompanhar logs
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas parser
docker-compose logs -f parser
```

### 5. Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Parser API**: http://localhost:8000
- **PostgreSQL**: localhost:5432

### Credenciais Padrão

**Usuário Admin (criado automaticamente):**
- Email: `admin@uema.br`
- Senha: `123456`

## 📚 Estrutura do Projeto

```
repositorio-ppg/
├── backend/
│   └── repositorio-ppg/
│       ├── src/main/java/br/com/uema/repositorio/
│       │   ├── config/          # Configurações de segurança
│       │   ├── controller/      # Endpoints REST
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # Entidades JPA
│       │   ├── repository/      # Repositories
│       │   └── service/         # Lógica de negócio
│       └── src/main/resources/
│           └── db/migration/    # Migrations Flyway
│
├── frontend/
│   └── src/
│       ├── components/          # Componentes React
│       ├── context/             # Context API (Auth)
│       └── services/            # API calls
│
├── parser/
│   └── app.py                   # API FastAPI + IA
│
└── docker-compose.yml
```

## 🎯 Funcionalidades

### Gestão de Documentos
- ✅ Upload de arquivos (PDF, DOC, DOCX, TXT)
- ✅ Categorização por tipo e programa
- ✅ Edição de metadados
- ✅ Download de documentos
- ✅ Exclusão com verificação

### Busca Inteligente
- ✅ Busca semântica usando IA
- ✅ Filtros por categoria, programa e data
- ✅ Reconhecimento de siglas (ex: "PPGE" → "Programa de Pós-Graduação em Educação")
- ✅ Consultas em linguagem natural

### Resumos Automáticos
- ✅ Geração de resumos com IA
- ✅ Análise de documentos PDF
- ✅ Estruturação em Markdown
- ✅ Extração de principais pontos

### Controle de Acesso
- ✅ Autenticação JWT
- ✅ 4 níveis de permissão: Admin, Gestor, Funcionário, Estagiário
- ✅ Fluxo de aprovação de documentos
- ✅ Aprovação de novos usuários

### Interface
- ✅ Dashboard com estatísticas
- ✅ Design responsivo
- ✅ Tema escuro/claro (TailwindCSS)
- ✅ Componentes modernos (Shadcn/ui)

## 🔐 Perfis de Usuário

| Perfil | Permissões |
|--------|-----------|
| **ADMIN** | Acesso total ao sistema |
| **GESTOR** | Aprovar documentos, gerenciar usuários |
| **FUNCIONARIO** | Criar, editar e excluir documentos |
| **ESTAGIARIO** | Apenas criar documentos (requer aprovação) |

## 🗄️ Banco de Dados

O sistema usa PostgreSQL com as seguintes tabelas principais:

- `usuarios` - Dados de autenticação e perfil
- `programas` - Programas de pós-graduação
- `documentos` - Metadados dos arquivos
- `resumos` - Resumos gerados por IA
- `fluxo_aprovacao` - Controle de aprovações
- `logs` - Auditoria de ações

## 🤖 Endpoints da API

### Backend (Spring Boot)

```
POST   /login                          # Autenticação
POST   /usuarios/registro-publico     # Cadastro público
GET    /documentos                     # Listar documentos
POST   /documentos                     # Upload
PUT    /documentos/{id}                # Atualizar
DELETE /documentos/{id}                # Excluir
POST   /documentos/{id}/insights       # Gerar resumo
GET    /aprovacoes/pendentes           # Listar pendentes
PATCH  /aprovacoes/{id}                # Aprovar/Rejeitar
```

### Parser (FastAPI)

```
POST   /smart-search                   # Busca inteligente
POST   /summarize-file                 # Gerar resumo
POST   /ingest-file                    # Converter documento
```

## 🐛 Troubleshooting

### Ollama não conecta

```bash
# Verificar se o Ollama está rodando
ollama serve

# Testar manualmente
curl http://localhost:11434/api/tags
```

### Erro de CORS

Verifique se o backend está configurado para aceitar requisições do frontend:
```java
// SecurityConfig.java já está configurado
.allowedOriginPatterns(List.of("*"))
```

### Banco de dados não inicializa

```bash
# Verificar logs do PostgreSQL
docker-compose logs db

# Recriar volumes
docker-compose down -v
docker-compose up -d
```

### Frontend não conecta ao backend

Verifique se a URL da API está correta em `frontend/src/services/api.ts`:
```typescript
baseURL: 'http://localhost:8080'
```

## 📝 Comandos Úteis

```bash
# Parar todos os serviços
docker-compose down

# Rebuild completo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Acessar container
docker-compose exec backend bash
docker-compose exec parser bash

# Limpar volumes
docker-compose down -v
```

## 🚀 Deploy em Produção

1. Configure as variáveis de ambiente adequadas
2. Use um proxy reverso (Nginx/Traefik)
3. Configure SSL/TLS
4. Use segredos para senhas do banco
5. Configure backup automático do PostgreSQL
6. Monitore logs com ELK ou similar

## 📄 Licença

Este projeto é desenvolvido para uso interno da UEMA.

## 👥 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de TI da PPG/UEMA.

---

**Versão**: 0.1.0  
**Última atualização**: Dezembro 2025
