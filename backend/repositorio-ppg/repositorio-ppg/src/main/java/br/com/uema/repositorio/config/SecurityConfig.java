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

import java.time.OffsetDateTime;
import java.util.Arrays;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(authorize -> authorize
                        // 1. INFRAESTRUTURA (Essencial para não dar erro de CORS/401 no frontend)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // <--- LIBERA O PREFLIGHT

                        // 2. ACESSOS PÚBLICOS
                        .requestMatchers("/login", "/auth/login").permitAll()
                        .requestMatchers("/usuarios/registro-publico").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()

                        // 3. REGRAS DE NEGÓCIO (Baseadas no Legado)

                        // Download e Leitura: Permitido para todos os usuários logados
                        .requestMatchers(HttpMethod.GET, "/documentos/**", "/documentos/download/**")
                        .hasAnyRole("ESTAGIARIO", "FUNCIONARIO", "GESTOR", "ADMIN")

                        // Upload: Permitido para todos logados
                        .requestMatchers(HttpMethod.POST, "/documentos")
                        .hasAnyRole("ESTAGIARIO", "FUNCIONARIO", "GESTOR", "ADMIN")

                        // Edição/Exclusão: Estagiário NÃO pode
                        .requestMatchers(HttpMethod.PUT, "/documentos/**").hasAnyRole("FUNCIONARIO", "GESTOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/documentos/**").hasAnyRole("FUNCIONARIO", "GESTOR", "ADMIN")

                        // Aprovação e Gestão de Usuários: Apenas Chefia
                        .requestMatchers("/aprovacoes/**").hasAnyRole("GESTOR", "ADMIN")
                        .requestMatchers("/usuarios/**").hasAnyRole("GESTOR", "ADMIN")

                        // Bloqueia qualquer outra coisa não mapeada
                        .anyRequest().authenticated()
                )

                // 4. TRATAMENTO DE ERROS EM JSON (Para o frontend entender o erro)
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
                                    "message", "Seu perfil não tem permissão para realizar esta ação",
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
        // Libera o frontend (React/Vite)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Content-Disposition"));
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