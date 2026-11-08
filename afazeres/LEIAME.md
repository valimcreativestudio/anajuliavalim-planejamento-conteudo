# Feito! — um passo de cada vez

Aplicativo de afazeres pensado para cérebros neurodivergentes (TDAH, autismo, dislexia, disfunção executiva).
Funciona no navegador e pode ser **instalado no celular e no computador** como um app.

## O que tem

| Tela | Para quê |
|---|---|
| ☀️ **Hoje** | Só o que é de hoje: rotina (manhã, tarde, noite) e tarefas, com barra de progresso. O que ficou para trás aparece num cantinho gentil, com “Trazer pra hoje” ou “Tirar a data” — sem vermelho, sem bronca. |
| ▶ **Uma coisa de cada vez** | Modo foco: mostra **uma tarefa só**, o porquê dela, os passinhos (“comece aqui”) e um cronômetro visual. Botões “Fiz!”, “Pular por agora” e “Deixar pra amanhã”. |
| 📅 **Próximos** | A semana em bolinhas e as tarefas com data, dia por dia. |
| 🔁 **Rotinas** | Checklist **diário** (volta a ficar desmarcado todo dia) e **semanal** (volta toda segunda), com dia da semana ou parte do dia. |
| 📥 **Sem data** | Coisas para fazer “quando der”, separadas por tipo. |
| 📝 **Notas** | Anotações coloridas para tirar as coisas da cabeça. Uma nota pode virar tarefa. |

Cada tarefa tem: **o quê**, **quando** (dia e hora), **onde**, **por quê**, **tipo de coisa** (com cor), **energia** que pede,
**tempo** aproximado, **passinhos** (subtarefas) e ⭐ importante. Quando você marca, ela **fica verdinha** 💚, com confete e uma frase de incentivo.

Pensado para neurodivergência:
- **Anotar rápido**: escreva e aperte Enter; detalhes depois. Dá para escrever “amanhã”, “depois de amanhã” ou o dia da semana (“sexta”) no fim.
- **Filtro de energia** (“Como está sua energia agora?”): com pouca energia, as tarefas pesadas se escondem.
- **Nada se perde**: fechar a janela salva; apagar tem **Desfazer**.
- **Conforto visual** em Ajustes: tema claro/escuro, letra maior, fontes de leitura fácil (Atkinson Hyperlegible e Lexend), mais espaço entre letras, desligar animações, confete e som opcionais.
- Funciona **sem internet** depois da primeira vez.

## Google Agenda

- Em cada tarefa com data: botão **📅 Pôr no Google Agenda** — abre o evento já preenchido (título, hora, onde, por quê e passinhos). É o jeito mais garantido de receber **lembrete no celular**.
- Em **Ajustes → Baixar tarefas para o Google Agenda (.ics)**: leva todas de uma vez (Google Agenda no computador → ⚙️ Configurações → Importar e exportar → Importar).

## Instalar

O app fica em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/afazeres/` (mesmo GitHub Pages do Planeja Aê).

- **Android (Chrome):** abra o link → menu ⋮ → **Instalar app** / **Adicionar à tela inicial**.
- **iPhone (Safari):** abra o link → botão Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome ou Edge):** abra o link → ícone de instalar na barra de endereço (ou menu → **Instalar Feito!**).

## Mesmas tarefas no celular e no computador (opcional)

Sem isso, cada aparelho guarda as próprias tarefas. Para sincronizar pelo **seu Google Drive**:

1. Entre em [script.google.com](https://script.google.com) → **Novo projeto**.
2. Apague o que estiver no editor, cole todo o arquivo `apps-script/Afazeres.gs` e clique em **Salvar**.
3. No topo, escolha a função **configurar** e clique em **Executar**. Autorize (Revisar permissões → sua conta → Avançado → Acessar → Permitir).
   O **Registro de execução** mostra o seu **código secreto**. Copie.
4. **Implantar → Nova implantação** → engrenagem → **App da Web**. *Executar como:* **Eu**. *Quem pode acessar:* **Qualquer pessoa**. **Implantar** e copie o URL (termina em `/exec`).
5. No app, em **Ajustes → Usar no celular e no computador**, cole o endereço e o código e toque em **Ligar e sincronizar**. Faça isso **nos dois aparelhos**.

As tarefas ficam num arquivo `feito-afazeres.json` no seu Drive. Só quem tem o código consegue ler ou mudar.
Se alguém vir o código, rode a função **trocarCodigo** no script e cole o novo nos aparelhos.
