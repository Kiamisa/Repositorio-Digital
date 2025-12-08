package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.entity.FluxoAprovacao;
import br.com.uema.repositorio.entity.Programa;
import br.com.uema.repositorio.enums.EstadoAprovacao;
import br.com.uema.repositorio.enums.TipoDocumento;
import br.com.uema.repositorio.repository.DocumentoRepository;
import br.com.uema.repositorio.repository.FluxoAprovacaoRepository;
import br.com.uema.repositorio.repository.ProgramaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DocumentoControllerIT {

    @Autowired private MockMvc mockMvc;
    @Autowired private DocumentoRepository documentoRepository;
    @Autowired private ProgramaRepository programaRepository;
    @Autowired private FluxoAprovacaoRepository fluxoAprovacaoRepository;

    @BeforeEach
    void setup() {
        fluxoAprovacaoRepository.deleteAll();
        documentoRepository.deleteAll();
        programaRepository.deleteAll();
    }

    @Test
    void listarDocumentos_DeveRetornarJSONCorreto() throws Exception {
        // 1. Cenário
        Programa prog = new Programa();
        prog.setNome("Mestrado em Engenharia");
        prog.setSigla("TESTE_IT_02");
        programaRepository.save(prog);

        Documento doc = Documento.builder()
                .titulo("Edital Teste Integração")
                .tipo(TipoDocumento.EDITAIS)
                .dataPublicacao(LocalDate.now())
                .caminhoArquivo("path/dummy.pdf")
                .programa(prog)
                .build();
        documentoRepository.save(doc);


        FluxoAprovacao fluxo = FluxoAprovacao.builder()
                .documento(doc)
                .estado(EstadoAprovacao.APROVADO)
                .build();
        fluxoAprovacaoRepository.save(fluxo);

        mockMvc.perform(get("/documentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Edital Teste Integração"))
                .andExpect(jsonPath("$[0].nomePrograma").value("Mestrado em Engenharia"))
                .andExpect(jsonPath("$[0].tipo").value("EDITAIS"));
    }
}