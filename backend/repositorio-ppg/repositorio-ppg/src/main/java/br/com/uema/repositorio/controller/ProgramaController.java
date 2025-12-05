package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.dto.ProgramaResponseDTO;
import br.com.uema.repositorio.repository.ProgramaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/programas")
public class ProgramaController {

    @Autowired
    private ProgramaRepository programaRepository;

    @GetMapping
    public ResponseEntity<List<ProgramaResponseDTO>> listarProgramas() {
        // Busca todos os programas do banco
        var programas = programaRepository.findAll();

        // Converte para DTO
        var dtos = programas.stream()
                .map(ProgramaResponseDTO::new)
                .toList();

        return ResponseEntity.ok(dtos);
    }
}