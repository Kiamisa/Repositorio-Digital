package br.com.uema.repositorio.entity;

import br.com.uema.repositorio.enums.EstadoAprovacao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fluxo_aprovacao")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FluxoAprovacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "documento_id", nullable = false)
    private Documento documento;

    @ManyToOne
    @JoinColumn(name = "usuario_aprovador_id")
    private Usuario aprovador;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "estado_aprovacao", nullable = false)
    private EstadoAprovacao estado;

    @Column(columnDefinition = "TEXT")
    private String comentarios;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}