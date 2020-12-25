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

    async run(args) {
        console.log(args);
    },

    list() {
        print(`Commands: ${Object.keys(this).join(", ")}`);
    },

    test(args) {
        return new Promise((resolve) => {
            const terminal = getTerminal();
            let running = true;

            terminal.disableInput();

            const cancel = () => {
                running = false;
                resolve();
            }

            terminal.addEventListener('shortcut', e => {
                if(e.key.toLocaleLowerCase() == "c") cancel();
            })

            let x = 0, y = 0;

            const draw = () => {
                const ctxt = terminal.getContext();
                const time = performance.now() / 100;

                x += Math.sin(time) * 20;
                y += Math.cos(time + time) * 5;

                ctxt.fillStyle = "red";
                ctxt.fillRect(400 + x, 100 + y, 48, 48);

                if(running) {
                    requestAnimationFrame(draw);
                }
            }

            draw();
        });
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
    },

    // connections(args) {
    //     const terminal = getTerminal();
    //     terminal.disableInput();
    //     terminal.setPrefix("");

    //     return fetch('/connections')
    //     .then(res => res.json())
    //     .then(async json => {
    //         await simulateWrite(`\nActive connections: ${json.data}\n\n`, 12);
    //     })
    // },

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
