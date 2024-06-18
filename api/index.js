const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000; // Use Vercel's provided port or default to 3000

app.set('view engine', 'ejs');

let currentMovie = null;
let currentTime = 0;

app.get('/movie', (req, res) => {
    const { id, title, overview } = req.query;

    if (!id || !title || !overview) {
        return res.status(400).send('Missing movie information');
    }

    currentMovie = { id, title, overview };
    currentTime = 0; // Reset the time when a new movie starts

    // Construct the streaming URL
    const streamingUrl = `https://vidsrc.xyz/api/get/movie?tmdb_id=${id}`;

    res.render('movie', { title, overview, streamingUrl });
});

io.on('connection', (socket) => {
    if (currentMovie) {
        socket.emit('currentMovie', currentMovie);
        socket.emit('currentTime', currentTime);
    }

    socket.on('syncTime', (time) => {
        currentTime = time;
        socket.broadcast.emit('currentTime', currentTime);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

module.exports = (req, res) => {
    if (req.url.startsWith('/movie')) {
        app(req, res);
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
};

server.listen(port, () => {
    console.log(`Streaming platform running at http://localhost:${port}`);
});

