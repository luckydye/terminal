import { INPUT_PREFIX } from './Commands.js';
import { simulateWrite, sleep, print, getTerminal } from './Console.js';

export default async function chat(args) {

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
    const username = await terminal.read("Username: ");
    terminal.setPrefix("");
    console.log(username);
    await simulateWrite('Your username: ' + username, 10);

    terminal.newline();
    terminal.read("> ");

}