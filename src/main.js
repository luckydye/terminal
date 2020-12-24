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

let idle = true;

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

    terminal.addEventListener('submit', async e => {
        if(idle) {
            const args = e.value.split(" ");
            if(args[0] != "") {
                if(commands[args[0]]) {
                    idle = false;
                    await commands[args[0]](args.slice(1));
                    idle = true;
                } else {
                    ws.send(e.value);
                    print(`\nCommand "${args[0]}" not found.\n`);
                }
            }
        }
    });

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

}, 500);
