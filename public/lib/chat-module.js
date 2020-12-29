let Console, ws;

async function connectToWebSocket() {
    return new Promise((resolve, reject) => {
        ws = new WebSocket(location.origin.replace("https", "wss").replace("http", "ws"));

        ws.onopen = (event) => {
            resolve(ws);
        };

        ws.onerror = (event) => {
            reject(ws);
        };
    
        ws.onmessage = (msg) => {
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
        };
    })
}

export default class ChatModule extends ConsoleModule {

    static get commandName() {
        return "chat";
    }

    static async install(cnsl) {
        Console = cnsl;
    }

    static async run(args) {
        const id = args[0];

        if(id == "" || !id) {
            Console.print("Please provide a chat id to connect to");
            return;
        }

        const terminal = Console.getTerminal();
        terminal.setPrefix("");
        terminal.disableInput();
        await Console.simulateWrite('Connecting to chat...\n', 10);
        await connectToWebSocket();

        Console.print('Connection established.');
        Console.print("");

        const username = await terminal.read("Username: ");
        terminal.newline();

        while(true) {
            const input = await terminal.read("> ");
            if(input == "") continue;

            ws.send(JSON.stringify({
                type: 'chat',
                data: {
                    username: escape(username),
                    room: id,
                    message: input,
                }
            }));

            if(input.toLocaleLowerCase() == "^c") {
                ws.send(JSON.stringify({
                    type: 'leave',
                    data: {
                        username: escape(username),
                        room: id,
                    }
                }));
                return 1;
                break;
            }
        }
    }

}