# Ticket & Announce Bot

**Full programmed by Mr H for Holmes Codelab** — [eagle-holmes.netlify.app](https://eagle-holmes.netlify.app/)

Bot Discord dyal ticket system b discord.js v14.

## 1. Prépare l'application Discord

1. Sir l [Discord Developer Portal](https://discord.com/developers/applications).
2. Créer une "New Application" → Bot → copier le **Token**.
3. F "OAuth2 > URL Generator" khtar scopes: `bot`, `applications.commands`.
   Permissions: `Manage Channels`, `Manage Roles`, `Send Messages`, `Embed Links`,
   `Read Message History`, `View Channels`, `Attach Files`.
4. Invite le bot f server dyalek b had URL.

## 2. Installation (local ou VPS)

```bash
npm install
cp .env.example .env
```

F `.env`, dir:

```
DISCORD_TOKEN=le_token_de_ton_bot
CLIENT_ID=id_de_ton_application
```

(Client ID: f "General Information" dyal l'application f Developer Portal.)

## 3. Déployer les commandes slash

```bash
npm run deploy
```

## 4. Lancer le bot

```bash
npm start
```

## 5. Configuration f Discord

1. `/setup` → khtar:
   - **role_admin**: le rôle staff dyal team
   - **categorie_open**: catégorie fin ghaykhlqo tickets
   - **categorie_closed**: catégorie fin ghaytmarkiw tickets mغلقين
   - **logs**: salon dyal les logs

2. `/panel` f n'importe quel salon → kaybعث l'embed dyal "Ticket Panel"
   b button "Créer un nouveau ticket".

## Fonctionnement

- Membre kayضغط "Créer un nouveau ticket" → kaykhlq channel privé (`ticket-0001`, ...)
  taht catégorie open, fih غير هو + staff role.
- F ticket, kayn button "Fermer le ticket" → kaysakr, kaynقل l catégorie closed,
  kayحيد accès dyal membre, و كايبعث transcript (.txt) f logs channel.
- Kol membre ma ymkench ydir ktr men ticket wahed f nفس lwaqt.

## Struture

```
index.js              → entry point + interaction router
deploy-commands.js     → register slash commands
config.js              → stockage JSON (data/guilds.json)
ticketHandler.js        → logic dyal create/close ticket
commands/setup.js       → /setup
commands/panel.js       → /panel
```

## Personnalisation

- Bdل couleurs/texte f `commands/panel.js` (embed).
- Bdل limite dyal messages fetch fل transcript (`ticketHandler.js`, `limit: 100`).
- Ymkn tzid modal (formulaire) qbل création dyal ticket ila bghiti (raison, catégorie support...).
