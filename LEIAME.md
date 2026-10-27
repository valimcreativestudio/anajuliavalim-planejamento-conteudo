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
| **Gestor** | Todas as marcas | Gerente da equipe: acompanha a **Atividade da equipe**, cria e edita postagens, preenche as marcas, valida e aprova. Não cadastra pessoas, não cria/exclui marcas e não muda configurações |
| **Social media** | Só as marcas marcadas para ele | Cria e edita postagens, preenche a marca, envia para validação e aprovação, marca como agendado/postado |
| **Aprovador** | As marcas marcadas para ele (ou "Todas") | Valida ideias e aprova conteúdos, sempre escrevendo o motivo quando não aprova |

Não há limite de pessoas nem de marcas por pessoa. Para tirar o acesso de alguém, desmarque **Acesso ativo**.
Ao salvar uma pessoa com senha (use **Gerar senha**), aparece a mensagem de boas-vindas pronta, adaptada ao papel dela, com as marcas, o login, a senha provisória e o link do site, e o botão **Enviar pelo WhatsApp** (preencha o WhatsApp da pessoa com DDD). Ela troca a senha e o nome em **Minha conta**.

## Atividade da equipe

Em **Equipe → Atividade** (o administrador, o diretor e o gestor veem): último acesso de cada pessoa, quantas postagens criou, editou e enviou, quantas validou/aprovou ou devolveu, pendências e a lista das últimas ações. Quem fica 3 dias sem sinal aparece em vermelho.

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
