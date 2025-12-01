package br.com.uema.repositorio.service;

import br.com.uema.repositorio.dto.UsuarioRequestDTO;
import br.com.uema.repositorio.dto.UsuarioResponseDTO;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.exception.RecursoNaoEncontradoException;
import br.com.uema.repositorio.exception.RegraNegocioException;
import br.com.uema.repositorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor // Cria construtor automático para as dependências final
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioRequestDTO dados, boolean autoAprovado) {
        if (usuarioRepository.existsByEmail(dados.email())) {
            throw new RegraNegocioException("Já existe um usuário com este e-mail.");
        }

        // Se for autoAprovado (criado por admin), nasce Ativo.
        // Se for cadastro público, nasce Inativo (false).
        boolean ativo = autoAprovado;

        Usuario novoUsuario = Usuario.builder()
                .nome(dados.nome())
                .email(dados.email())
                .senha(passwordEncoder.encode(dados.senha()))
                .perfil(dados.perfil())
                .ativo(ativo) // <--- Define aqui
                .build();

        usuarioRepository.save(novoUsuario);
        return new UsuarioResponseDTO(novoUsuario);
    }

    // Adicione método para ATIVAR usuário (Aprovação)
    @Transactional
    public void ativarUsuario(Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        usuario.setAtivo(true);
        usuarioRepository.save(usuario);
    }

    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::new)
                .toList();
    }
}