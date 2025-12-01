package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.enums.TipoDocumento;

import java.time.LocalDate;

public record DocumentoResponseDTO(
        Long id,
        String titulo,
        String descricao,
        TipoDocumento tipo,
        String nomePrograma,
        String nomeAutor,
        String urlDownload, // Link para baixar o arquivo
        LocalDate dataPublicacao
) {
    public DocumentoResponseDTO(Documento doc) {
        this(
                doc.getId(),
                doc.getTitulo(),
                doc.getDescricao(),
                doc.getTipo(),
                doc.getPrograma().getNome(),
                doc.getUsuario() != null ? doc.getUsuario().getNome() : "Desconhecido",
                "/documentos/download/" + doc.getId(), // URL relativa
                doc.getDataPublicacao()
        );
    }
}