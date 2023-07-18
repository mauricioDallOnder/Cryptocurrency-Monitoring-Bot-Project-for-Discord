const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

async function PriceInformation() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/apecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );
    const data = response.data.market_data;

    return {
      price: data.current_price.usd,
      change24h: data.price_change_percentage_24h,
      change30d: data.price_change_percentage_30d,
      change1y: data.price_change_percentage_1y,
      high24h: data.high_24h.usd,
      low24h: data.low_24h.usd,
      volume: data.total_volume.usd,
      marketCap: data.market_cap.usd,
      allTimeHigh: data.ath.usd,
      allTimeHighChange: data.ath_change_percentage.usd,
      allTimeHighDate: data.ath_date.usd,
    };
  } catch (error) {
    console.error("Error updating ApeCoin price:", error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apepriceinfo")
    .setDescription("Provides information about the price of apecoin."),
  async execute(interaction) {
    const info = await PriceInformation();

    if (!info) {
      await interaction.reply(
        "There was an error getting the ApeCoin information."
      );
      return;
    }

    const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(`ApeCoin price $${info.price} USD`)
    .addFields(
      { name: "24h Change", value: `${info.change24h}%`,inline: true },
      { name: "30d Change", value: `${info.change30d}%`,inline: true },
      { name: "1y Change", value: `${info.change1y}%`,inline: true },
      { name: "24h High / Low", value: `$${info.high24h} / $${info.low24h}` },
      { name: "Volume", value: `$${info.volume}` },
      { name: "Market Cap", value: `$${info.marketCap}` },
      {
        name: "All Time High",
        value: `$${info.allTimeHigh} (${info.allTimeHighChange}%)`,
        inline: true
      },
      {
        name: "All Time High Date",
        value: new Date(info.allTimeHighDate).toDateString(),
        inline: true
      }
    )
    .setTimestamp()
    
    await interaction.reply({ embeds: [embed] });
  },
};
