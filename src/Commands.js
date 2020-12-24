import { simulateWrite, sleep, print, getTerminal } from './Console.js';
import chat from './Programm.js';

export const INPUT_PREFIX = "terminal@52.59.209.57:~$ ";

export default {

    help(args) {
        print("\nNo help needed :)\n");
    },

    clear(args) {
        const terminal = getTerminal();
        terminal.clear();
    },

    chat: chat,

    connections(args) {
        const terminal = getTerminal();
        terminal.disableInput();
        terminal.setPrefix("");

        fetch('/connections')
        .then(res => res.json())
        .then(async json => {
            await simulateWrite(`\nActive connections: ${json.data}\n\n`, 12);
            terminal.read(INPUT_PREFIX);
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
