const path = require('path');
const express = require('express');
const ws = require('ws');
const port = 3000;

const rooms = new Map();

function broadcast(roomId, msg) {
    const room = getRoom(roomId);
    const closedSockets = [];
    for (let ws of room) {
        if(ws.readyState === 1) {
            ws.send(msg);
        } else {
            closedSockets.push(ws);
        }
    }
    for(let ws of closedSockets) {
        room.delete(ws);
    }
}

function getRoom(id) {
    if(!rooms.has(id)) {
        rooms.set(id, new Set());
    }
    return rooms.get(id);
}

const app = express();

const wss = new ws.Server({ noServer: true });
wss.on('connection', socket => {
    socket.on('message', message => {
        const msg = JSON.parse(message);
        const type = msg.type;

        switch(type) {
            case "chat": {
                const username = msg.data.username;
                const roomId = msg.data.room;
                const text = msg.data.message;
                const room = getRoom(roomId);

                room.add(socket);
                broadcast(roomId, JSON.stringify({
                    type: 'message',
                    data: {
                        text: text,
                        username: username,
                    }
                }));
                break;
            }
            case "leave": {
                const username = msg.data.username;
                const roomId = msg.data.room;
                const room = getRoom(roomId);

                room.delete(socket);
                broadcast(roomId, JSON.stringify({
                    type: 'left',
                    data: {
                        username: username,
                    }
                }));
                break;
            }
        }
    });

    socket.on('disconnect', message => {
        connections.splice(connections.indexOf(socket), 1);
    });
});

app.use('/statc', express.static(path.join(__dirname, '../public')));
// app.get('/connections', (req, res) => {
//     res.send(JSON.stringify({ data: connections.length }));
// });
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const server = app.listen(port, () => {
    console.log(`Terminal listening at http://localhost:${port}`)
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});
