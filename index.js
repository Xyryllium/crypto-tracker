require("dotenv").config(); //initialize dotenv
const { Client, Intents, MessageEmbed } = require("discord.js"); //import discord.js
const axios = require("axios");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
    async function main() {
      let position = await getUserPosition();
      let info = await getUserInfo();
      if (position.data.otherPositionRetList.length == 0) {
        console.log("no position found");
        if (flag === 0) {
          message.channel.send("No Position Found!");
          flag = 1;
        }
        main();
      } else {
        flag = 0;
        let data = position.data.otherPositionRetList;
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

          const exampleEmbed = new MessageEmbed();
          if (data[index].amount < 0)
            exampleEmbed.setDescription("Open Short Position of " + nickName);
          else exampleEmbed.setDescription("Open Long Position of " + nickName);

          exampleEmbed
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

          message.channel.send({ embeds: [exampleEmbed] });
        });
        setTimeout(function () {
          main();
        }, 5000);
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

  if (messageArray[0] == "checkFloor") {
    var config = {
      method: "get",
      url:
        "https://api-mainnet.magiceden.dev/v2/collections/" + messageArray[1],
      headers: {},
    };

    axios(config)
      .then(function (response) {
        let floorPrice =
          (response.data.floorPrice / 1000000000).toString() + " SOL";
        let listedCount = response.data.listedCount.toString();
        let avgPrice24hr =
          (response.data.avgPrice24hr / 1000000000).toFixed(2).toString() +
          " SOL";
        let volumeAll =
          (response.data.volumeAll / 1000000000).toFixed(2).toString() + " SOL";

        const exampleEmbed = new MessageEmbed();

        exampleEmbed
          .setThumbnail(response.data.image)
          .setColor("#0099ff")
          .setTitle(response.data.name)
          .addFields(
            { name: "Floor Price", value: floorPrice },
            { name: "Listed Count", value: listedCount },
            { name: "Average Sale Price", value: avgPrice24hr },
            { name: "Volume", value: volumeAll }
          )
          .setTimestamp();

        message.channel.send({ embeds: [exampleEmbed] });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
});

client.login(process.env.CLIENT_TOKEN);
