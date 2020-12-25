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
        terminal.setPrefix("");
        const username = await terminal.read("Username: ");
        print("\n__");
        terminal.setPrefix("");
        await simulateWrite('Your username: ' + username, 10);

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
        const terminal = getTerminal();
        terminal.setPrefix("");
        terminal.disableInput();
        terminal.clear();
        print("Bye. 3");

        setTimeout(() => {
            terminal.clear();
            print("Bye. 2");
        }, 1000);
        setTimeout(() => {
            terminal.clear();
            print("Bye. 1");
        }, 2000);
        setTimeout(() => {
            terminal.clear();
            print("Bye. 0");
            window.close();
        }, 3000);
    }

}
