let Console;

async function connectToWebSocket(host) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(host, "terminal-protocol");

        ws.onopen = (event) => {
            resolve(ws);
        };

        ws.onerror = (event) => {
            reject(event);
        };
    })
}

export default class WebsocketModule extends ConsoleModule {
    
    static get moduleName() {
        return "ws-module";
    }

    static get commandName() {
        return "ws";
    }
    
    static install(cnsl) {
        Console = cnsl;
    }

    static uninstall() {
        
    }

    static _handleSocketMessage(ws, msg) {
        const terminal = Console.getTerminal();
        const data = JSON.parse(msg.data);
        
        if(data.type == "message") {
            const str = `${data.data.username}: ${data.data.text}`;
            terminal.append(terminal.cursor[1], str);
        }
        
        if(data.type == "left") {
            const str = `${data.data.username} left the room.`;
            terminal.append(terminal.cursor[1], str);
        }
    }
    
    static async run(args) {
        const arg1 = args[0].split("@");
        const login = arg1[0];
        const address = arg1[1];

        if(address == "" || !address) {
            Console.print("Missing address to connect to.");
            return;
        }

        const terminal = Console.getTerminal();
        terminal.setPrefix("");
        terminal.disableInput();
        Console.print(`Connecting to ${args[0]}`);

        let url = `wss:${address}`;
        // if(location.origin.match('localhost:3000')) {
        //     url = location.origin.replace("https", "wss").replace("http", "ws");
        // }

        return connectToWebSocket(url).then(async ws => {
            WebsocketModule.prefix = args[0] + ":$ ";

            ws.onmessage = msg => {
                this._handleSocketMessage(ws, msg);
            };
    
            Console.print('Connected.');
            Console.print('');
    
            while(true) {
                const input = await terminal.read(WebsocketModule.prefix);
                if(input == "") continue;
    
                ws.send(JSON.stringify({
                    type: 'input',
                    data: {
                        input,
                    }
                }));
    
                if(input.toLocaleLowerCase() == "^c") {
                    return 1;
                    break;
                }
            }
        }).catch(err => {
            console.error(err);
            Console.print(`Error connecting to ${args[0]}`);
        })
    }

}

WebsocketModule.prefix = "> ";