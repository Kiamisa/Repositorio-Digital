package br.com.uema.repositorio.service;

import br.com.uema.repositorio.dto.DocumentoRequestDTO;
import br.com.uema.repositorio.dto.DocumentoResponseDTO;
import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.entity.FluxoAprovacao;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.EstadoAprovacao;
import br.com.uema.repositorio.enums.PerfilUsuario;
import br.com.uema.repositorio.exception.RecursoNaoEncontradoException;
import br.com.uema.repositorio.repository.DocumentoRepository;
import br.com.uema.repositorio.repository.FluxoAprovacaoRepository;
import br.com.uema.repositorio.repository.ProgramaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class DocumentoService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private FluxoAprovacaoRepository fluxoAprovacaoRepository;

    private final DocumentoRepository documentoRepository;
    private final ProgramaRepository programaRepository;

    public DocumentoService(DocumentoRepository documentoRepository, ProgramaRepository programaRepository) {
        this.documentoRepository = documentoRepository;
        this.programaRepository = programaRepository;
    }

    @Transactional
    public DocumentoResponseDTO upload(DocumentoRequestDTO dados, MultipartFile arquivo, Usuario autor) {        // 1. Validar Programa (Use getProgramaId() em vez de programaId())
        var programa = programaRepository.findById(dados.getProgramaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Programa não encontrado"));

        String caminhoArquivo = salvarArquivoNoDisco(arquivo);

        // 3. Salvar Metadados no Banco (Use os Getters)
        var novoDocumento = Documento.builder()
                .titulo(dados.getTitulo())
                .descricao(dados.getDescricao())
                .tipo(dados.getTipo())
                .dataPublicacao(dados.getDataPublicacao())
                .caminhoArquivo(caminhoArquivo)
                .programa(programa)
                .usuario(autor)
                .build();

        documentoRepository.save(novoDocumento);

        EstadoAprovacao estadoInicial;

        if (autor.getPerfil() == PerfilUsuario.ADMIN || autor.getPerfil() == PerfilUsuario.GESTOR) {
            estadoInicial = EstadoAprovacao.APROVADO;
        } else {
            estadoInicial = EstadoAprovacao.PENDENTE;
        }

        var fluxo = FluxoAprovacao.builder()
                .documento(novoDocumento)
                .estado(estadoInicial)
                .aprovador(estadoInicial == EstadoAprovacao.APROVADO ? autor : null) // Se auto-aprovou
                .comentarios(estadoInicial == EstadoAprovacao.APROVADO ? "Aprovação automática por nível hierárquico" : "Aguardando análise")
                .build();

        fluxoAprovacaoRepository.save(fluxo);

        return new DocumentoResponseDTO(novoDocumento);
    }

    private String salvarArquivoNoDisco(MultipartFile arquivo) {
        try {
            // Cria o diretório se não existir
            Path diretorioPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(diretorioPath);

            // Gera nome único para evitar sobrescrita (UUID + nome original)
            String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
            Path targetLocation = diretorioPath.resolve(nomeArquivo);

            // Copia o arquivo
            Files.copy(arquivo.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetLocation.toString();
        } catch (IOException ex) {
            throw new RuntimeException("Não foi possível salvar o arquivo " + arquivo.getOriginalFilename(), ex);
        }
    }
}