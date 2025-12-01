package br.com.uema.repositorio.controller;

import br.com.uema.repositorio.dto.LoginRequestDTO;
import br.com.uema.repositorio.dto.TokenResponseDTO;
import br.com.uema.repositorio.entity.Usuario;
import br.com.uema.repositorio.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private TokenService tokenService;

    @PostMapping
    public ResponseEntity<TokenResponseDTO> efetuarLogin(@RequestBody @Valid LoginRequestDTO dados) {
        // O Spring Security faz a mágica de verificar a senha criptografada aqui
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        var authentication = manager.authenticate(authenticationToken);

        // Se passar, gera o token
        var tokenJWT = tokenService.gerarToken((Usuario) authentication.getPrincipal());

        return ResponseEntity.ok(new TokenResponseDTO(tokenJWT));
    }
}