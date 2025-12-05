package br.com.uema.repositorio.repository;

import br.com.uema.repositorio.entity.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    @Query("SELECT d FROM Documento d JOIN FluxoAprovacao f ON f.documento = d WHERE f.estado = 'APROVADO'")
    List<Documento> findAllAprovados();
}