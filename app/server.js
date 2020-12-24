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

const wss = new ws.Server({ noServer: true });
wss.on('connection', socket => {
    socket.isAlive = true;
    socket.on('pong', heartbeat);

    connections.push(socket);

    socket.on('message', message => {
        // broadcast(message);
    });

    socket.on('disconnect', message => {
        connections.splice(connections.indexOf(socket), 1);
    });
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping(noop);
    });
}, 30000);

wss.on('close', function close() {
    clearInterval(interval);
});

app.use('/statc', express.static(path.join(__dirname, '../public')));
app.get('/connections', (req, res) => {
    res.send(JSON.stringify({ data: connections.length }));
});
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
