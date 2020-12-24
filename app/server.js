const path = require('path');
const express = require('express');
const ws = require('ws');
const port = 3000;

const connections = [];

function broadcast(msg) {
    for (let ws of connections) {
        ws.send(msg);
    }
}

const app = express();

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
    connections.push(socket);

    socket.on('message', message => {
        // broadcast(message);
    });
});

app.use('/statc', express.static(path.join(__dirname, '../public')));
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const server = app.listen(port, () => {
    console.log(`Terminal listening at http://localhost:${port}`)
});

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
        wsServer.emit('connection', socket, request);
    });
});
