package br.com.uema.repositorio.service;

import br.com.uema.repositorio.dto.UsuarioRequestDTO;
import br.com.uema.repositorio.dto.UsuarioResponseDTO;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.exception.RecursoNaoEncontradoException;
import br.com.uema.repositorio.exception.RegraNegocioException;
import br.com.uema.repositorio.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
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
                .ativo(ativo)
                .build();

        usuarioRepository.save(novoUsuario);
        return new UsuarioResponseDTO(novoUsuario);
    }

    @Transactional
    public void ativarUsuario(@NonNull Long id) {
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

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioRequestDTO dados) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado"));
        
        usuario.setNome(dados.nome());
        usuario.setEmail(dados.email());
        usuario.setPerfil(dados.perfil());
        
        // // Só atualiza senha se for enviada uma nova (lógica opcional)
        // if (dados.senha() != null && !dados.senha().isBlank()) {
        //     usuario.setSenha(passwordEncoder.encode(dados.senha()));
        // }

        return new UsuarioResponseDTO(usuarioRepository.save(usuario));
    }

    @Transactional
    public void excluirUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}