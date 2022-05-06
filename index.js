require("dotenv").config(); //initialize dotenv
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents, MessageEmbed, Collection } = require("discord.js"); //import discord.js
const axios = require("axios");
const keepAlive = require('./server');
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const CLIENT_ID = client.user.id;

  const rest = new REST({
    version: "9",
  }).setToken(process.env.CLIENT_TOKEN);

  (async () => {
    try {
      if (process.env.ENV === "production") {
        await rest.put(Routes.applicationCommands(CLIENT_ID), {
          body: commands,
        });
        console.log("Successfully registered commands globally.");
      } else {
        await rest.put(
          Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID),
          {
            body: commands,
          }
        );
        console.log("Successfully registered commands locally.");
      }
    } catch (err) {
      if (err) console.error(err);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    if (err) console.error(err);
    await interaction.reply({
      content: "An error occured while executing that command.",
      ephemeral: trye,
    });
  }
});

client.on("messageCreate", (message) => {
  const messageArray = message.content.split(" ");
  if (messageArray[0] == "checkPos") {
    const getUserPosition = async () => {
      try {
        const BASE_API = "https://www.binance.com/bapi/futures/v1/";
        const { data } = await axios.post(
          BASE_API + "public/future/leaderboard/getOtherPosition",
          {
            encryptedUid: messageArray[1],
            delay: "5000",
            tradeType: "PERPETUAL",
          }
        );
        return data;
      } catch (error) {
        console.log(`error: `, error);
      }
    };

    let flag = 0;
    let pastDataLength = 0;
    let pastData = [];
    async function main() {
      let position = await getUserPosition();
      let info = await getUserInfo();
      if (position.data.otherPositionRetList.length == 0) {
        pastDataLength = position.data.otherPositionRetList.length; 
        
        if (pastData.length != 0) {
          let closePos = pastData.filter(
            (oldData) => !position.data.otherPositionRetList.find((a) => oldData.symbol === a.symbol)
          );

          closePos.forEach((element, index, array) => {
            let symbol = closePos[index].symbol;
            let entryPrice = closePos[index].entryPrice.toString();
            let markPrice = closePos[index].markPrice.toString();
            let pnl = closePos[index].pnl.toString();
            let roe = closePos[index].roe.toString();
            let amount = closePos[index].amount.toString();
            let unixTimestamp = Date.now();
            let date =  new Date(unixTimestamp).toString();

            const leaderboardEmbed = new MessageEmbed();
            leaderboardEmbed.setDescription(`Closed Position of ${symbol} of ${nickName}`);

            leaderboardEmbed
              .setColor("#0099ff")
              .setTitle("Binance Leaderboard")
              .addFields(
                { name: "Symbol", value: symbol },
                { name: "Entry Price", value: entryPrice },
                { name: "Mark Price", value: markPrice },
                { name: "PNL", value: pnl },
                { name: "ROE", value: roe },
                { name: "Amount", value: amount },
                { name: "Date Closed:", value: date }
              )
              .setTimestamp();
            message.channel.send({ embeds: [leaderboardEmbed] });
          });
        }

        if (flag === 0) {
          pastData = [];
          message.channel.send(`No Position Found For ${info.data.nickName}`);
          flag = 1;
        }
        main();
      } else {
        flag = 0;
        let data = position.data.otherPositionRetList;
        if (pastData.length != 0) {
          let closePos = pastData.filter(
            (oldData) => !data.find((a) => oldData.symbol === a.symbol)
          );

          closePos.forEach((element, index, array) => {
            let symbol = closePos[index].symbol;
            let entryPrice = closePos[index].entryPrice.toString();
            let markPrice = closePos[index].markPrice.toString();
            let pnl = closePos[index].pnl.toString();
            let roe = closePos[index].roe.toString();
            let amount = closePos[index].amount.toString();
            let unixTimestamp = Date.now();
            let date =  new Date(unixTimestamp).toString();

            const leaderboardEmbed = new MessageEmbed();
            leaderboardEmbed.setDescription(`Closed Position of ${symbol} of ${nickName}`);

            leaderboardEmbed
              .setColor("#0099ff")
              .setTitle("Binance Leaderboard")
              .addFields(
                { name: "Symbol", value: symbol },
                { name: "Entry Price", value: entryPrice },
                { name: "Mark Price", value: markPrice },
                { name: "PNL", value: pnl },
                { name: "ROE", value: roe },
                { name: "Amount", value: amount },
                { name: "Date Closed:", value: date }
              )
              .setTimestamp();
            message.channel.send({ embeds: [leaderboardEmbed] });
          });
        }
        pastData = data;
        let newDataLength = data.length;
        data.forEach((element, index, array) => {
          nickName = info.data.nickName;
          console.log("[ OK ] Got update [" + new Date().toGMTString() + "]");
          let symbol = data[index].symbol;
          let entryPrice = data[index].entryPrice.toString();
          let markPrice = data[index].markPrice.toString();
          let pnl = data[index].pnl.toString();
          let roe = data[index].roe.toString();
          let amount = data[index].amount.toString();
          let unixTimestamp = data[index].updateTimeStamp;
          let date = new Date(unixTimestamp).toString();

          const leaderboardEmbed = new MessageEmbed();
          if (data[index].amount < 0)
          leaderboardEmbed.setDescription("Open Short Position of " + nickName);
          else leaderboardEmbed.setDescription("Open Long Position of " + nickName);

          leaderboardEmbed
            .setColor("#0099ff")
            .setTitle("Binance Leaderboard")
            .addFields(
              { name: "Symbol", value: symbol },
              { name: "Entry Price", value: entryPrice },
              { name: "Mark Price", value: markPrice },
              { name: "PNL", value: pnl },
              { name: "ROE", value: roe },
              { name: "Amount", value: amount },
              { name: "Date Opened:", value: date }
            )
            .setTimestamp();
          if (pastDataLength != newDataLength)
            message.channel.send({ embeds: [leaderboardEmbed] });
        });

        pastDataLength = newDataLength;
        main();
      }
    }

    const getUserInfo = async () => {
      try {
        const BASE_API = "https://www.binance.com/bapi/futures/v2/";
        const { data } = await axios.post(
          BASE_API + "public/future/leaderboard/getOtherLeaderboardBaseInfo",
          {
            encryptedUid: messageArray[1],
          }
        );
        return data;
      } catch (error) {
        console.log(`error: `, error);
      }
    };

    main();
  }
});

client.login(process.env.CLIENT_TOKEN);
