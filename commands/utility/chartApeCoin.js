const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { AttachmentBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pricechart')
		.setDescription('Generates a Apecoin price chart.'),
		async execute(interaction) {
			try {
				const response = await axios.get('https://api.coingecko.com/api/v3/coins/apecoin/market_chart?vs_currency=usd&days=7&interval=daily');
				const priceData = response.data.prices;
				const labels = priceData.map((_, i) => i + 1);
				const data = priceData.map(price => price[1]);
	
				const configuration = {
					type: 'line',
					data: {
						labels: labels,
						datasets: [{
							label: 'ApeCoin Price',
							data: data,
							fill: false,
							borderColor: 'rgb(75, 192, 192)',
							tension: 0.1,
							backgroundColor: 'rgba(75, 192, 192, 0.5)',
							pointStyle: 'circle',
							pointRadius: 10,
							pointHoverRadius: 15
						}]
					},
					options: {
						responsive: true,
						plugins: {
							title: {
								display: true,
								text: 'ApeCoin Price',
							}
						},
						scales: {
							x: {
								grid: {
									display: false
								}
							},
							y: {
								grid: {
									display: true,
									color: 'rgba(127, 127, 127, 0.2)'
								}
							}
						}
					},
					plugins: [{   // Plugin para alterar a cor de fundo do gráfico
						id: 'custom_canvas_background_color',
						beforeDraw: (chart) => {
						  const ctx = chart.canvas.getContext('2d');
						  ctx.save();
						  ctx.globalCompositeOperation = 'destination-over';
						  ctx.fillStyle = '#ffffff';  // Altere aqui para a cor de fundo desejada
						  ctx.fillRect(0, 0, chart.width, chart.height);
						  ctx.restore();
						}
					}]
				};
	
				const width = 800;
				const height = 600;
				const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
				const image = await chartJSNodeCanvas.renderToBuffer(configuration);
			const attachment = new AttachmentBuilder(image, { name: 'profile-image.png' });
			interaction.reply({ files: [attachment] });
		} catch (error) {
			console.error('Error generating chart:', error);
			await interaction.reply('There was an error generating the chart.');
		}
	},
};
