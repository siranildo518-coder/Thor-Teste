# Thor-Teste C74 — cadastro com foto

Fluxo: preencher código, usuário e senha → continuar → permitir câmera → tirar foto → autorizar envio → enviar → confirmação de gravação e leitura do Firebase → concluir cadastro → mostrar Entrar.

Publicado apenas no Thor-Teste. Não altera o gerenciador de códigos nem o THOR-LOTERIAS.

## Configuração necessária no Firebase

1. Authentication: habilitar provedor Anonymous, se ainda não estiver habilitado.
2. Firestore Rules: inserir o bloco de fotos-cadastro-teste.rules.txt dentro do escopo documents, preservando regras existentes. Antes de publicar, revisar regras amplas: Firestore soma permissões; uma regra pública global torna este bloco insuficiente.
3. Testar no simulador que visitantes e outros UIDs não leem as fotos; o proprietário lê somente seu documento; somente o UID administrativo lista todas as fotos.
4. Abrir painel-fotos-teste.html e entrar com o administrador já utilizado no painel atual.

Sem essas configurações, o app mostra erro e não conclui o cadastro. Não há acesso administrativo ao Firebase disponível nesta sessão para publicar ou verificar essas regras.

## Limites do teste

A câmera é obrigatória no cadastro novo. Cadastros anteriores continuam com o login existente. O código legado continua responsável por validar a liberação. A foto mostra a imagem capturada, mas esta versão não reconhece rostos nem verifica identidade. A associação com usuário segue o hash legado do aplicativo, não uma identidade de usuário verificada pelo Firebase; não usar como prova de identidade. A aplicação cliente não impede adulteração por alguém com conhecimento técnico.

O APK precisa permitir getUserMedia no WebView; o teste por navegador HTTPS pode funcionar mesmo se um APK antigo não tiver a permissão. A câmera para ao capturar, cancelar ou sair da página. Não há envio de senha nem de código de liberação no documento da foto.

O envio tem limite de 20 segundos e pode ser repetido; o botão Entrar só aparece após confirmação. Uma foto pode permanecer como cadastro incompleto se a criação da conta falhar depois do upload. A exclusão dessas fotos é administrativa.
