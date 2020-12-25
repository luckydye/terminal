const terminal = document.createElement('gyro-terminal');

let ws;

export default class Console {

    static connectToWebSocket(callback = () => {}) {
        ws = new WebSocket(location.origin.replace("https", "wss").replace("http", "ws"));
    
        ws.onopen = (event) => {
            this.print('\nConnection established.');
            callback();
        };
    
        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            
            if(data.type == "message") {
                const str = `${data.data.username}: ${data.data.text}`;
                terminal.append(terminal.cursor[1], str);
            }
            
            if(data.type == "left") {
                const str = `${data.data.username} left the room.`;
                terminal.append(terminal.cursor[1], str);
            }
        };
    
        return ws;
    }
    
    static getSocket() {
        return ws;
    }
    
    static getTerminal() {
        return terminal;
    }
    
    static async simulateWrite(str, ms = 24) {
        return new Promise((resolve) => {
            terminal.disableInput();
    
            const time = ms;
    
            let index = 0;
            const int = setInterval(() => {
    
                const curr = str[index];
    
                terminal.write(curr);
    
                index++;
    
                if (index == str.length) {
                    clearInterval(int);
                    resolve();
                }
            }, time);
        })
    }
    
    static print(str) {
        const lines = str.split("\n");
        for (let line of lines) {
            terminal.write(line);
            terminal.write('\n');
        }
    }
    
    static sleep(time) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), time);
        })
    }
}
