const { Client, Intents, TextChannel } = require("discord.js");
const config = require("./config.json");
const schedule = require("node-schedule");

const mongoose = require("mongoose");
const BDay = require("./src/bday");
const Channel = require("./src/channel");

var guilds;

async function main() {
  mongoose.connect(
    `mongodb+srv://${config.username}:${config.password}@${config.cluster}.cz4mj.mongodb.net/${config.dbname}?retryWrites=true&w=majority`
  );

  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILDS,
    ],
  });

  const job = schedule.scheduleJob({ hour: 0, minute: 0 }, async function () {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    today = `${dd}/${mm}`;

    console.log(guild);

    var bdays = await BDay.find({ date: today });

    bdays.forEach(async (bd) => {
      const guildIds = client.guilds.cache;
      var channel;

      guildIds.forEach(async (guild) => {
        console.log(bd.guild_id == guild.id);
        console.log(bd.guild_id);
        console.log(guild.id);
        if (bd.guild_id == guild.id) {
          var e = await Channel.findOne({ guild_id: guild.id });
          console.log(e);
          channel = await guild.channels.fetch(e.channel);
          channel.send(`<@${bd.user_id}> está fazendo aniversario hoje`);
        }
      });
    });
  });

  // TODO: ao bot entrar no canal a primeira vez, mostrar mensagem de ajuda ou pedir para definir o canal

  // TODO: testar ban
  client.on("guildBanAdd", function (guild, user) {
    BDay.findOneAndRemove({ user_id: user.id });
  });

  client.on("messageCreate", async function (message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.PREFIX)) return;

    const commandBody = message.content
      .toLocaleLowerCase()
      .slice(config.PREFIX.length);
    const args = commandBody.split(" ");
    args.shift();
    const command = args.shift().toLowerCase();

    if ((await Channel.count({ guild_id: message.guildId })) == 0) {
      Channel({ guild_id: message.guildId, channel: message.channelId }).save();
    }

    if (command === "ping") {
      const timeTaken = message.createdTimestamp - Date.now();
      message.reply(`Pong! A latência foi ${timeTaken}ms.`);
      // message.channel.send(`Pong! A latência foi ${timeTaken}ms.`);
      message.channel.send(message.guild.id);
    } else if (command === "h" || command === "help") {
      message.reply(
        `Comandos:
    
**add**
    "*!bd add {@user} {dd/mm}*":  adicionar o aniversário de alguém;
    "*!bd add {dd/mm}*":  adicionar o seu próprio aniversário.
  
**list | l**
    "*!bd list {@user}*":  encontrar informação de um usuário;
    "*!bd list*":  listar todos os aniversários.

**remove | rm**
    "*!bd remove {@user}*":  apagar um registro.
    
**set**
    "*!bd set*": definir o canal onde o bot vai mandar os avisos de aniversário.`
      );
    } else if (command === "l" || command === "list") {
      if (args.length == 1) {
        var how = args.shift().replace(/[\\<>@#&!]/g, "");

        var users = await BDay.find({ user_id: how });

        if (users == 0) {
          message.reply(`Usuário não encontrado`);
        } else {
          users.forEach((element) => {
            message.reply(
              `<@${element.user_id}> faz aniversário dia ${element.date}`
            );
          });
        }
      } else if (args.length == 0) {
        // TODO: testar listagem de todos os aniversarios
        var users = await BDay.find({});

        if (users == 0) {
          message.reply(`Nenhum usuário encontrado`);
        } else {
          users.forEach((element) => {
            message.reply(
              `<@${element.user_id}> faz aniversário dia ${element.date}`
            );
          });
        }
      } else {
        message.reply(`"Algo deu errado, tente:
*!bd list {@user}*":  encontrar informação de um usuário;
"*!bd list*":  listar todos os aniversários.`);
      }
    } else if (command === "add") {
      if (args.length == 2) {
        const id = args.shift().replace(/[\\<>@#&!]/g, "");
        const date = args.shift();

        BDay.findOneAndUpdate(
          { user_id: id },
          {
            date: date,
            user_id: id,
            guild_id: message.guildId,
          },
          { upsert: true },
          function (err, doc) {
            if (err) return console.log(err);
            message.reply(`O aniversario de <@${id}> é em ${date}!`);
          }
        );
      } else if (args.length == 1) {
        const date = args.shift();

        BDay.findOneAndUpdate(
          { user_id: message.member.id },
          {
            date: date,
            user_id: message.member.id,
            guild_id: message.guildId,
          },
          { upsert: true },
          function (err, doc) {
            if (err) return console.log(err);
            message.reply(
              `O aniversario de <@${message.member.id}> é em ${date}!`
            );
          }
        );
      } else {
        message.reply(
          `Algo deu errado, tente:
"*!bd add {@user} {dd/mm}*":  adicionar o aniversário de alguém;
"*!bd add {dd/mm}*":  adicionar o seu próprio aniversário.`
        );
      }
    } else if (command === "rm" || command === "remove") {
      if (args.length == 1) {
        const id = args.shift().replace(/[\\<>@#&!]/g, "");

        BDay.findOneAndRemove({ user_id: id }, {}, function (err, doc) {
          if (err) return console.log(err); // criar msg de erro?
          message.reply(`O aniversario de <@${id}> não está mais na lista!`);
        });
      } else {
        message.reply(
          `"Algo deu errado, tente:
*!bd remove {@user}*":  apagar um registro.`
        );
      }
    } else if (command == "set") {
      const channelName = args.shift();
      var channel = client.channels.cache.find(
        (channel) => channel.name === channelName
      );

      Channel.findOneAndUpdate(
        { guild_id: message.guildId },
        { guild_id: message.guildId, channel: channel.id },
        { upsert: true },
        function (err, doc) {
          if (err) return res.send(500, { error: err });
        }
      );

      message.reply(`Canal definido para ${channel} id ${channel.id}`);
    }
  });

  client.login(config.BOT_TOKEN);
}

main().catch((err) => console.log(err));
