package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.FluxoAprovacao;
import br.com.uema.repositorio.enums.EstadoAprovacao;

import java.time.format.DateTimeFormatter;

public record FluxoAprovacaoResponseDTO(
        Long idFluxo,
        EstadoAprovacao estado,
        String tituloDocumento,
        Long idDocumento,
        String nomeAutor,
        String nomePrograma,
        String dataSolicitacao
) {
    public FluxoAprovacaoResponseDTO(FluxoAprovacao fluxo) {
        this(
                fluxo.getId(),
                fluxo.getEstado(),
                fluxo.getDocumento().getTitulo(),
                fluxo.getDocumento().getId(),
                fluxo.getDocumento().getUsuario().getNome(),
                fluxo.getDocumento().getPrograma().getNome(),
                fluxo.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        );
    }
}