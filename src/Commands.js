import { simulateWrite, sleep, print, getTerminal } from './Console.js';

export default {

    help(args) {
        print("No help needed :)");
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
