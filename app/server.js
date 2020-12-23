const WebSocket = require('ws');
const path = require('path');

const wss = new WebSocket.Server({ port: 8088 });

const connections = [];

function broadcast(msg) {
    for (let ws of connections) {
        ws.send(msg);
    }
}

wss.on('connection', function connection(ws) {
    connections.push(ws);

    ws.on('message', function incoming(message) {
        broadcast(message);
    });
});

const express = require('express')
const app = express()
const port = 3000

app.use('/chat', express.static(path.join(__dirname, 'src')));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});