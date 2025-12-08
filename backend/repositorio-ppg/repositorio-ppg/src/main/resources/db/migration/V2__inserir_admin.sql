INSERT INTO usuarios (nome, email, senha, perfil, ativo) 
VALUES (
    'Administrador do Sistema', 
    'admin@uema.br', 
    'senha', 
    'ADMIN',
    true
)
ON CONFLICT (email) DO NOTHING;