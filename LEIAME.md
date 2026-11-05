# Planejamento de Conteúdo

Sistema de planejamento de Instagram por marca: calendário, postagens, fluxo de produção, grade do feed e resumo do mês.

- O **site** fica no GitHub Pages (arquivos `index.html` e `config.js`).
- Os **dados** ficam na sua planilha do Google, nas abas `MARCAS` e `POSTAGENS`.
- Cada pessoa entra com o próprio login e senha. O administrador cadastra a equipe e escolhe as marcas de cada um.

---

## 1. Ligar a planilha (Google Apps Script)

1. Abra a planilha no Google Sheets.
2. Clique em **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo do arquivo `apps-script/Codigo.gs`. Clique em **Salvar** (ícone de disquete).
4. No topo do editor, escolha a função **configurar** e clique em **Executar**.
   - Na primeira vez, o Google pede autorização: **Revisar permissões → escolha sua conta → Avançado → Acessar (não seguro) → Permitir**. Isso aparece porque o script é seu e não passou por verificação do Google.
   - A função cria as abas que faltarem (`MARCAS`, `POSTAGENS` e `USUARIOS`, que fica oculta), importa o que estiver nas abas `DETALHAMENTO` se `POSTAGENS` estiver vazia e atualiza os status antigos.
   - Ela também cria **você como administrador**. Abra o **Registro de execução** (aparece embaixo do editor) e anote o login e a **senha provisória**. Depois de entrar no site, troque a senha em **Minha conta**.
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

- Em **Equipe**, ao lado do aprovador do cliente, **🔗 Link sem senha** gera um link que entra direto na conta dele (vale 14 dias). Dá para copiar, mandar no WhatsApp ou enviar por e-mail.
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
