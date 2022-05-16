const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkposition")
    .setDescription("Check Position of a User from Binance Leaderboard")
    .addStringOption((option) =>
      option
        .setName("encrypteduid")
        .setDescription("Can be seen at the URL of Binance Leaderboard")
        .setRequired(true)
    ),

  async execute(interaction) {
    const getUserPosition = async () => {
      try {
        const BASE_API = "https://www.binance.com/bapi/futures/v1/";
        const { data } = await axios.post(
          BASE_API + "public/future/leaderboard/getOtherPosition",
          {
            encryptedUid: interaction.options.getString("encrypteduid"),
            delay: "5000",
            tradeType: "PERPETUAL",
          }
        );
        return data;
      } catch (error) {
        console.log(`error: `, error);
      }
    };

    async function main() {
      let position = await getUserPosition();
      let info = await getUserInfo();
      if (position.data.otherPositionRetList == null || position.data.otherPositionRetList.length == 0) { 
        interaction.reply({
          content: `No Position Found For ${info.data.nickName}!`,
        });
      } else {
        let data = position.data.otherPositionRetList;

        const leaderboardEmbed = new MessageEmbed();
        nickName = info.data.nickName;
        data.forEach((element, index, array) => {
          let symbol = data[index].symbol;
          let entryPrice = data[index].entryPrice.toString();
          let markPrice = data[index].markPrice.toString();
          let pnl = data[index].pnl.toString();
          let roe = data[index].roe.toString();
          let amount = data[index].amount.toString();
          let unixTimestamp = data[index].updateTimeStamp;
          let date = new Date(unixTimestamp).toString();
          if (data[index].amount < 0)
            leaderboardEmbed.addFields(
              { name: `Position`, value: `Short by ${nickName}` }
            );
          else
            leaderboardEmbed.addFields(
              { name: `Position`, value: `Long by ${nickName}` }
            );
          leaderboardEmbed.addFields(
            { name: "Symbol", value: symbol },
            { name: "Entry Price", value: entryPrice },
            { name: "Mark Price", value: markPrice },
            { name: "PNL", value: pnl },
            { name: "ROE", value: roe },
            { name: "Amount", value: amount },
            { name: "Date Opened:", value: date }
          );
        });

        leaderboardEmbed
          .setColor("#0099ff")
          .setTitle("Binance Leaderboard")
          .setTimestamp();

        interaction.reply({ embeds: [leaderboardEmbed] });
      }
    }

    const getUserInfo = async () => {
      try {
        const BASE_API = "https://www.binance.com/bapi/futures/v2/";
        const { data } = await axios.post(
          BASE_API + "public/future/leaderboard/getOtherLeaderboardBaseInfo",
          {
            encryptedUid: interaction.options.getString("encrypteduid"),
          }
        );
        return data;
      } catch (error) {
        console.log(`error: `, error);
      }
    };

    main();
  },
};
