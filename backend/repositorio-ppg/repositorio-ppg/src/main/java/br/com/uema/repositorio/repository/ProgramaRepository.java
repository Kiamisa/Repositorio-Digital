package br.com.uema.repositorio.repository;

import br.com.uema.repositorio.entity.Programa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProgramaRepository extends JpaRepository<Programa, Long> {
    Optional<Programa> findBySigla(String sigla);
}