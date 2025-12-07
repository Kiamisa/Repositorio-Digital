package br.com.uema.repositorio.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class DoclingService {

    @Value("${docling.service.url}")
    private String doclingUrl;

    private final RestClient restClient = RestClient.create();

    public String extrairTextoInteligente(MultipartFile arquivo) {
        try {
            // Prepara o arquivo para envio
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(arquivo.getBytes()) {
                @Override
                public String getFilename() {
                    return arquivo.getOriginalFilename();
                }
            });

            // Chama o Python
            Map response = restClient.post()
                    .uri(doclingUrl)
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            assert response != null;
            return (String) response.get("text");
        } catch (Exception e) {
            System.err.println("Erro no Docling: " + e.getMessage());
            return "Erro ao processar documento com Docling.";
        }
    }
}