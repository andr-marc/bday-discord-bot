const { Client, Intents } = require("discord.js");
const config = require("./config.json");
const schedule = require("node-schedule");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILDS,
  ],
});

var guild;

var channel;

const job = schedule.scheduleJob({ hour: 12, minute: 56 }, function () {
  // TODO: verificar se tem aniversariante

  var aniversariante_id = "00000000000000000";
  var guild_id = "000000000000000";

  let aniversariante = guild.members.fetch(aniversariante_id).then((a) => {
    console.log(a.user.username);
    try {
      channel.send(`<@${a.user.id}> está fazendo aniversario hoje`);
    } catch (error) {
      console.log(error);
    }
  });
});

// TODO: ao bot entrar no canal a primeira vez, mostrar mensagem de ajuda ou pedir para definir o canal

client.on("messageCreate", function (message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.PREFIX)) return;

  const commandBody = message.content
    .toLocaleLowerCase()
    .slice(config.PREFIX.length);
  const args = commandBody.split(" ");
  args.shift();
  const command = args.shift().toLowerCase();

  if (guild == null) {
    guild = client.guilds.cache.find((guild) => guild === message.guild);
    console.log(guild);
  }

  if (channel == null) {
    channel = client.channels.cache.find(
      (channel) => channel.name === message.channel.name
    );
  }

  // TODO: se for aniversario de uma pessoa banida NÃO notificar e APAGAR o registro

  if (command === "ping") {
    const timeTaken = message.createdTimestamp - Date.now();
    message.reply(`Pong! A latência foi ${timeTaken}ms.`);
    // message.channel.send(`Pong! A latência foi ${timeTaken}ms.`);
    message.channel.send(message.guild.id);
  } else if (command === "h" || command === "help") {
    message.reply(
      `Comandos:
    
        * add
        "!bd add {@user} {dd/mm}":  adicionar o aniversário de alguém;
        "!bd add {dd/mm}":  adicionar o seu próprio aniversário.
      
        * list | l
        "!bd list {@user}":  encontrar informação de um usuário;
        "!bd list":  listar todos os aniversários.
    
        * remove | rm
        "!bd remove {@user}":  apagar um registro.
        
        * set
        "!bd set": definir o canal onde o bot vai mandar os avisos de aniversário.`
    );
  } else if (command === "l" || command === "list") {
    if (args.length == 1) {
      var how = args.shift().replace(/[\\<>@#&!]/g, "");
      var user = message.guild.members.cache.get(how);

      // TODO: informar aniversario do user especifico
      message.reply(`${user} - 02/07`);
    } else if (args.length == 0) {
      // TODO: listar todos os aniversarios
    } else {
      message.reply(`"!bd list {@user}":  encontrar informação de um usuário;
        "!bd list":  listar todos os aniversários.`);
    }
  } else if (command === "add") {
    if (args.length == 2) {
      const id = args.shift().replace(/[\\<>@#&!]/g, "");
      const date = args.shift();

      message.reply(
        `O aniversario de ${id} é em ${date} id da guilda ${message.channelId}!`
      );
    } else if (args.length == 1) {
      const date = args.shift();
      message.reply(
        `O aniversario de ${message.member.id} é em ${date} id da guilda ${message.channelId}!`
      );
    } else {
      message.reply(
        `use o comando "!bd add {@user} {dd/mm}" para marcar o aniversariante ou "!bd add {dd/mm}" para adicionar o seu aniversário`
      );
    }
  } else if (command === "rm" || command === "remove") {
    if (args.length == 1) {
      const id = args.shift().replace(/[\\<>@#&!]/g, "");

      message.reply(`O aniversario de ${id} não está mais na lista!`);
    } else {
      message.reply(
        `use o comando "!bd remove {@user}" para apagar um registro`
      );
    }
  } else if (command == "set") {
    const channelName = args.shift();
    channel = client.channels.cache.find(
      (channel) => channel.name === channelName
    );
    message.reply(`Canal definido para ${channel}`);
  }
});

client.login(config.BOT_TOKEN);
