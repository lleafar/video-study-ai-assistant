# 🎓 Video Study AI Assistant

> Um assistente de estudo inteligente baseado em IA que extrai insights de vídeos e documentos web através de análise contextual avançada.

---

## 📋 Visão Geral

O **Video Study AI Assistant** é uma aplicação full-stack que combina IA generativa com processamento de linguagem natural para criar um assistente de estudo interativo. O sistema permite que usuários façam perguntas sobre conteúdo de vídeos do YouTube e páginas web, recebendo respostas contextualizadas e bem formatadas.

A aplicação utiliza **LangChain**, **LangGraph**, **FAISS** para processamento inteligente de documentos e **GPT-4** para geração de respostas semânticas de alta qualidade.

---

## 🎯 Funcionalidades Principais

### 🎬 Análise de Vídeos
- Extração automática de transcrições de vídeos do YouTube
- Suporte para múltiplos idiomas (português, inglês, espanhol)
- Processamento de transcrições em chunks para melhor semântica

### 📄 Processamento de Documentos Web
- Carregamento inteligente de conteúdo de páginas web
- Filtragem automática de elementos irrelevantes (publicidades, rodapés, etc.)
- Conversão de HTML para texto limpo com preservação de estrutura
- Suporte para múltiplas URLs contextuais

### 🤖 Assistente de Estudo Inteligente
- **Sumarização**: Geração automática de resumos estruturados
- **Perguntas e Respostas**: Respostas contextualizadas com citação de fontes
- **Listagem de Documentos**: Visualização de todas as URLs carregadas
- **Transcrição Completa**: Acesso ao conteúdo integral de qualquer contexto

### 💬 Interface Conversacional
- Chat em tempo real com streaming de respostas
- Gestão de múltiplas sessões independentes
- Histórico de conversas persistente
- Layout responsivo com modo mobile/desktop

### 📌 Citação de Fontes
- Rastreamento automático de fontes para cada informação
- Links diretos para os documentos originais
- Formatação em Markdown para fácil leitura

---

## 🏗️ Arquitetura

### **Backend** (Python + FastAPI)

```
backend/
├── main.py                          # Inicialização da aplicação FastAPI
├── Config.py                        # Configurações globais e inicialização de LLM
├── app/
│   ├── api/
│   │   └── routes.py               # Endpoints da API REST
│   ├── domain/
│   │   ├── StudyAssistantManager.py # Gerenciador principal (padrão Singleton)
│   │   └── tools/                   # Ferramentas disponíveis ao agente IA
│   │       ├── question_answer_tool.py      # Busca e resposta contextualizada
│   │       ├── summarize_tool.py            # Geração de resumos
│   │       ├── get_full_transcript.py       # Recuperação de transcrição completa
│   │       └── list_context_urls.py         # Listagem de documentos carregados
│   ├── datasources/
│   │   └── content_loader.py       # Carregamento de YouTube e web
│   └── services/
│       └── title_service.py        # Extração de títulos de URLs
```

**Tecnologias:**
- **FastAPI**: Framework web assíncrono
- **LangChain**: Orquestração de IA e processamento de documentos
- **LangGraph**: Construção de agentes agentic com checkpointing
- **FAISS**: Busca semântica vetorial de alta performance
- **OpenAI GPT-4**: Modelo de linguagem para geração de respostas
- **YoutubeLoader**: Extração de transcrições do YouTube
- **WebBaseLoader + BeautifulSoup**: Scraping inteligente de web

### **Frontend** (React/Next.js + TypeScript)

```
frontend/
├── app/
│   ├── page.tsx                     # Página inicial com seleção de URLs
│   ├── layout.tsx                   # Layout raiz da aplicação
│   ├── RootLayoutClient.tsx         # Componente cliente para layout
│   ├── chat/[id]/
│   │   ├── page.tsx                 # Página de chat dinâmica
│   │   └── loading.tsx              # Skeleton de carregamento
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── Chat.tsx                 # Componente principal de chat
│   │   ├── MessageList.tsx          # Renderização de mensagens
│   │   ├── Input.tsx                # Campo de entrada de mensagens
│   │   ├── Sidebar.tsx              # Barra lateral de conversas
│   │   ├── AttachFiles.tsx          # Upload de arquivos
│   │   ├── AttachURLsButton.tsx     # Adicionar URLs adicionais
│   │   ├── ModalSelectUrl.tsx       # Modal para seleção de URLs
│   │   ├── AttachmentBadge.tsx      # Badge de anexos
│   │   ├── VideoPlayer.tsx          # Player integrado de vídeos
│   │   ├── SwitchLayoutButton.tsx   # Toggle de layout
│   │   └── icons/                   # Ícones customizados
│   └── utils/
│       └── url-utils.ts             # Utilitários para validação de URLs
├── hooks/
│   ├── useChatStream.ts             # Hook para streaming de chat
│   └── useUrlTitle.ts               # Hook para extração de títulos
└── store/
    ├── useChatStore.ts              # Estado global de chats (Zustand)
    └── useSidebarStore.ts           # Estado da sidebar
```

**Tecnologias:**
- **Next.js 14+**: Framework React com renderização server e client
- **TypeScript**: Type-safety para JavaScript
- **Zustand**: Gerenciamento de estado leve e eficiente
- **Tailwind CSS**: Utilitários para estilização
- **React Hooks**: Composição de lógica reutilizável
- **Server-Sent Events**: Streaming de respostas em tempo real

---

## 🔄 Fluxo de Funcionamento

### 1️⃣ Inicialização de Sessão
```
Usuário acessa a página → Seleciona URL do vídeo + URLs contextuais adicionais
↓
Frontend cria sessão única (chat_id) → Armazena no Zustand
```

### 2️⃣ Carregamento de Conteúdo
```
URL do Vídeo/Web → ContentLoader detecta tipo (YouTube/Website)
↓
YoutubeLoader / WebBaseLoader → Extrai conteúdo
↓
TextSplitter divide em chunks (1000 caracteres, 200 de overlap)
↓
OpenAI Embeddings gera vetores semânticos
↓
FAISS cria índice vetorial para busca rápida
```

### 3️⃣ Processamento de Pergunta
```
Usuário digita pergunta → Backend recebe via API POST /chat
↓
StudyAssistantManager instancia agente LangGraph
↓
Agente recebe 4 ferramentas:
  • answer_question → Busca semântica com FAISS
  • summarize_transcript → Resumo do conteúdo
  • get_full_transcript → Retorna transcrição completa
  • list_context_urls → Lista URLs carregadas
↓
Agente escolhe ferramenta apropriada baseado na intenção
↓
Respostas são formatadas em Markdown com citações
↓
StreamingResponse envia respostas via Server-Sent Events
```

---

## 📦 Requisitos

### Backend
- Python 3.9+
- pip (gerenciador de pacotes Python)

### Frontend
- Node.js 18+ e npm/yarn
- Navegador moderno com suporte a ES6+

### Serviços Externos
- **OpenAI API Key** (para GPT-4 e embeddings)
- Conexão com internet (para YouTube e web scraping)

---

## 🚀 Como Executar

### Backend

1. **Clonar repositório e entrar no diretório**
```bash
git clone <repository-url>
cd backend
```

2. **Criar e ativar ambiente virtual (recomendado)**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. **Instalar dependências**
```bash
pip install -r requirements.txt
```

4. **Configurar variáveis de ambiente**
```bash
# Criar arquivo .env na raiz do backend
echo "OPENAI_API_KEY=sua_chave_aqui" > .env
```

5. **Iniciar servidor FastAPI**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O backend estará disponível em: `http://localhost:8000`

### Frontend

1. **Entrar no diretório do frontend**
```bash
cd frontend
```

2. **Instalar dependências**
```bash
npm install
# ou
yarn install
```

3. **Configurar URL da API (se necessário)**
```bash
# Verificar arquivo next.config.js ou .env.local
# Garantir que a URL do backend está apontando para http://localhost:8000
```

4. **Iniciar servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

O frontend estará disponível em: `http://localhost:3000`

---

## 🔌 API Endpoints

### POST `/chat`
Invoca o assistente de estudo com uma pergunta e URLs contextuais.

**Request:**
```json
{
  "chatId": "chat_123",
  "videoUrl": "https://www.youtube.com/watch?v=...",
  "contextURLs": [
    {
      "url": "https://exemplo.com/artigo",
      "title": "Artigo Complementar"
    }
  ],
  "message": "Qual é o tema principal deste vídeo?"
}
```

**Response:** Server-Sent Events (streaming)
```
data: {"type": "ai", "content": "O vídeo trata sobre..."}
```

### GET `/api/get-title`
Extrai o título de uma URL.

**Query Parameters:**
- `url`: URL para extrair título

**Response:**
```json
{
  "title": "Título da Página"
}
```

---

## 🛠️ Estrutura de Dados

### Configuração Global (Config.py)
- **Modelo**: GPT-4.1
- **Temperatura**: 0 (determinístico)
- **Embeddings**: text-embedding-3-small (OpenAI)
- **Text Splitter**: RecursiveCharacterTextSplitter (1000 chars, 200 overlap)

### Sessão de Chat
```python
{
  "chat_id": "unique_session_id",
  "configurable": {
    "thread_id": "chat_id",
    "api_key": "OPENAI_API_KEY",
    "retriever": FAISS,  # Índice vetorial
    "video_url": "https://...",
    "context_urls": ["https://...", "https://..."]
  }
}
```

---

## 🎨 Funcionalidades da Interface

- **Dark Mode**: Tema claro/escuro automático
- **Responsividade**: Totalmente adaptado para mobile e desktop
- **Sidebar**: Histórico de conversas com navegação rápida
- **Video Player**: Reprodutor integrado para vídeos
- **Attachment Badges**: Visualização de URLs carregadas
- **Streaming**: Resposta em tempo real com animação

---

## 📊 Padrões de Projeto

| Padrão | Implementação | Localização |
|--------|--------------|------------|
| **Singleton** | StudyAssistantManager | `backend/app/domain/StudyAssistantManager.py` |
| **Dependency Injection** | FastAPI Depends | `backend/main.py` |
| **Observer/Store** | Zustand | `frontend/store/` |
| **Custom Hooks** | React Hooks | `frontend/hooks/` |
| **Agent Pattern** | LangGraph | `backend/app/domain/StudyAssistantManager.py` |
| **Tool Pattern** | LangChain Tools | `backend/app/domain/tools/` |

---

## 🔐 Segurança

- **CORS Habilitado**: Para desenvolvimento (ajustar para produção)
- **Validação de URLs**: Verificação de formato antes de processar
- **API Key**: Armazenada em variáveis de ambiente (não em código)
- **Assincronismo**: Limite de 3 requisições simultâneas por URL

---

## 🚧 Otimizações Implementadas

- **Busca Semântica**: FAISS com GPU-ready
- **Caching de Sessões**: Reutilização de retrievers por sessão
- **Evitar Reprocessamento**: Verificação de URLs já carregadas
- **Streaming**: Respostas em tempo real sem buffering
- **Concorrência Limitada**: Semaphore para controlar carga
- **Chunk Dinâmico**: Tamanho de k no FAISS ajustado baseado em conteúdo

---

## 📝 Exemplos de Uso

### Exemplo 1: Resumir um Vídeo
```
User: "Faça um resumo do vídeo"
↓
Agente seleciona: summarize_transcript
↓
Response: "[Resumo estruturado em bullet points com citações]"
```

### Exemplo 2: Pergunta Específica
```
User: "Quais foram os pontos principais apresentados?"
↓
Agente seleciona: answer_question
↓
Response: "Os pontos principais foram:
• [Ponto 1] (Source: [Título](URL))
• [Ponto 2] (Source: [Título](URL))"
```

### Exemplo 3: Accesso Completo
```
User: "Me mostre a transcrição completa do segundo documento"
↓
Agente seleciona: get_full_transcript (url_index=1)
↓
Response: "[Transcrição ou conteúdo completo]"
```

---

## 🐛 Tratamento de Erros

| Erro | Causa | Solução |
|------|-------|---------|
| "No relevant documents found" | URL não carregada | Verificar URL e reconectar |
| OpenAI API Error | API key inválida | Validar chave em .env |
| YouTube transcript unavailable | Vídeo sem legenda | Tentar com outro vídeo |
| Web scraping failed | Site bloqueando scraper | Adicionar User-Agent válido |

---

## 📈 Potencial de Expansão
- 👨‍⚕️ Escalabilidade: Health Checks + Timeouts + Retry
- 💾 Persistência de dados: Banco de Dados + Redis Cache
- 🌐 Processamento Assíncrono: Fila + Worker
- 👁️ Observabilidade: Logging + Métricas
- 📊 Métricas: Avaliação + Benchmark da LLM

---

## 📚 Stack Tecnológico

### Backend
![Python](https://img.shields.io/badge/Python-3.9+-3776ab?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009485?style=flat-square&logo=fastapi)
![LangChain](https://img.shields.io/badge/LangChain-Latest-1f425f?style=flat-square)
![FAISS](https://img.shields.io/badge/FAISS-Latest-blue?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=flat-square)

### Frontend
![React](https://img.shields.io/badge/React-18+-61dafb?style=flat-square&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=flat-square&logo=nextjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178c6?style=flat-square&logo=typescript)
![Zustand](https://img.shields.io/badge/Zustand-Latest-brown?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=flat-square&logo=tailwindcss)

---

## 📄 Licença

Este projeto está disponível para fins educacionais e de portfólio.

---

## 👤 Autor

Desenvolvido como projeto de portfólio demonstrando expertise em:
- ✅ Full-stack development (Python + React)
- ✅ Integração com APIs de IA (OpenAI, LangChain)
- ✅ Processamento de linguagem natural
- ✅ Arquitetura de microsserviços assíncrono
- ✅ UX/UI responsivo e moderno
- ✅ Padrões de design avançados

---

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto, consulte a documentação do código ou abra uma issue no repositório.

---

**⭐ Se este projeto foi útil, considere dar uma estrela no repositório!**
