let Console;

export default class ChatModule extends ConsoleModule {

    static get commandName() {
        return "chat";
    }

    static install(cnsl) {
        Console = cnsl;
    }

    static async run(args) {
        const ws = Console.getSocket();
        const id = args[0];

        if(id == "" || !id) {
            Console.print("Please provide a chat id to connect to");
            return;
        }

        const terminal = Console.getTerminal();
        terminal.setPrefix("");
        terminal.disableInput();
        await Console.simulateWrite('Connecting to chat...', 10);

        terminal.newline();
        terminal.newline();
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