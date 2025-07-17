const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, 
        {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        }
);

io.on('connection', (socket) => {
    socket.on('player_name', (name) => {
        io.emit('update_player', [name, 0.0]);
        console.log("received player name", name);
    });

    socket.on('player_time', (player) => {
        io.emit('update_player', player);
        console.log("registering player time of", player[0], "with time", player[1]);
    });
});

server.listen(4000, () => {
    console.log('server running at http://localhost:4000'); 
});