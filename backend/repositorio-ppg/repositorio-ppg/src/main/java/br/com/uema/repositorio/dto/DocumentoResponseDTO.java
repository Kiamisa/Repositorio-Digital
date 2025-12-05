package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.enums.TipoDocumento;
import java.time.LocalDate;

public record DocumentoResponseDTO(
        Long id,
        String titulo,
        String descricao,
        TipoDocumento tipo,
        Long programaId,
        String nomePrograma,
        String nomeAutor,
        String urlDownload,
        LocalDate dataPublicacao
) {
    public DocumentoResponseDTO(Documento doc) {
        this(
                doc.getId(),
                doc.getTitulo(),
                doc.getDescricao(),
                doc.getTipo(),
                doc.getPrograma().getId(),
                doc.getPrograma().getNome(),
                doc.getUsuario() != null ? doc.getUsuario().getNome() : "Desconhecido",
                "/documentos/download/" + doc.getId(),
                doc.getDataPublicacao()
        );
    }
}