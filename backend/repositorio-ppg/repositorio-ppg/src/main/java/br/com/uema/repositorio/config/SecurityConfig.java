package br.com.uema.repositorio.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Aplica a configuração de CORS definida no Bean abaixo
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(authorize -> authorize
                        // Permite OPTIONS para evitar erro de preflight no navegador
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Acessos Públicos (Front e Python acessam aqui)
                        .requestMatchers("/auth/**", "/login").permitAll()
                        .requestMatchers("/usuarios/registro-publico").permitAll()

                        // IMPORTANTE: Permite GET publicamente para a IA ler os documentos
                        .requestMatchers(HttpMethod.GET, "/documentos/**").permitAll()

                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // Endpoints protegidos (Upload, Edição, Delete)
                        .requestMatchers(HttpMethod.POST, "/documentos").hasAnyRole("ESTAGIARIO", "FUNCIONARIO", "GESTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/documentos/**").hasAnyRole("FUNCIONARIO", "GESTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/documentos/**").hasAnyRole("FUNCIONARIO", "GESTOR", "ADMIN")

                        .requestMatchers("/aprovacoes/**").hasAnyRole("GESTOR", "ADMIN")
                        .requestMatchers("/usuarios/**").hasAnyRole("GESTOR", "ADMIN")

                        .anyRequest().authenticated()
                )

                // Tratamento de Erros JSON
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            new ObjectMapper().writeValue(response.getOutputStream(), Map.of(
                                    "status", 401,
                                    "error", "Unauthorized",
                                    "message", "Token inválido ou ausente",
                                    "path", request.getRequestURI()
                            ));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            new ObjectMapper().writeValue(response.getOutputStream(), Map.of(
                                    "status", 403,
                                    "error", "Forbidden",
                                    "message", "Acesso negado: Perfil sem permissão",
                                    "path", request.getRequestURI()
                            ));
                        })
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}