# Planeja Aê

Sistema de planejamento de Instagram por marca: calendário, postagens, fluxo de produção, grade do feed e resumo do mês.

- O **site** fica no GitHub Pages (arquivos `index.html` e `config.js`).
- Os **dados** ficam na sua planilha do Google, nas abas `MARCAS` e `POSTAGENS`.
- Cada pessoa entra com o próprio login e senha. O administrador cadastra a equipe e escolhe as marcas de cada um.

> **Novo:** a pasta `afazeres/` tem o **Feito!**, um app pessoal de afazeres pensado para neurodivergentes (fica em `.../afazeres/` no mesmo site). Passo a passo em `afazeres/LEIAME.md`.

---

## 1. Ligar a planilha (Google Apps Script)

1. Abra a planilha no Google Sheets.
2. Clique em **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo do arquivo `apps-script/Codigo.gs`. Clique em **Salvar** (ícone de disquete).
4. No topo do editor, escolha a função **configurar** e clique em **Executar**.
   - Na primeira vez, o Google pede autorização: **Revisar permissões → escolha sua conta → Avançado → Acessar (não seguro) → Permitir**. Isso aparece porque o script é seu e não passou por verificação do Google.
   - A função cria as abas que faltarem (`MARCAS`, `POSTAGENS` e `USUARIOS`, que fica oculta), importa o que estiver nas abas `DETALHAMENTO` se `POSTAGENS` estiver vazia e atualiza os status antigos.
   - Ela também cria **você como administrador** e manda a **senha provisória para o seu e-mail** (ela não aparece mais no Registro de execução). Depois de entrar no site, troque a senha em **Minha conta**.
5. Clique em **Implantar → Nova implantação**.
   - Em "Selecione o tipo", clique na engrenagem e escolha **App da Web**.
   - **Executar como:** Eu.
   - **Quem pode acessar:** Qualquer pessoa.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

## 2. Colocar o site no ar (GitHub Pages)

1. Entre em [github.com](https://github.com) e clique em **New repository**.
   - Nome: por exemplo `planejamento-conteudo`. Deixe como **Public**. Clique em **Create repository**.
2. Na página do repositório, clique em **uploading an existing file**.
3. Antes de enviar, abra o `config.js` num editor de texto e cole o URL do passo 1 entre as aspas:
   ```js
   API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec"
   ```
4. Arraste `index.html` e `config.js` para a página e clique em **Commit changes**.
   (A pasta `apps-script` não precisa ir para o GitHub.)
5. Vá em **Settings → Pages**. Em "Branch", escolha **main** e a pasta **/ (root)**. Clique em **Save**.
6. Em um ou dois minutos o endereço aparece no topo dessa tela, algo como
   `https://seu-usuario.github.io/planejamento-conteudo/`. Esse é o link para mandar para a equipe.

## 3. Cadastrar a equipe

Entre no site como administrador e abra a aba **Equipe** → **+ Pessoa**:

| Papel | O que vê | O que faz |
|---|---|---|
| **Administrador** | Todas as marcas | Tudo: cadastra pessoas e marcas, aprova, muda qualquer status |
| **Diretor** | Todas as marcas | Tudo o que o gestor faz + cadastra gestores, social medias e aprovadores, cria marcas, muda configurações e pode forçar status. Não exclui marcas e não mexe em administradores nem em outros diretores |
| **Gestor** | As liberadas para ele (ou todas) | Gerente da equipe: acompanha a **Atividade da equipe**, cria e edita postagens, preenche as marcas, valida e aprova. Não cadastra pessoas e não cria/exclui marcas |
| **Social media** | Só as marcas marcadas para ele | Cria e edita postagens, preenche a marca (inclusive nome, fases e configurações), envia para validação e aprovação, marca como agendado/postado |
| **Aprovador** | As marcas marcadas para ele (ou "Todas") | Valida ideias e aprova conteúdos, sempre escrevendo o motivo quando não aprova |

Não há limite de pessoas nem de marcas por pessoa. Para tirar o acesso de alguém, desmarque **Acesso ativo**.
Para **mudar o papel** de alguém (por exemplo, de Gestor para Diretor), escolha o novo papel na coluna **Papel** da lista, confira as marcas e clique em **Salvar**. Para escolher **quais marcas cada pessoa vê** (gestor, social media, aprovadores e cliente), abra a caixa da coluna **Marcas** e marque quantas quiser; salva sozinho. Administrador e diretor sempre veem todas. Cada pessoa pode colocar a **foto de perfil** em **Minha conta**.
Ao salvar uma pessoa com senha (use **Gerar senha**), aparece a mensagem de boas-vindas pronta, adaptada ao papel dela, com as marcas, o login, a senha provisória e o link do site, e o botão **Enviar pelo WhatsApp** (preencha o WhatsApp da pessoa com DDD). Ela troca a senha e o nome em **Minha conta**.

## Resumo do mês (dashboard)

A aba **Resumo do mês** mostra o relatório pronto para apresentar: postagens planejadas e postadas, % aprovado de primeira, ideias validadas de primeira, tempo médio até aprovar, andamento, postagens por semana, formatos, tipos de agendamento, produtos, objetivos, desempenho por marca e por pessoa e os motivos das devoluções. Dá para ver uma marca ou **todas as marcas** e baixar em **PDF** (A4 deitado), **imagem (PNG)** ou **planilha (CSV)**.

## Tarefas

A aba **Tarefas** é o checklist da equipe: o que fazer, detalhes, marca (opcional), responsável, prioridade (Urgente, Alta, Média, Baixa), data para fazer e prazo máximo. A lista fica separada em **Atrasadas, Para hoje, Próximas e Sem data**, ordenada pela prioridade e pelo prazo; a caixinha marca como feita.

- **☰ Lista ou ▦ Quadro**: o quadro (kanban) tem as colunas **A fazer, Fazendo e Feita**. Arraste o cartão de uma coluna para outra ou use as setas ◀ ▶ (no celular). O site lembra qual modo você prefere. Tarefas atrasadas ficam com borda vermelha.
- Filtros: **Minhas tarefas**, **Que eu passei** e **Todas** (a gestão vê todas; os demais veem as das suas marcas), por marca e mostrar feitas.
- Quem recebe uma tarefa é avisado no **sino** e por **e-mail**; quem criou é avisado no sino quando ela é concluída.
- O número vermelho na aba mostra as suas tarefas atrasadas ou para hoje.
- Editam/concluem: quem criou, o responsável e a gestão. Excluem: quem criou e a gestão.
- Ficam na aba `TAREFAS` da planilha.

## Avisos por e-mail

O sistema manda e-mail (pela conta Google dona da planilha) quando:

- **uma ideia ou conteúdo é enviado** → para o **aprovador** da marca (sem aprovador: o gestor da marca; sem gestor: diretor e administrador);
- **uma ideia é validada ou reprovada** e **um conteúdo é aprovado ou volta com ajustes** → para **quem enviou**, com o motivo.

Cada pessoa liga ou desliga os avisos em **Minha conta**. O Gmail comum permite cerca de **100 e-mails por dia**; acima disso os avisos param até o dia seguinte, mas o sistema continua funcionando.

**Na primeira vez**, depois de colar o código novo, rode **configurar** de novo no Apps Script para autorizar o envio de e-mails, e só então faça **Implantar → Gerenciar implantações → ✏️ → Nova versão**.

## Acessos das contas da marca

Em **Marca → Acessos** ficam os logins de cada conta (Instagram, TikTok, Facebook, Canva…): plataforma, usuário/@, e-mail, senha, chave de acesso (se tiver) e observação. Dá para adicionar quantas contas quiser.

- Os acessos **não ficam na planilha**: vão para as Propriedades do script, que só quem abre o Apps Script vê.
- Só aparecem para a **social media da marca, o gestor, o diretor e o administrador**. O aprovador não vê.
- Senha e chave ficam escondidas: 👁 mostra, ⧉ copia.
- Numa conta de Instagram com chave preenchida, o botão **Usar esta chave na Grade do Insta** conecta a grade.

Recomendação: ative a verificação em duas etapas nas contas dos clientes e troque a senha quando alguém sair da equipe.

## Grade do Insta com os posts reais do perfil

Na **Grade do Insta**, a **bolinha verde** marca o que já foi postado; sem bolinha, ainda não foi. Ligando o Instagram de uma marca, a grade mostra também os posts que já estão no perfil (os 36 mais recentes), misturados por data com os planejados.

**Conectar (pelo login do Facebook):**

Requisitos: o Instagram de cada marca precisa ser **profissional** e estar **ligado a uma Página do Facebook** que você administra.

1. Em [developers.facebook.com](https://developers.facebook.com), use o app com o caso de uso **"Gerenciar mensagens e conteúdo no Instagram"** (login do Facebook). Em **Casos de uso → Personalizar → Permissões e recursos**, deixe adicionadas **instagram_basic**, **pages_show_list** e **pages_read_engagement** (e **business_management**, se as Páginas estão num portfólio empresarial).
2. Abra o **Explorador da Graph API**: [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer). À direita, escolha o seu app, **Token do usuário**, adicione as permissões acima e clique em **Gerar token de acesso**. Na janela do Facebook, marque **as Páginas das marcas** e os Instagrams delas.
3. **Estenda a chave** (senão ela vence em 1 hora): abra [developers.facebook.com/tools/debug/accesstoken](https://developers.facebook.com/tools/debug/accesstoken), cole a chave, clique em **Depurar** e, no fim da página, em **Estender token de acesso**. Copie a chave nova.
4. No sistema: preencha o **@ da marca** em **Marca → Sobre** e, em **Marca → Configurações → Instagram da marca**, cole a chave e clique em **Conectar**.

A mesma chave serve para **todas as marcas** cujas Páginas você marcou no passo 2: é só repetir o passo 4 em cada marca. O sistema guarda a chave da Página (que não vence) só no script da planilha. Se você tirar o acesso do app no Facebook ou perder a administração da Página, gere outra chave.

Também funciona com a chave do **login do Instagram** (começa com "IG"), se esse tipo aparecer no seu app.

## Atividade da equipe

Em **Equipe → Atividade** (o administrador, o diretor e o gestor veem): último acesso de cada pessoa, quantas postagens criou, editou e enviou, quantas validou/aprovou ou devolveu, pendências e a lista das últimas ações. Quem fica 3 dias sem sinal aparece em vermelho.

## Aprovação do cliente e visualização como Instagram

- **Aprovador (cliente):** cadastre em **Equipe → + Pessoa** com o papel "Aprovador (cliente)" e marque as marcas dele. Ele vê só **Aprovações, Calendário e Grade do Insta** dessas marcas, sem editar.
- Nas marcas com aprovador do cliente, o fluxo ganha duas etapas: depois que a equipe valida a ideia ela vai para **Validação do cliente**; depois que a equipe aprova o conteúdo ele vai para **Aprovação do cliente**. Reprovar ou pedir ajustes exige o motivo, como na equipe. Marcas sem cliente cadastrado seguem o fluxo de sempre.
- A gestão (administrador, diretor e gestor) pode aprovar **pelo cliente** quando ele aprova por outro canal (seção "Com o cliente" nas Aprovações).
- **Visualização:** cada pessoa escolhe em **Minha conta** entre **Detalhada** e **Como Instagram** (o cliente começa em Instagram). Dá para trocar nas Aprovações e dentro da postagem. O modo Instagram mostra foto de perfil e @ (de Marca → Sobre e Arquivos e identidade → Foto de perfil), carrossel com setas e bolinhas, vídeo com play e legenda com "mais".
- **Puxar da pasta:** na postagem, cole o link da pasta do Drive em "Link da publicação" e clique em **Puxar da pasta**. O sistema traz as imagens e vídeos na ordem do número no nome (1, 2, 3…) e a legenda do Google Docs da pasta (o que vem depois de "Legenda"; sem esse título, o documento inteiro). Os arquivos de mídia ficam visíveis para quem tem o link, para aparecerem na prévia e para o cliente.

## Stories

Aba **Stories**: calendário do mês só de stories.
- No topo, as bolinhas de hoje e dos próximos 6 dias, como no Instagram (colorida = tem story para postar; cinza = tudo postado).
- Clique na bolinha (ou num story do dia) para ver a sequência **como no Instagram**: passa sozinho a cada 5 segundos, com as barrinhas no topo, e dá para pausar, voltar e avançar. Ao lado aparece a lista do dia; as setas ▲▼ mudam a ordem.
- **+ Novo story** (ou o + do dia): tipo, texto na tela, figurinha (enquete, caixinha, quiz, link, contagem, música, menção…), cor de fundo ou arquivo do Drive, roteiro, link e status (Planejado → Produzido → Aprovado → Postado). A prévia do celular muda enquanto você escreve.
- Arraste um story para outro dia para mudar a data.
- O aprovador do cliente vê os stories, mas não edita.

## Comentários, prazos e repetição

- **Comentários:** cada postagem tem uma conversa (no editor e nas Aprovações). Dá para dizer sobre qual arte do carrossel é o comentário. O cliente também comenta. Os comentários aparecem no sino.
- **Prazos:** cada postagem tem **prazo da arte** e **prazo da aprovação** (uma postagem nova já vem com 5 e 2 dias antes do post). O que passou do prazo aparece com ⚠ no calendário e numa lista **Postagens atrasadas** em Tarefas.
- **Repetir:** no editor, **Repetir** cria cópias da postagem toda semana, a cada 2 semanas ou todo mês (até 12), já como Ideia.

## Link de aprovação sem senha (cliente)

- Em **Equipe**, ao lado do aprovador do cliente, **🔗 Link sem senha** manda **para o e-mail do cliente** um link que entra direto na conta dele. O link vale 14 dias e **só funciona uma vez**.
- Por segurança, o link não aparece na tela e não dá mais para copiar nem mandar no WhatsApp: assim ninguém da equipe consegue entrar como o cliente nem encaminhar o acesso. O login do cliente precisa ser um e-mail.
- Nas **Aprovações**, quando há posts esperando o cliente, aparece o botão para mandar o link.
- Os e-mails de "post para aprovar" que vão para o cliente já levam esse link.

## Publicação automática no Instagram

Com o Instagram da marca conectado, ao **Agendar** aparece **Publicar sozinho pelo sistema**: no dia e hora marcados o sistema publica as artes e a legenda (foto, carrossel, Reels ou Story) e a postagem vira **Postado** com o link. Também há **Publicar agora no Instagram** na postagem aprovada e no story.
- A chave precisa da permissão **instagram_content_publish** (Página do Facebook) ou **instagram_business_content_publish** (login do Instagram). Se a chave atual não tiver, gere outra marcando essa permissão.
- As artes precisam estar no Drive (o sistema deixa o arquivo como "qualquer pessoa com o link" para o Instagram baixar).
- Figurinhas de story, música e marcação de produto não vão pela publicação automática: para esses, poste pelo app.
- Se der erro, o motivo aparece na postagem e ela continua Agendada.

## Resultados dos posts

No **Resumo do mês**, com o Instagram conectado, aparece **Resultados dos posts**: curtidas, comentários, alcance, salvamentos, compartilhamentos e engajamento de cada post publicado, os totais e o melhor post do mês. Entram os posts publicados pelo sistema e os marcados como postados com o link do Instagram.

## Automáticos (resumo diário, cópia de segurança e publicação)

Ao rodar **configurar**, o script cria quatro rotinas (a quarta é o relatório mensal para o cliente, no dia 1):
- **Resumo diário por e-mail** (segunda a sexta, às 8h): cada pessoa recebe só o que é dela (aprovações pendentes, devolvidos, prazos vencendo, posts e stories do dia, tarefas). O cliente recebe com o link sem senha.
- **Cópia de segurança** toda segunda de madrugada, na pasta "Planejamento de Conteúdo - Cópias de segurança" do seu Drive (guarda as 8 últimas).
- **Publicação automática**: confere a cada 15 minutos se há post ou story para publicar.

## Novidades de novembro (tarefas, carga, arte, modelos, avisos e acesso)

**Tarefas mais completas.** Dentro de cada tarefa:
- **Checklist**: quebre em passos ("roteiro", "gravar", "editar"). Marcar um item salva na hora. O cartão mostra ☑ 2/5.
- **Links e anexos**: Drive, Canva, referência. Só aceita links `https://`.
- **Comentários**: quem é responsável e quem criou recebem aviso.
- **Repetir** (toda semana, a cada 15 dias, todo mês): ao concluir, a próxima já é criada com as datas puladas e o checklist zerado.

**Carga da equipe** (Equipe → Carga): mostra quanto cada pessoa tem na semana (tarefas, atrasadas, posts para produzir, posts para aprovar e horas em reunião), com a barra Livre / Tranquila / Cheia / Sobrecarregada. Clique na pessoa para ver a lista. Use as setas para ver outras semanas.

**Ajuste marcado na arte.** No post (editor ou aprovação), **📍 Marcar na arte**: toque no ponto da arte que precisa mudar e escreva. O ponto fica numerado em cima da imagem e aparece nos comentários como "📍 ver na arte". Funciona em carrossel (escolha a arte).

**Modelos de mês** (Calendário → 📐 Modelos de mês): salve a estrutura de um mês (dia da semana, formato, fase, produto, rede, horário; os temas são opcionais) e aplique em qualquer mês e em qualquer marca da empresa.

**Desfazer.** Depois de mudar o status no fluxo, mover um post no calendário, mover uma tarefa ou apagar uma postagem, aparece **Desfazer** por 7 segundos.

**Comparativo no relatório.** O relatório do mês (Resultados) mostra o mês atual contra o anterior: postagens, postadas, aprovadas de primeira, dias até aprovar e, com o Instagram conectado, curtidas, comentários, alcance, salvamentos e compartilhamentos. Vai junto no PDF.

**Avisos no celular, mesmo com o app fechado.** Em **Minha conta → Avisar neste aparelho**. Use **Mandar um aviso de teste** para conferir. Chega aviso de post para aprovar ou devolvido, tarefa nova, comentário em tarefa e reunião.
- No iPhone, só funciona pelo app: Safari → Compartilhar → **Adicionar à Tela de Início**, abra por lá e ligue.
- O aviso sai sem conteúdo do servidor; o app busca o texto com o seu login. Ao sair da conta, o aparelho deixa de receber.

**Código por e-mail para administração e direção.** Quem é administrador, diretor ou a dona da plataforma, ao entrar num **aparelho novo**, recebe um código de 6 números por e-mail (vale 10 minutos). Dá para marcar "Confiar neste aparelho por 60 dias".

**Entrar com o Google.** A pessoa entra com a conta Google do mesmo e-mail cadastrado, sem senha. Para ligar (só a dona, uma vez):
1. Abra https://console.cloud.google.com/ com a sua conta e crie um projeto (ex.: "Planeja Aê").
2. Vá em **APIs e serviços → Tela de consentimento OAuth**: tipo **Externo**, nome do app "Planeja Aê", seu e-mail; salve e **publique**.
3. Vá em **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth** → tipo **Aplicativo da Web**.
4. Em **Origens JavaScript autorizadas**, coloque o endereço do site sem a pasta, ex.: `https://valimcreativestudio.github.io`.
5. Copie o **ID do cliente** (termina com `.apps.googleusercontent.com`) e cole em **Empresas → Entrar com o Google → Ligar**.

**Apagar uma empresa** (só a dona, em Empresas): o botão **Apagar** pede para digitar o nome da empresa. Antes de apagar, o sistema guarda uma **cópia completa em JSON** no seu Drive ("Planejamento de Conteúdo - Cópias de segurança"). Some tudo da empresa (marcas, posts, pessoas, tarefas, agenda, financeiro, registro…); as artes no Drive ficam. A sua própria empresa não pode ser apagada. Para só pausar, desmarque "Empresa ativa".

## Testes automáticos

A pasta `tests/` tem testes que simulam a planilha e abrem o site num navegador: segurança (empresas separadas, permissões, código malicioso), login com código e com Google, tarefas, quadro, marcar na arte, modelos, desfazer, apagar pessoa e empresa.
- No GitHub, eles rodam sozinhos a cada mudança (aba **Actions**). Se algo quebrar, aparece um ✗ vermelho e o GitHub manda e-mail.
- No computador: `npm install --no-save playwright && npx playwright install chromium && node tests/rodar.js`.

## Segurança (revisão de novembro de 2026)

O que o sistema faz para se proteger:

- **Permissões conferidas no servidor**: cada ação confere empresa, marca, papel e a tabela "quem vê o quê". Mexer no site pelo navegador não libera nada.
- **Empresas separadas**: ninguém lê, altera ou apaga dados de outra empresa, nem mesmo sabendo o código (ID) do item.
- **Código por e-mail** para administração, direção e dona em aparelho novo; **Entrar com o Google** opcional.
- **Senhas**: no mínimo 8 caracteres, sem senhas óbvias, guardadas embaralhadas com proteção reforçada. As senhas antigas são reforçadas sozinhas no próximo login. Depois de **5 tentativas erradas** a conta fica bloqueada por 15 minutos e a pessoa recebe um e-mail. Trocar ou redefinir a senha derruba os logins dos outros aparelhos.
- **Links dos e-mails** (aprovação, senha, briefing, propostas) usam só o **endereço oficial do site**, que só a dona da plataforma muda (em **Empresas**). Ninguém consegue fazer os e-mails apontarem para um site falso.
- **Link sem senha do cliente**: só por e-mail, uso único, 14 dias.
- **Drive**: o sistema só lê pastas e arquivos que já estejam compartilhados como "Qualquer pessoa com o link", e **nunca** torna um arquivo público sozinho.
- **Arquivos enviados**: o tipo é conferido pelo conteúdo (não só pelo nome), com limite de tamanho e de quantidade por hora.
- **Limites de uso**: IA, envio de relatórios, publicação, leitura de documentos e "esqueci a senha" têm limite por hora, para ninguém gastar sua cota ou sua chave.
- **Site**: links digitados pelas pessoas só abrem se forem `http(s)`, os textos são todos tratados antes de aparecer na tela, o site não abre dentro de outro site e há uma política de segurança (CSP) que só deixa o site falar com a planilha. As bibliotecas de PDF, imagem e Excel ficam na pasta `vendor/` do próprio site.
- **Planilhas exportadas** (CSV, Excel e a planilha do Google): textos que começam com `=`, `+`, `-` ou `@` não viram fórmula.
- **Registro**: logins, bloqueios, exportações e mudanças importantes ficam na aba `REGISTRO`.
- **Limpeza diária** apaga logins, links e chaves vencidos.

O que **depende de você** (não dá para resolver só com código):

1. **Conta Google da dona**: ative a **verificação em duas etapas** (myaccount.google.com → Segurança). Quem entra nessa conta tem tudo: planilha, script, chaves e Drive.
2. **Quem edita a planilha e o script**: deixe só você como editora. Qualquer editor do Apps Script consegue ver as chaves guardadas (Instagram, IA, Google Agenda) e todos os dados.
3. **Chaves**: se desconfiar que alguém viu uma chave (IA, Instagram), gere outra no painel do serviço e cadastre de novo no sistema.
4. **Mudou o endereço do site?** Atualize em **Empresas → Endereço oficial do site** e, se a planilha mudar de endereço, ajuste o `connect-src` da linha `Content-Security-Policy` no topo do `index.html`. Com o login com Google ligado, coloque o endereço novo também nas "Origens JavaScript autorizadas" do Google Cloud.
5. Antes de vender para muitas agências, vale um **teste de invasão** feito por outra pessoa e testar em Safari e Firefox.

## Desempenho e segurança

- O site baixa só os últimos 3 meses e os próximos; meses antigos carregam quando você navega até eles. A cada 30 segundos ele só confere se algo mudou, sem baixar tudo de novo.
- Em **Marca → Acessos** fica registrado quem abriu os acessos (últimas vezes). As senhas ficam nas propriedades do script, fora da planilha: mantenha só você como editora da planilha e do script.

## Pacote, datas, ideias e legendas prontas

- **Pacote contratado** (Marca → Pacote e legendas): quantos posts no feed, reels e stories o cliente contratou por mês. O Calendário e o Resumo mostram o que já foi planejado e publicado, quanto falta e o que passou do pacote.
- **Datas comemorativas**: feriados e datas gerais aparecem no Calendário (🎉). Marque os nichos da marca (beleza, moda, alimentação, pet…) para ver também as datas do nicho. Dá para esconder com "Mostrar datas comemorativas", embaixo do calendário.
- **Banco de ideias**: aba **Ideias**. Guarde ideias sem data; quando decidir, escolha o dia e clique em "Colocar no calendário".
- **Hashtags e modelos de legenda**: cadastre os grupos de hashtags e os textos fixos (assinatura, CTA, aviso de frete). No editor da postagem, "Inserir na legenda…" coloca com um clique.
- **Versões da arte**: quando a arte muda depois de pronta (por exemplo, num ajuste), a versão anterior fica guardada. No editor aparecem todas as versões e, nas Aprovações, "Comparar com a versão anterior" mostra o antes e o depois.

## Aprovar tudo, tempo de aprovação e relatório

- **Aprovar todos**: nas Aprovações, quando há 2 ou mais posts para validar ou aprovar, o botão aprova tudo de uma vez. Quem recebe o aviso ganha um e-mail só com a lista.
- **Tempo de aprovação** (Resumo do mês): média de quanto o aprovador e o cliente demoram para responder, por marca e por aprovador.
- **Relatório para o cliente**: no Resumo, "Enviar ao cliente por e-mail" manda o resumo do mês (posts, resultados do Instagram, destaques) com PDF anexo e o link sem senha. Marcando "Mandar o relatório do mês para o cliente" em Pacote e legendas, ele vai sozinho todo dia 1, com o mês anterior.
- **Melhor horário para postar** (Resumo, com Instagram conectado): mapa de dia e horário com o engajamento dos últimos posts e os 3 melhores momentos. Ao agendar, os melhores horários aparecem como botões que preenchem a hora.

## App no celular

- **Instalar:** abra o site no celular → iPhone: Compartilhar → Adicionar à Tela de Início; Android: menu ⋮ → Instalar app.
- **Avisos no aparelho:** em Minha conta, ligue "Avisar neste aparelho". Chega aviso de aprovação, devolução, comentário e tarefa enquanto o app ou o site estiver aberto (mesmo em segundo plano). Com tudo fechado, quem avisa é o e-mail (o Google Apps Script não consegue mandar notificação para o celular com o app fechado).

## Agenda e reuniões

Aba **Agenda** (para toda a equipe; o cliente não vê):
- **Semana, Mês ou Lista.** Mostra as suas reuniões, as suas atividades e as suas tarefas com data. Clique num horário vazio da semana para criar uma atividade ali.
- **+ Atividade:** compromisso seu (gravar, editar, visita…). Só você vê.
- **+ Reunião** (administrador, diretor e gestor): dia, horário, assunto, duração, participantes, local ou link e pauta. Os participantes recebem e-mail com o convite (abre no Google Agenda ou no celular) e respondem **Vou / Talvez / Não vou**.
- **Pedir reunião** (social media e aprovador): o pedido vai para a gestão, que **aceita** (pode mudar dia e hora) ou **recusa** com o motivo. Só depois de aceito entra na agenda de todos.
- Avisa quando o horário bate com outro compromisso seu.
- O sino e o número na aba mostram pedidos para responder e reuniões esperando a sua resposta. As reuniões do dia entram no resumo diário por e-mail.

## Empresas (várias agências no mesmo sistema)

O sistema separa tudo por **empresa** (agência). Cada empresa tem a própria equipe, marcas, posts, stories, tarefas, agenda, horas, mural, financeiro, propostas, integrações (IA, Google Agenda, trends) e e-mails. **Ninguém de uma empresa vê, edita ou recebe e-mail de outra.**

- Na atualização, tudo o que já existia vai para a empresa **Valim Creative Studio**, e a sua conta vira **dona da plataforma**.
- Como dona, você vê no topo o seletor de empresa: escolha qual está olhando ou "Todas as empresas" (para cadastrar marca, pessoa, reunião etc., escolha uma empresa).
- **Gestão → Empresas**: crie uma empresa (ex.: Belkit) já com o primeiro administrador dela (nome, e-mail e senha provisória). O sistema monta a mensagem de acesso para mandar no WhatsApp. Esse administrador cadastra o diretor, gestores, social medias e marcas da empresa dele.
- Dá para **desativar** uma empresa: ninguém dela consegue entrar até reativar.
- Os papéis continuam os mesmos dentro de cada empresa: administrador e diretor veem tudo **da empresa deles**; gestor, social media e aprovadores veem as marcas liberadas.

## Apagar uma pessoa da equipe

Em **Equipe**, clique na pessoa e use **Excluir pessoa** (embaixo do formulário). Ela perde o acesso na hora e some da equipe; posts, comentários e tarefas que ela fez continuam com o nome dela. Fica anotado no **Registro**.

- Apagam: o administrador (qualquer pessoa) e o diretor (gestores, social medias e aprovadores).
- Não dá para apagar a própria conta, a conta da dona da plataforma nem o único administrador da empresa.
- Se for só uma pausa, desmarque **Acesso ativo** em vez de apagar.

## Senha, tour, ajuda, registro e exportação

- **Esqueci minha senha:** na tela de entrar, "Esqueci minha senha" manda um link por e-mail (vale 1 hora) para criar uma senha nova. Ao criar, as sessões abertas em outros aparelhos são encerradas. Para evitar abuso, são no máximo 5 pedidos por hora.
- **Tour do primeiro acesso:** na primeira vez que cada pessoa entra, um passo a passo mostra onde fica cada coisa, diferente para cada papel (social media, aprovador, gestão, cliente). Dá para rever em **? → Rever o tour**.
- **Central de ajuda (?)** no topo: perguntas frequentes com busca, separadas por assunto e mostrando só o que faz sentido para o papel da pessoa, mais os botões para falar com a gestão ou a agência (WhatsApp e e-mail cadastrados em Minha empresa).
- **Registro** (Gestão → Registro; administrador e diretor): quem fez o quê, com data e hora. Inclui entradas no sistema, tentativas com senha errada, pedidos de senha nova, pessoas cadastradas ou alteradas (papel, marcas, acesso), posts e stories apagados, quem abriu ou mudou as senhas das contas, mudanças de permissão e de integrações, pagamentos, propostas, links de cliente e exportações. Tem filtros por pessoa e ação, busca e download em CSV. Guardado por 1 ano.
- **Exportar dados** (Gestão → Minha empresa → Dados; administrador): baixa tudo da empresa em Excel (uma aba para cada coisa) ou um backup completo em JSON. As senhas de login e as senhas das contas dos clientes não saem na exportação.

## Minha empresa: perfil, cores e quem vê o quê

Em **Gestão → Minha empresa** (administrador da empresa; a dona da plataforma edita a empresa escolhida no topo):
- **Perfil:** logo, nome, desde quando está no mercado, Instagram, WhatsApp, e-mail, site, cidade e um texto sobre a empresa. A logo e o nome aparecem no topo do sistema para toda a empresa.
- **Cores:** paletas prontas, os códigos HEX da paleta da marca (destaque, topo e fundo do calendário) ou cada cor uma a uma (botões, topo e menu, calendário, reuniões, atividades e as fases dos posts). Valem para todo mundo da empresa; cada pessoa ainda pode ajustar as próprias em Minha conta.
- **Quem vê o quê:** uma tabela com cada tela, o que ela faz e uma coluna para cada papel (Administrador, Diretor, Gestor, Social media, Aprovador gestor, Aprovador cliente). Marque ou desmarque: o que estiver desmarcado some do menu daquela pessoa e a tela não abre. Os quadrados apagados são limites do sistema (ex.: cliente nunca vê o financeiro). "Voltar ao padrão" desfaz tudo.

## Menu

O menu do topo agora é agrupado (toque para abrir o submenu):
- **Planejamento**: Calendário, Stories, Banco de ideias, Postagens, Fluxo de produção, Grade do Insta
- **Aprovações**
- **Resultados**: Resumo do mês, Painel da agência (cliente: Resultados)
- **Marca**: todas as seções da marca
- **Equipe**: Agenda, Tarefas, Horas, Mural, Pessoas, Atividade
- **Gestão**: Financeiro e Empresas

Os números (aprovações, tarefas, pedidos de reunião, avisos) aparecem no grupo e dentro do submenu.

## Conferência, IA, Google Agenda, Canva, resultados, propostas e painel

- **Conferência antes de enviar:** ao clicar em "Enviar conteúdo para aprovação", o sistema confere a legenda (até 2.200 caracteres e 30 hashtags, menções, CTA, preço, palavras que a marca evita), as artes (quantidade, carrossel com 1 arte) e a data. Erros que o Instagram não aceita impedem o envio; avisos deixam "Enviar mesmo assim". Embaixo da legenda há um contador de caracteres e hashtags.
- **IA (Claude):** o administrador cola a chave da API da Anthropic em **Minha conta → Integrações** (crie em console.anthropic.com → API Keys; cada sugestão custa centavos). Aparecem botões ✨ para sugerir **legenda**, **hashtags** e **roteiro de Reels** no editor, **ideias** na aba Ideias (com "Guardar no banco") e uma **sequência de stories** na aba Stories (com "Criar estes stories"). Tudo usa o que está cadastrado na Marca (tom, público, pilares, palavras proibidas). Sempre revise antes de usar.
- **Google Agenda:** em Minha conta → Integrações, ligue o Google Agenda e rode **configurar** uma vez para autorizar. As reuniões confirmadas viram eventos na agenda da conta dona do sistema, com convite para os participantes e, se marcar na reunião, link do Google Meet (que entra no campo "Local").
- **Canva:** cada postagem tem o campo "Link do design no Canva" com o botão "Abrir no Canva". Para trazer a arte, salve do Canva no Google Drive (pasta da publicação) e use "Puxar da pasta". (A ligação direta com o Canva exige um app aprovado pela Canva.)
- **Resultados (cliente):** o aprovador do cliente ganha a aba Resultados: números do mês, resultados do Instagram, posts publicados, as notas que deu e a apresentação do mês.
- **Propostas** (Financeiro, embaixo): monte a proposta (pacote, valor, duração, início, vencimento, o que inclui) e envie por e-mail. O cliente vê numa página bonita, pode salvar em PDF e clica em **Aceitar**: a marca é criada sozinha com o pacote, o valor, o financeiro e o checklist, e o cliente já recebe o link do briefing.
- **Painel** (administrador, diretor e gestor): posts atrasados, aprovações paradas, satisfação, faturamento do mês, horas, carga da semana por pessoa, atrasados por pessoa e pacotes incompletos.

## Importar, copiar, buscar e recuperar

- **Importar documento** (Calendário): cole o link do documento do mês (Google Docs ou .docx no Drive) ou o texto. Cada post começa com "P1", "Post 1"…; o sistema pega o título, a data (05/11), o formato (carrossel, reels…), a legenda ("Legenda:") e o roteiro. Você confere numa lista e cria tudo de uma vez, como Ideia.
- **Copiar mês anterior** (Calendário): copia a estrutura (mesmo dia da semana, formatos, fases, produtos e redes) com os temas em branco.
- **Filtro de rede** (Calendário): mostra só os posts de uma rede (Feed, Reels, TikTok…).
- **Busca** 🔍 no topo (ou Ctrl+K): acha postagens, stories, tarefas, reuniões, arquivos e marcas.
- **Lixeira** (link embaixo do Calendário): postagens e stories apagados ficam 30 dias e dá para recuperar.
- **Trends** (aba Ideias): conecte a planilha de trends da semana; cada trend tem "Virar ideia".
- **Prévia de outras redes**: no modo Instagram da postagem, escolha TikTok, YouTube Shorts ou LinkedIn para ver como fica.

## Cliente novo, apresentação e avaliação

- **Checklist de cliente novo:** ao criar uma marca, as tarefas de entrada já aparecem em Tarefas (acessos, briefing, manual, reunião inicial, direcionamento, pacote, primeira grade).
- **Briefing** (Marca → Visão geral → "Gerar link do briefing"): um formulário sem senha que o cliente preenche (marca, público, produtos, tom, visual, acessos e arquivos). As respostas entram direto na marca; os acessos vão para o cofre. Quem gerou o link recebe um e-mail quando o cliente responde.
- **Apresentar** (Calendário): modo tela cheia para mostrar o mês ao cliente: capa, números, grade, datas, cada post como no Instagram e os stories. Use as setas do teclado; Esc sai.
- **Avaliação mensal:** no dia 1 o cliente recebe um e-mail para dar nota de 0 a 10 ao mês (também aparece nas Aprovações dele). Nota 6 ou menos avisa a direção por e-mail. A gestão vê as notas em Resumo → Satisfação do cliente.

## Financeiro e biblioteca

- **Financeiro** (aba só do administrador e do diretor): valor mensal, dia de vencimento, início e renovação de cada contrato; "Marcar pago" por mês; previsto, recebido e em aberto; aviso de contrato perto de renovar. Cobranças vencidas entram no e-mail das 8h.
- **Biblioteca** (Marca → Biblioteca): fotos e vídeos da marca com etiquetas (cole uma pasta do Drive para trazer tudo). No editor da postagem, "Pegar artes da biblioteca da marca" adiciona às artes.

## Ata, horários livres, horas, mural e aniversários

- **Ata da reunião:** abra a reunião na Agenda → "Escrever ata". Anote o que foi decidido e crie tarefas com responsável e prazo ali mesmo; a ata pode ir por e-mail para os participantes.
- **Reunião ligada à marca:** ao marcar, escolha a marca. Em Marca → Visão geral aparecem as reuniões daquela marca, com a ata.
- **Horários livres:** ao marcar uma reunião, "Ver horários livres de todos neste dia" mostra quando cada participante está ocupado (sem mostrar o que é) e sugere os horários em que todos estão livres.
- **Horas** (aba nova): cronômetro (Começar / Parar e salvar) ou lançamento manual, por marca. Cada pessoa vê as próprias horas; a gestão vê as horas por marca e por pessoa e o **valor por hora** (valor do contrato ÷ horas). O valor do contrato fica em Marca → Pacote e legendas.
- **Mural** (aba nova): a gestão publica recados para a equipe toda (pode fixar, marcar como importante para mandar e-mail e definir até quando aparece). Aviso importante não lido aparece numa faixa no topo; a gestão vê quantos já leram.
- **Aniversários:** cada pessoa coloca o seu em Minha conta (ou a gestão na Equipe); os do cliente e da marca ficam em Marca → Pacote e legendas. Aparecem com 🎂 no Calendário e na Agenda, no sino e no e-mail do dia.

## Modo claro ou escuro e cores

- O botão ☀️/🌙 no topo, ao lado da marca, troca entre modo claro e escuro (fica lembrado no aparelho).
- Em **Minha conta → Minhas cores**, cada pessoa escolhe as próprias cores: botões, faixa do topo, fundo do calendário, a cor de cada fase dos posts, das reuniões e das atividades. Tem paletas prontas e "Restaurar todas as cores". Vale só para você, em qualquer aparelho.
- No **Calendário**, a legenda em cima mostra a cor de cada fase e quantos posts estão nela; cada post tem uma bolinha no canto com a cor da fase. Clique numa fase da legenda para destacar só os posts dela.

## Fluxo de aprovação (2 etapas)

1. **Ideia** → a social media cria a postagem e clica em **Enviar ideia para validação**.
2. **Em validação** → o aprovador **valida** ou **reprova** (com o motivo). Reprovada, ela volta para a social media com o motivo à mostra.
3. **Em produção** → a social media monta o conteúdo (legenda, criativo) e clica em **Enviar conteúdo para aprovação**.
4. **Em aprovação** → o aprovador **aprova** ou clica em **Não aprovar** e escreve o que precisa mudar.
5. **Aprovado** → clique em **Agendar**: escolha Feed, Carrossel, Reels ou Story, a data e a hora; baixe o criativo, copie a legenda, agende no **Meta Business Suite** e confirme. A postagem vai para **Agendado** com a hora no calendário (dá para **Alterar agendamento**).
6. **Postado** → clique em **Marcar como postado** e, se quiser, cole o link do post publicado.

A aba **Aprovações** reúne o que está esperando cada pessoa (com um número vermelho de pendências). Cada postagem guarda o histórico de quem fez o quê e quando, com os motivos.

## Área da marca

Na aba **Marca** ficam:

- **Visão geral:** quanto de cada parte já foi preenchido e o que falta completar.
- **Sobre:** @, site, segmento, história, diferenciais, carro-chefe, contato do cliente.
- **Público-alvo:** perfil geral do público e personas detalhadas (rotina, dores, desejos, objeções, gatilhos de compra, conteúdo que consome…).
- **Arquivos e identidade:** direcionamento de Instagram, manual da marca, logotipos, vetores, fotos. Dá para enviar o arquivo do computador (até 25 MB) ou colar um link. Os arquivos enviados vão para a pasta **Planejamento de Conteúdo - Arquivos** no seu Google Drive, uma subpasta por marca, compartilhada com quem tiver o link. Também guarda cores (com amostras), fontes e estilo de foto.
- **Observações:** tom de voz, palavras proibidas, pilares, quadros fixos, concorrentes, datas, promoções, fluxo de aprovação, restrições legais, o que funcionou e metas.
- **Configurações:** nome, produtos, fases do mês.

Tudo fica na aba `MARCAS` da planilha (colunas Perfil e Arquivos).

**Importante:** o envio de arquivos usa o Google Drive. Se você já tinha implantado uma versão anterior do script, depois de colar o código novo rode **configurar** de novo para autorizar o acesso ao Drive, e depois faça **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**.

## Dicas

- **Imagens na grade:** cole no campo Criativo o link de um arquivo do Google Drive compartilhado como "Qualquer pessoa com o link". A prévia aparece na postagem e na grade.
- **Atualização:** o site busca novidades da planilha a cada 30 segundos. Se duas pessoas editarem a mesma postagem ao mesmo tempo, vale a última que salvou.
- **Editar direto na planilha:** pode, nas abas `MARCAS` e `POSTAGENS`. Não mude a coluna `ID` nem a ordem das colunas. A data fica no formato `dd/mm/aaaa`.
- **Segurança:** as permissões são conferidas no script da planilha, não só no site. As senhas ficam protegidas (embaralhadas) na aba oculta `USUARIOS`. Cada login vale por 30 dias.
- **Mudou o `Codigo.gs`?** Depois de colar a versão nova, vá em **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar**. O URL continua o mesmo.
