package br.com.uema.repositorio.dto;

import br.com.uema.repositorio.enums.TipoDocumento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentoRequestDTO {

    @NotBlank(message = "O título é obrigatório")
    private String titulo;

    private String descricao;

    @NotNull(message = "O tipo do documento é obrigatório")
    private TipoDocumento tipo;

    @NotNull(message = "A data de publicação é obrigatória")
    private LocalDate dataPublicacao;

    @NotNull(message = "O ID do programa é obrigatório")
    private Long programaId;

    //@NotNull(message = "O arquivo é obrigatório")
    private MultipartFile arquivo;
}