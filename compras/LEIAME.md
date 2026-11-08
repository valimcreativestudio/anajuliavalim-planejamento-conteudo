# Minhas Compras

App pessoal de compras, separado do Planeja Aê. Tem duas partes:

- **🛒 Mercado**: uma lista para cada casa (Inhumas e Goiânia).
- **✨ Desejos**: o que você quer comprar, com links, preços e categorias.

Funciona no celular (dá para instalar como aplicativo) e no computador. Funciona também sem internet.

---

## Como usar

### Mercado
- Escolha a casa no topo: **Inhumas** ou **Goiânia**. Cada uma tem a sua lista.
- **Na primeira vez:** toque em **Começar com itens básicos**. Aparecem arroz, feijão, café, detergente etc. Depois é só tirar o que você não usa.
- **Quando algo acabar:** escreva no campo de cima (por exemplo, “arroz”) ou toque no item em **Tudo de casa**. O app coloca o item sozinho no setor certo do mercado.
- **No mercado:** toque em **🛒 Estou no mercado**.
  - As letras ficam grandes e a tela não apaga.
  - Toque em cada item conforme for pondo no carrinho.
  - No fim, toque em **Terminei a compra**. Errou? Toque em **Desfazer**.
- **Para editar um item (✎):** dá para mudar a quantidade, o setor e a casa, ou copiar o item para a outra casa.

### Desejos
- **Para guardar algo:** cole o link do produto no campo de cima e toque em **Guardar**. Com a planilha conectada, o app busca sozinho o nome, a foto e o preço.
  - Pode colar o texto inteiro que a loja manda ao compartilhar. O app separa o link do resto.
  - Também dá para escrever só o nome, sem link.
- O que você ainda não organizou fica em **📥 Não organizados**. Organize quando quiser.
- **Ao tocar no desejo, você pode:**
  - escolher a categoria (até 3 níveis, por exemplo Casa › Decoração › Quarto);
  - marcar a prioridade (**Preciso**, **Quero muito** ou **Seria legal**);
  - mudar a situação (**Quero**, **Comprei** ou **Chegou**);
  - colocar **mais de um link**. O app mostra qual é o **mais barato**.
- **Se uma loja não deixar ler o preço:** isso acontece às vezes com Amazon, Shopee e Mercado Livre. Digite o preço no campo do link. Preço digitado por você não é trocado automaticamente.
- **Atualização dos preços:** o app confere os preços **todo dia de manhã**.
  - Quando um preço baixa, aparece **↓ baixou R$ X** no cartão.
  - O botão **↻ Preços** confere na hora.
- **⏳ Esfriando:** desejos novos esperam alguns dias (7, se você não mudar) antes de serem “liberados”. É só um lembrete gentil contra compra por impulso; nada é bloqueado. Liga, desliga e escolhe o número de dias em **Ajustes**.

### Ajustes
- Tema claro ou escuro, **letra grande** e **sem animações**.
- Casas: renomear, mudar a cor ou criar outra casa.
- Organizar as categorias dos desejos.
- Baixar uma **cópia de segurança** (e trazer de volta).

---

## Colocar no ar

### 1. Planilha (para usar no celular e no computador e buscar os preços)

1. Crie uma **planilha nova** no Google Sheets (por exemplo, “Minhas Compras”). Use uma planilha só para este app, não a do Planeja Aê.
2. Clique em **Extensões → Apps Script**.
3. Apague o que estiver no editor e cole todo o conteúdo de `compras/apps-script/Compras.gs`. Clique em **Salvar**.
4. No topo do editor, escolha a função **configurar** e clique em **Executar**.
   - O Google vai pedir autorização: **Revisar permissões → sua conta → Avançado → Acessar (não seguro) → Permitir**. Esse aviso aparece porque o script é seu e não passou pela verificação do Google.
   - A função cria a aba `DADOS` e liga a atualização diária dos preços.
   - Ela também manda para o seu e-mail a **chave de acesso** (algo como `ABCD-EFGH-JKLM`).
5. Clique em **Implantar → Nova implantação**.
   - Engrenagem → **App da Web**.
   - **Executar como:** Eu.
   - **Quem pode acessar:** Qualquer pessoa. Só quem tiver a chave consegue ver ou mudar os dados.
   - Clique em **Implantar** e copie o **URL do app da Web** (termina em `/exec`).

### 2. Site

O app fica na pasta `compras/` deste repositório. Com o GitHub Pages ligado na branch `main`, o endereço é:

`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/compras/`

### 3. Conectar cada aparelho

1. Abra o endereço do app.
2. Vá em **Ajustes → Planilha e celular**.
3. Cole o **URL /exec** e a **chave de acesso** e toque em **Conectar**.

Se já tinha coisas guardadas no aparelho, elas vão para a planilha. Faça isso uma vez em cada aparelho.

> Para não precisar colar o URL em cada aparelho, coloque-o em `compras/config.js`. Aí cada aparelho só pede a chave.

**Instalar no celular:**
- **iPhone (Safari):** Compartilhar → **Adicionar à Tela de Início**.
- **Android (Chrome):** menu ⋮ → **Instalar app**.

### Trocar a chave

No editor do Apps Script, rode a função **trocarChave**. A chave nova chega por e-mail. Depois, conecte de novo cada aparelho.

---

## Para quem mexe no código

- `index.html`: o app inteiro (telas, regras e sincronização). Guarda os dados no aparelho (`localStorage`) e manda as mudanças para a planilha. Quando o mesmo item é mudado em dois aparelhos, fica a mudança mais recente.
- `apps-script/Compras.gs`: o servidor. Cuida da chave, da sincronização (aba `DADOS`), da leitura de nome, foto e preço dos links e do gatilho diário `atualizarPrecosDiario`.
- Testes: `node tests/compras-servidor.test.js` e `node tests/compras-site.test.js`. Eles também rodam com `node tests/rodar.js`.
