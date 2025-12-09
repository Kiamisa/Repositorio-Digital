package br.com.uema.repositorio.config;

import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.enums.PerfilUsuario;
import br.com.uema.repositorio.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (usuarioRepository.findByEmail("admin@uema.br").isEmpty()) {
            System.out.println("--- SEEDER: Criando Usuário Admin ---");

            Usuario admin = new Usuario();
            admin.setNome("Administrador do Sistema");
            admin.setEmail("admin@uema.br");
            admin.setSenha(passwordEncoder.encode("123456"));
            admin.setPerfil(PerfilUsuario.ADMIN); // O Enum Java puro
            admin.setAtivo(true);

            usuarioRepository.save(admin);

            System.out.println("--- SEEDER: Sucesso! ---");
        }
    }
}