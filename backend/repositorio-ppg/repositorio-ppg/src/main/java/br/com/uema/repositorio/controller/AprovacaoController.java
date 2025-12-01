package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.dto.FluxoAprovacaoResponseDTO;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.EstadoAprovacao;
import br.com.uema.repositorio.exception.RecursoNaoEncontradoException;
import br.com.uema.repositorio.repository.FluxoAprovacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aprovacoes")
@RequiredArgsConstructor
public class AprovacaoController {

    private final FluxoAprovacaoRepository fluxoRepository;

    // Apenas Gestores e Admins podem ver a fila de aprovação
    @GetMapping("/pendentes")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<List<FluxoAprovacaoResponseDTO>> listarPendentes() { // Mudou o tipo de retorno

        var pendentes = fluxoRepository.findAll().stream()
                .filter(f -> f.getEstado() == EstadoAprovacao.PENDENTE)
                .map(FluxoAprovacaoResponseDTO::new) // Converte Entidade -> DTO
                .toList();

        return ResponseEntity.ok(pendentes);
    }

    @PatchMapping("/{idFluxo}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public ResponseEntity<Void> analisarDocumento(
            @PathVariable Long idFluxo,
            @RequestParam boolean aprovado,
            @RequestParam(required = false) String comentario,
            @AuthenticationPrincipal Usuario gestor
    ) {
        var fluxo = fluxoRepository.findById(idFluxo)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Fluxo não encontrado"));

        fluxo.setEstado(aprovado ? EstadoAprovacao.APROVADO : EstadoAprovacao.REJEITADO);
        fluxo.setAprovador(gestor);
        fluxo.setComentarios(comentario);

        fluxoRepository.save(fluxo);
        return ResponseEntity.noContent().build();
    }
}