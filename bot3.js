const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

const token = 'discord_token';
const tmdbApiKey = 'tmdb_api';
const streamingPlatformUrl = 'http://localhost:5173/movie';

client.once('ready', () => {
    console.log('Logged in as', client.user.tag);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!movie')) return;

    const args = message.content.split(' ');
    if (args.length < 2) {
        message.channel.send('Please provide the name of the movie.');
        return;
    }

    const movieName = args.slice(1).join(' ');

    try {
        // Search for the movie on TMDb
        const tmdbResponse = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
            params: {
                api_key: tmdbApiKey,
                query: movieName,
            },
        });

        if (tmdbResponse.data.results.length === 0) {
            message.channel.send('No movie found with that name.');
            return;
        }

        const movie = tmdbResponse.data.results[0];
        const movieId = movie.id;
        const movieTitle = encodeURIComponent(movie.title);
        const movieOverview = encodeURIComponent(movie.overview);

        // Generate the streaming link with movie details
        const streamingLink = `${streamingPlatformUrl}?id=${movieId}&title=${movieTitle}&overview=${movieOverview}`;

        message.channel.send(`Watch ${movie.title}: ${streamingLink}`);
    } catch (error) {
        console.error('Error fetching movie:', error);
        message.channel.send('Error fetching the movie. Please try again later.');
    }
});

client.login(token);
