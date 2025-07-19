const { Player } = require("./player.js");
const { Bounds2D } = require("./bounds.js");

const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { vec2 } = require("gl-matrix");


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

const MAX_LEADERBOARD_SIZE = 10;

let players = new Map();
let playerNames = new Set();
let leaderboard = [];

io.on('connection', (socket) => {
    players.set(socket.id, 
        {
            player: new Player(),
            socket: socket
        });

    socket.on('disconnect', () => {
        const session = players.get(socket.id);
        
        if (!session) return;

        let index = leaderboard.findIndex((value) => {
            value === session.player.getName();
        });

        if (index !== -1) {
            leaderboard.splice(index, 1);
        }

        playerNames.delete(session.player.getName());
        players.delete(socket.id);

    });

    socket.on('player_name', (name, callback) => {
        if(playerNames.has(name)) {
            callback({status: "err", reason: "player name already exists" });
        } else {
            callback({status: "ok", reason: ""});
            playerNames.add(name);

            const session = players.get(socket.id).player;
            if(!session) {
                return;
            }

            session.player.setName(name);
        }
    });

    socket.on('jump', () => {
        const session = players.get(socket.id);
        if(!session) {
            return;
        }

        if(!session.player.isPlaying()) {
            return;
        }

        session.player.jump();
    });

    socket.on('mouse_position', (position) => {
        if (!Array.isArray(position) || position.length !== 2) return;

        const session = players.get(socket.id);
        if (!session) return;
        
        session.player.updateMousePosition(vec2.fromValues(position[0], position[1]));
    });

    socket.on('start_playing', () => {
        const session = players.get(socket.id);

        if (!session) return;

        session.player.startPlaying();
    });
});

const targetTicksPerSecond = 60;
const interval = 1000 / targetTicksPerSecond;
const screenBounds = new Bounds2D(vec2.fromValues(0, 0), vec2.fromValues(1, 1));

setInterval(() => {
    for (const [id, session] of players.entries()) {
        if(!session.player.isPlaying()) {
            continue;
        }
        
        session.player.update();

        io.to(id).emit(
            "player_update",  
            Array.from(session.player.getPosition()));

        if(!screenBounds.intersects(session.player.getBounds())) {
            io.to(id).emit(
              "stop_playing"
            );

            session.player.stopPlaying();
        }
    }     
    
}, interval); 

server.listen(4000, () => {
    console.log('server running at http://localhost:4000'); 
});