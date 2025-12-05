package br.com.uema.repositorio.service;

import br.com.uema.repositorio.dto.DocumentoRequestDTO;
import br.com.uema.repositorio.dto.DocumentoResponseDTO;
import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.entity.FluxoAprovacao;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.EstadoAprovacao;
import br.com.uema.repositorio.enums.PerfilUsuario;
import br.com.uema.repositorio.exception.RecursoNaoEncontradoException;
import br.com.uema.repositorio.exception.RegraNegocioException;
import br.com.uema.repositorio.repository.DocumentoRepository;
import br.com.uema.repositorio.repository.FluxoAprovacaoRepository;
import br.com.uema.repositorio.repository.ProgramaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class DocumentoService {

    @Value("${file.upload-dir:./uploads}")
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
    public DocumentoResponseDTO upload(DocumentoRequestDTO dados, Usuario autor) {

        if (dados.getArquivo() == null || dados.getArquivo().isEmpty()) {
            throw new RegraNegocioException("O arquivo é obrigatório para novos documentos.");
        }
        var programa = programaRepository.findById(dados.getProgramaId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Programa não encontrado"));

        String caminhoArquivo = salvarArquivoNoDisco(dados.getArquivo());

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
                .aprovador(estadoInicial == EstadoAprovacao.APROVADO ? autor : null)
                .comentarios(estadoInicial == EstadoAprovacao.APROVADO ? "Aprovação automática" : "Aguardando análise")
                .build();

        fluxoAprovacaoRepository.save(fluxo);

        return new DocumentoResponseDTO(novoDocumento);
    }

    public Resource download(Long id) {
        try {
            var documento = documentoRepository.findById(id)
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado"));

            Path caminhoArquivo = Paths.get(uploadDir).resolve(documento.getCaminhoArquivo()).normalize();
            Resource recurso = new UrlResource(caminhoArquivo.toUri());

            if (recurso.exists()) {
                return recurso;
            } else {
                throw new FileNotFoundException("Arquivo não encontrado no servidor: " + documento.getCaminhoArquivo());
            }
        } catch (MalformedURLException | FileNotFoundException ex) {
            throw new RuntimeException("Erro ao baixar arquivo: " + ex.getMessage());
        }
    }

    private String salvarArquivoNoDisco(MultipartFile arquivo) {
        try {
            Path diretorioPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(diretorioPath);

            String nomeOriginal = Objects.requireNonNull(arquivo.getOriginalFilename())
                    .replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");

            String nomeArquivo = UUID.randomUUID() + "_" + nomeOriginal;
            Path targetLocation = diretorioPath.resolve(nomeArquivo);

            Files.copy(arquivo.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return nomeArquivo;
        } catch (IOException ex) {
            throw new RuntimeException("Erro ao salvar arquivo", ex);
        }
    }

    @Transactional
    public void excluir(Long id) {
        var documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado"));

        documentoRepository.delete(documento);

        try {
            Path arquivoPath = Paths.get(uploadDir).resolve(documento.getCaminhoArquivo()).normalize();
            Files.deleteIfExists(arquivoPath);
        } catch (IOException e) {
            System.err.println("Erro ao excluir arquivo físico: " + e.getMessage());
        }
    }

    @Transactional
    public DocumentoResponseDTO atualizar(Long id, DocumentoRequestDTO dados, Usuario editor) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Documento não encontrado"));

        documento.setTitulo(dados.getTitulo());
        documento.setDescricao(dados.getDescricao());
        documento.setTipo(dados.getTipo());
        documento.setDataPublicacao(dados.getDataPublicacao());

        if (!documento.getPrograma().getId().equals(dados.getProgramaId())) {
            var novoPrograma = programaRepository.findById(dados.getProgramaId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException("Programa não encontrado"));
            documento.setPrograma(novoPrograma);
        }

        // Atualiza Arquivo (Apenas se enviado)
        if (dados.getArquivo() != null && !dados.getArquivo().isEmpty()) {
            String novoCaminho = salvarArquivoNoDisco(dados.getArquivo());
            documento.setCaminhoArquivo(novoCaminho);
        }

        documentoRepository.save(documento);
        return new DocumentoResponseDTO(documento);
    }
}