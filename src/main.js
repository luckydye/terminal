import './Terminal.js';
import commands from './Commands.js';
import { simulateWrite, sleep, print, getTerminal, connectToWebSocket } from './Console.js';

const preroll = `

@@@@@@            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@      
@@@@@@@@,               /@@@.                        @@@(                 
@@@@  @@@@#             /@@@.                        @@@(                 
@@@@    @@@@@@@@@       /@@@.     @@@@@@@@@@@&       @@@(                 
@@@@      @@@@@         /@@@.                        @@@(                 
(@@@        %           /@@@.                        @@@(                 
  .@                    /@@@.     @@@@@@@@@@@@@      @@@@@@@@@@@@@@@/     
\n
`;

setTimeout(async () => {
    const terminal = getTerminal();
    
    await simulateWrite(preroll, 4);
    await sleep(200);
    await simulateWrite("Starting up", 24);
    await simulateWrite("... ", 250);
    await print("[OK]");
    await sleep(200);
    await simulateWrite("Starting Interface\0.\0.\0.", 24);
    await simulateWrite("\0\0\0\0", 12);

    const ws = connectToWebSocket();

    terminal.addEventListener('submit', e => {
        const args = e.value.split(" ");
        if(args[0] != "") {
            if(commands[args[0]]) {
                commands[args[0]](args.slice(1));
            } else {
                ws.send(e.value);
                print(`\nCommand "${args[0]}" not found.\n`);
            }
        }
    });

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

}, 500);
