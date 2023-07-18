const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const { AttachmentBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coincomparison')
		.setDescription('Generates a multi-coin price chart.'),
        async execute(interaction) {
            try {
                const ethereumResponse = await axios.get('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily');
                const apecoinResponse = await axios.get('https://api.coingecko.com/api/v3/coins/apecoin/market_chart?vs_currency=usd&days=7&interval=daily');
    
                const labels = ethereumResponse.data.prices.map((_, i) => i + 1);
                const ethereumData = ethereumResponse.data.prices.map(price => price[1]);
                const apecoinData = apecoinResponse.data.prices.map(price => price[1]);
    
                const configuration = {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                        {
                            label: 'Ethereum Price',
                            data: ethereumData,
                            borderColor: 'rgb(75, 192, 192)',
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            pointStyle: 'circle',
                            pointRadius: 10,
                            pointHoverRadius: 15,
                            yAxisID: 'y',
                        },
                        {
                            label: 'ApeCoin Price',
                            data: apecoinData,
                            borderColor: 'rgb(153, 102, 255)',
                            backgroundColor: 'rgba(153, 102, 255, 0.5)',
                            pointStyle: 'circle',
                            pointRadius: 10,
                            pointHoverRadius: 15,
                            yAxisID: 'y1',
                        }]
                    },
                    options: {
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: 'Days'
                                }
                            },
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Price in USD'
                                },
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                                },
                                title: {
                                    display: true,
                                    text: 'Price in USD'
                                },
                            },
                        },
                    },
                    plugins: [{
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
			const attachment =  new AttachmentBuilder(image, 'multi-coin-price-chart.png');
			await interaction.reply({ files: [attachment] });
		} catch (error) {
			console.error('Error generating chart:', error);
			await interaction.reply('There was an error generating the chart.');
		}
	},
};
