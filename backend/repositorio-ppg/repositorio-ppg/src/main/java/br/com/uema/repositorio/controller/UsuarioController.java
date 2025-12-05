package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.dto.UsuarioRequestDTO;
import br.com.uema.repositorio.dto.UsuarioResponseDTO;
import br.com.uema.repositorio.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Rota Pública: Qualquer um pode se registrar, mas nasce INATIVO
    @PostMapping("/registro-publico")
    public ResponseEntity<UsuarioResponseDTO> registroPublico(@RequestBody @Valid UsuarioRequestDTO dados) {
        // Passamos false: requer aprovação
        var usuario = usuarioService.criarUsuario(dados, false);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<UsuarioResponseDTO> criarPeloAdmin(@RequestBody @Valid UsuarioRequestDTO dados) {
        // Passamos true: já nasce aprovado
        var usuario = usuarioService.criarUsuario(dados, true);
        return ResponseEntity.status(HttpStatus.CREATED).body(usuario);
    }

    // Rota Restrita: Admin/Gestor aprova cadastro pendente
    @PatchMapping("/{id}/ativar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Void> ativarUsuario(@PathVariable Long id) {
        usuarioService.ativarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
}