package br.com.uema.repositorio.service;


import br.com.uema.repositorio.dto.DocumentoRequestDTO;
import br.com.uema.repositorio.dto.DocumentoResponseDTO;
import br.com.uema.repositorio.entity.Documento;
import br.com.uema.repositorio.entity.FluxoAprovacao;
import br.com.uema.repositorio.entity.Programa;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.PerfilUsuario;
import br.com.uema.repositorio.enums.TipoDocumento;
import br.com.uema.repositorio.repository.DocumentoRepository;
import br.com.uema.repositorio.repository.FluxoAprovacaoRepository;
import br.com.uema.repositorio.repository.ProgramaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DocumentoServiceTest {

    @Mock private DocumentoRepository documentoRepository;
    @Mock private ProgramaRepository programaRepository;
    @Mock private FluxoAprovacaoRepository fluxoAprovacaoRepository;

    @InjectMocks private DocumentoService documentoService;

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(documentoService, "uploadDir", "./uploads-test");
        ReflectionTestUtils.setField(documentoService, "fluxoAprovacaoRepository", fluxoAprovacaoRepository);
    }

    @Test
    void uploadQuandoAdminEnviaDocumentoEntaoSucesso() {
        Usuario admin = new Usuario();
        admin.setPerfil(PerfilUsuario.ADMIN);

        Programa programa = new Programa();
        programa.setId(1L);
        programa.setNome("PPG Programação");

        MockMultipartFile file = new MockMultipartFile("arquivo", "teste.pdf", "application/pdf", "conteudo".getBytes());

        DocumentoRequestDTO dto = new DocumentoRequestDTO("Edital 01", "Desc", TipoDocumento.EDITAIS, java.time.LocalDate.now(), 1L, file);

        when(programaRepository.findById(1L)).thenReturn(Optional.of(programa));
        when(documentoRepository.save(any(Documento.class))).thenAnswer(i -> i.getArgument(0));

        DocumentoResponseDTO resultado = documentoService.upload(dto, admin);

        assertNotNull(resultado);
        assertEquals("Edital 01", resultado.titulo());
        assertEquals("PPG Programação", resultado.nomePrograma());

        verify(fluxoAprovacaoRepository, times(1)).save(any(FluxoAprovacao.class));
    }

}
