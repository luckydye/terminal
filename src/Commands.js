import { simulateWrite, sleep, print, getTerminal, getSocket } from './Console.js';

export default {

    help(args) {
        print("\nNo help needed :)\n");
    },

    prefix(args) {
        const terminal = getTerminal();
        print(terminal.prefix);
    },

    clear(args) {
        const terminal = getTerminal();
        terminal.clear();
    },

    async chat(args) {
        const ws = getSocket();
        const id = args[0];

        if(id == "" || !id) {
            print("Please provide a chat id to connect to");
            return;
        }

        const terminal = getTerminal();
        terminal.setPrefix("");
        terminal.disableInput();
        await simulateWrite('Connecting to chat...', 10);

        terminal.newline();
        terminal.newline();
        const username = await terminal.read("Username: ");
        terminal.newline();

        while(true) {
            const input = await terminal.read("> ");
            console.log(input);
            if(input.toLocaleLowerCase() == "^c") {
                return 1;
                break;
            }
        }
    },

    connections(args) {
        const terminal = getTerminal();
        terminal.disableInput();
        terminal.setPrefix("");

        fetch('/connections')
        .then(res => res.json())
        .then(async json => {
            await simulateWrite(`\nActive connections: ${json.data}\n\n`, 12);
        })
    },

    exit(args) {
        return new Promise((resolve) => {
            const terminal = getTerminal();
            terminal.setPrefix("");
            terminal.disableInput();
            terminal.clear();
            print("Bye.");

            setTimeout(() => window.close(), 1000);
        })
    }

}
