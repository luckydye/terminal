const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8088 });

const connections = [];

function broadcast(msg) {
    for(let ws of connections) {
        ws.send(msg);
    }
}

wss.on('connection', function connection(ws) {
    connections.push(ws);

    ws.on('message', function incoming(message) {
        broadcast(message);
    });
});
