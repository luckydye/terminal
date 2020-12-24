import './Terminal.js';
import commands from './Commands.js';
import { simulateWrite, sleep, print, getTerminal } from './Console.js';

let ws;

const preroll = `

@@@@@@            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@      
@@@@@@@@,               /@@@.                        @@@(                 
@@@@  @@@@#             /@@@.                        @@@(                 
@@@@    @@@@@@@@@       /@@@.     @@@@@@@@@@@&       @@@(                 
@@@@      @@@@@         /@@@.                        @@@(                 
(@@@        %           /@@@.                        @@@(                 
  .@                    /@@@.     @@@@@@@@@@@@@      @@@@@@@@@@@@@@@/     

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

    ws = new WebSocket(`wss://dev.luckydye.de:8088/`);

    ws.onopen = function (event) {
        print('\nConnection established.');
        simulateWrite("\n> \t", 0);
    };

    ws.onmessage = function incoming(msg) {
        const str = "User: " + msg.data + "\n";
        terminal.append(terminal.cursor[1], str);
    };

    terminal.addEventListener('submit', e => {
        const args = e.value.split(" ");
        if(commands[args[0]]) {
            commands[args[0]](args.slice(1));
            // ws.send(e.value);
        } else {
            print('Unknown Command');
        }
    });

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

    setTimeout(() => {
        ws.onopen();
    }, 500);

}, 500);
