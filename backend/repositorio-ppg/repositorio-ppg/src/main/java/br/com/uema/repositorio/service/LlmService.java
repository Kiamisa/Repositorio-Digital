package br.com.uema.repositorio.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class LlmService {

    private final ChatClient chatClient;

    public LlmService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String gerarResumo(String textoMarkdown, String nomePrograma) {
        if (textoMarkdown == null || textoMarkdown.isEmpty()) return "Sem conteúdo.";

        // Prompt otimizado para o formato Markdown do Docling
        String prompt = """
                Você é um assistente administrativo da UEMA.
                Analise o seguinte documento do programa %s (formatado em Markdown).
                
                Extraia as seguintes informações em um resumo corrido de até 400 caracteres:
                1. Objetivo principal do documento.
                2. Datas críticas (prazos, vigência).
                3. Valores financeiros (se houver).
                
                Documento:
                %s
                """.formatted(nomePrograma, textoMarkdown.substring(0, Math.min(textoMarkdown.length(), 6000)));

        try {
            return chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            return "IA indisponível no momento.";
        }
    }
}