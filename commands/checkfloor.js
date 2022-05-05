const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checkfloor")
    .setDescription("Check NFT stats")
    .addStringOption((option) =>
      option
        .setName("blockchain")
        .setDescription("ETH or SOL")
        .setRequired(true)
        .addChoices(
          {
            name: "ETH",
            value: "eth",
          },
          {
            name: "SOL",
            value: "sol",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("collection")
        .setDescription("Collection Name from what you've seen on the URL")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.options.getString("blockchain") == "sol") {
      var config = {
        method: "get",
        url:
          "https://api-mainnet.magiceden.dev/v2/collections/" +
          interaction.options.getString("collection"),
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
            (response.data.volumeAll / 1000000000).toFixed(2).toString() +
            " SOL";

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

          interaction.reply({ embeds: [exampleEmbed] });
        })
        .catch(function (error) {
          interaction.reply({ content: "Collection Not Found / Slug Name is Wrong" });
        });
    } else if (interaction.options.getString("blockchain") == "eth") {
      var config = {
        method: "get",
        url:
          "https://api.opensea.io/api/v1/collection/" +
          interaction.options.getString("collection"),
        headers: {},
      };

      axios(config)
        .then(function (response) {
          let floorPrice =
            response.data.collection.stats.floor_price.toString() + " ETH";
          let numOwners =
            response.data.collection.stats.num_owners.toString();
          let totalSupply =
            response.data.collection.stats.total_supply.toString();
          let avgPrice24hr =
            response.data.collection.stats.one_day_average_price
              .toFixed(2)
              .toString() + " ETH";
          let volumeAll =
            response.data.collection.stats.total_volume.toFixed(2).toString() +
            " ETH";

          const exampleEmbed = new MessageEmbed();

          exampleEmbed
            .setThumbnail(response.data.collection.image_url)
            .setColor("#0099ff")
            .setTitle(response.data.collection.name)
            .addFields(
              { name: "Floor Price", value: floorPrice },
              { name: "Number of Owners", value: numOwners },
              { name: "Total Supply", value: totalSupply },
              { name: "Average Sale Price", value: avgPrice24hr },
              { name: "Volume", value: volumeAll }
            )
            .setTimestamp();

          interaction.reply({ embeds: [exampleEmbed] });
        })
        .catch(function (error) {
          interaction.reply({ content: "Collection Not Found / Slug Name is Wrong" });
        });
    }
  },
};