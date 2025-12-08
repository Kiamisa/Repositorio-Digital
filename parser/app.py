import os
import json
import logging
import requests
from typing import List
from datetime import date
from pathlib import Path
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter
from openai import OpenAI

# --- CONFIGURAÇÕES GERAIS ---
app = FastAPI(title="Smart Doc Service - Ollama Powered")
logging.basicConfig(level=logging.INFO)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Permite enviar JSON e outros headers
)
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080/documentos")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "ollama")
MODEL_NAME = "qwen3:8b"

# Cliente OpenAI apontando para o Ollama
client = OpenAI(
    base_url=OLLAMA_BASE_URL,
    api_key=OLLAMA_API_KEY
)

# --- MAPA DE CONHECIMENTO (SIGLAS) ---
PROGRAMAS_MAP = {
    'Pró-Reitoria de Pesquisa e Pós-Graduação': 'PPG',
    'Programa de Pós-Graduação profissional em Gestão e Regulação de Recursos hidricos': 'PROFAGUA',
    'Programa de Pós-Graduação em Produção Animal': 'PPGPA',
    'Programa de Pós-Graduação em Processos e Tecnologias Educacionais': 'PPGPTE',
    'Programa de Pós-Graduação em Letras': 'PPGLETRAS',
    'Programa de Pós-Graduação em História': 'PPGHIST',
    'Programa de Pós-Graduação em Geografia, Natureza e Dinâmica do Espaço': 'PPGGEO',
    'Programa de Pós-Graduação em Estudos da Linguagem': 'PPGEL',
    'Programa de Pós-Graduação em Estudos Criminológicos': 'PPGEC',
    'Programa de Pós-Graduação em Ensino': 'PPGEN',
    'Programa de Pós-Graduação em Engenharia da Computação e Sistemas': 'PECS',
    'Programa de Pós-Graduação em Engenharia Aeroespacial': 'PPGAERO',
    'Programa de Pós-Graduação em Educação Inclusiva': 'PROFEI',
    'Programa de Pós-Graduação em Educação': 'PPGE',
    'Programa de Pós-Graduação em Ecologia e Conservação da Biodiversidade': 'PPGECB',
    'Programa de Pós-Graduação em Desenvolvimento Socioespacial e Regional': 'PPGDSR',
    'Programa de Pós-Graduação em Defesa Sanitária Animal': 'PPGPDSA',
    'Programa de Pós-Graduação em Ciências Agrárias': 'PPGCIAG',
    'Programa de Pós-Graduação em Ciência Animal': 'PPGCA',
    'Programa de Pós-Graduação em Cartografia Social e Política da Amazônia': 'PPGCSPA',
    'Programa de Pós-Graduação em Biodiversidade, Ambiente e Saúde': 'PPGBAS',
    'Programa de Pós-Graduação em Biodiversidade e Biotecnologia': 'BIONORTE',
    'Programa de Pós-Graduação Profissional em Saúde da Família': 'PROFSAUDE',
    'Programa de Mestrado Profissional em Matemática em Rede Nacional': 'PROFMAT'
}

# --- MODELOS DE DADOS ---
class SearchRequest(BaseModel):
    query: str

# --- ENDPOINTS ---

@app.post("/smart-search", response_model=List[dict])
def smart_search(request: SearchRequest):
    """
    Endpoint que o Frontend chama.
    1. Pega dados do Java.
    2. Pede para o Ollama (Qwen) filtrar usando o mapa de siglas.
    """
    try:
        # 1. Buscar documentos brutos do Backend Java
        # Em dev, se o backend não estiver rodando, use um mock para testar
        try:
            response = requests.get(BACKEND_URL, timeout=5)
            if response.status_code == 200:
                all_docs = response.json()
            else:
                all_docs = [] # Ou levantar erro
        except Exception:
            logging.warning("Backend Java indisponível. Usando lista vazia ou mock.")
            all_docs = [] 

        # Se não tiver documentos, nem chama a IA
        if not all_docs:
            return []

        # 2. Construir o Prompt com o Mapa de Siglas
        mapa_str = json.dumps(PROGRAMAS_MAP, ensure_ascii=False, indent=2)
        docs_str = json.dumps(all_docs, ensure_ascii=False)
        hoje = date.today().strftime("%Y-%m-%d")

        system_prompt = f"""
        Você é um motor de busca semântica especializado em documentos acadêmicos.
        A data de hoje é: {hoje}.

        IMPORTANTE - USE ESTE MAPA DE SIGLAS PARA ENTENDER O CONTEXTO:
        Se o usuário buscar por uma sigla (valor), busque pelo nome completo do programa (chave), e vice-versa.
        {mapa_str}

        SUA TAREFA:
        1. Analise a lista de documentos JSON fornecida pelo usuário.
        2. Filtre os itens baseando-se na pergunta do usuário.
        3. Use raciocínio lógico (ex: 'Mês passado' em relação à data de hoje, 'Editais' filtra tipo='EDITAIS').
        4. O 'nomePrograma' no JSON corresponde às chaves do mapa de siglas acima.

        FORMATO DE RESPOSTA OBRIGATÓRIO:
        - Retorne APENAS um JSON array válido [ ... ].
        - NÃO explique nada. NÃO use Markdown (```json). Apenas o JSON cru.
        - Se nada for encontrado, retorne [].
        """

        user_message = f"PERGUNTA DO USUÁRIO: '{request.query}'\n\nLISTA DE DOCUMENTOS PARA FILTRAR:\n{docs_str}"

        logging.info(f"Enviando query '{request.query}' para {MODEL_NAME}...")

        # 3. Chamada ao Ollama
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1, # Baixa temperatura para ser determinístico
        )

        # 4. Processar Resposta
        result_text = completion.choices[0].message.content.strip()
        
        # Remove blocos de código markdown se o modelo insistir em colocar
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]

        filtered_data = json.loads(result_text)
        
        logging.info(f"Ollama filtrou de {len(all_docs)} para {len(filtered_data)} documentos.")
        return filtered_data

    except json.JSONDecodeError:
        logging.error("O modelo não retornou um JSON válido.")
        logging.error(f"Resposta bruta: {result_text}")
        return [] # Retorna vazio em caso de erro de parse
    except Exception as e:
        logging.error(f"Erro geral: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest-file")
async def ingest_file(file: UploadFile = File(...)):
    """
    Endpoint utilitário para converter arquivo usando Docling + Pathlib Fix
    """
    temp_filename = f"temp_{file.filename}"
    try:
        with open(temp_filename, "wb") as buffer:
            buffer.write(await file.read())
        
        # Correção da URI
        file_path = Path(temp_filename).resolve()
        source_uri = file_path.as_uri()
        
        converter = DocumentConverter()
        result = converter.convert(source_uri)
        
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
            
        return {
            "filename": file.filename,
            "content": result.document.export_to_markdown()
        }
    except Exception as e:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Roda na porta 8000 para não conflitar com o Spring (8080)
    uvicorn.run(app, host="0.0.0.0", port=8000)