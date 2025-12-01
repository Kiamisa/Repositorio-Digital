package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.dto.DocumentoRequestDTO;
import br.com.uema.repositorio.dto.DocumentoResponseDTO;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.repository.DocumentoRepository;
import br.com.uema.repositorio.service.DocumentoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; // Importante!

import java.util.List;

@RestController
@RequestMapping("/documentos")
public class DocumentoController {

    @Autowired
    private DocumentoService documentoService;

    @Autowired
    private DocumentoRepository documentoRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentoResponseDTO> enviarDocumento(
            @ModelAttribute @Valid DocumentoRequestDTO dados,
            @RequestParam("arquivo") MultipartFile arquivo,
            @AuthenticationPrincipal Usuario usuarioLogado
    ) {
        // Agora chamamos o serviço com os 3 parâmetros corretos
        var documento = documentoService.upload(dados, arquivo, usuarioLogado);
        return ResponseEntity.status(201).body(documento);
    }

    @GetMapping
    public ResponseEntity<List<DocumentoResponseDTO>> listarDocumentosPublicos() {
        // Busca apenas documentos que já foram aprovados no fluxo
        var docs = documentoRepository.findAllAprovados();
        var dtos = docs.stream().map(DocumentoResponseDTO::new).toList();
        return ResponseEntity.ok(dtos);
    }
}