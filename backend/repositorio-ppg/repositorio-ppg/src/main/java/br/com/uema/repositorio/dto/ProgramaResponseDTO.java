package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.Programa;

public record ProgramaResponseDTO(Long id, String nome, String sigla) {
    public ProgramaResponseDTO(Programa programa) {
        this(programa.getId(), programa.getNome(), programa.getSigla());
    }
}