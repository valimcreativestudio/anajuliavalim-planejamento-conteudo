# Planejamento de Conteúdo

Sistema de planejamento de Instagram por marca: calendário, pautas, fluxo de produção, grade do feed e resumo do mês.

- O **site** fica no GitHub Pages (arquivos `index.html` e `config.js`).
- Os **dados** ficam na sua planilha do Google, nas abas `MARCAS` e `PAUTAS`.
- Quem tiver o link do site vê e edita, sem precisar de conta. Se quiser, dá para pedir uma senha da equipe para editar (passo 3).

---

## 1. Ligar a planilha (Google Apps Script)

1. Abra a planilha no Google Sheets.
2. Clique em **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo do arquivo `apps-script/Codigo.gs`. Clique em **Salvar** (ícone de disquete).
4. No topo do editor, escolha a função **configurar** e clique em **Executar**. (As abas `MARCAS` e `PAUTAS` já foram criadas e preenchidas; rodar isso agora serve só para autorizar o script, e nada é importado de novo.)
   - Na primeira vez, o Google pede autorização: **Revisar permissões → escolha sua conta → Avançado → Acessar (não seguro) → Permitir**. Isso aparece porque o script é seu e não passou por verificação do Google.
   - A função cria as abas `MARCAS` e `PAUTAS` e importa tudo o que estiver nas abas que começam com `DETALHAMENTO`.
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

## 3. (Opcional) Senha da equipe para editar

Sem senha, qualquer pessoa com o link pode editar e apagar pautas. Para exigir uma senha:

1. No Apps Script, clique em **Configurações do projeto** (engrenagem na lateral).
2. Em **Propriedades do script**, clique em **Adicionar propriedade**: nome `SENHA`, valor a senha que você quiser. Salve.

Quem só olha continua vendo tudo. Na primeira vez que alguém tentar salvar, o site pede a senha e guarda nesse navegador.

## Dicas

- **Imagens na grade:** cole no campo Criativo o link de um arquivo do Google Drive compartilhado como "Qualquer pessoa com o link". A prévia aparece na pauta e na grade.
- **Atualização:** o site busca novidades da planilha a cada 30 segundos. Se duas pessoas editarem a mesma pauta ao mesmo tempo, vale a última que salvou.
- **Editar direto na planilha:** pode, nas abas `MARCAS` e `PAUTAS`. Não mude a coluna `ID` nem a ordem das colunas. A data fica no formato `dd/mm/aaaa`.
- **Mudou o `Codigo.gs`?** Depois de colar a versão nova, vá em **Implantar → Gerenciar implantações → editar (lápis) → Versão: Nova versão → Implantar**. O URL continua o mesmo.
