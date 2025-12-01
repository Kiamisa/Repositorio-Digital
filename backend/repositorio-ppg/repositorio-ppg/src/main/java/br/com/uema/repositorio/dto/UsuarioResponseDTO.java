package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.PerfilUsuario;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        String email,
        PerfilUsuario perfil,
        Boolean ativo
) {
    // Construtor auxiliar para converter Entidade -> DTO facilmente
    public UsuarioResponseDTO(Usuario usuario) {
        this(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(), usuario.getAtivo());
    }
}