package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.Programa;

public record ProgramaDTO(
        Long id,
        String nome,
        String sigla,
        String descricao
) {
    public ProgramaDTO(Programa programa) {
        this(programa.getId(), programa.getNome(), programa.getSigla(), programa.getDescricao());
    }
}