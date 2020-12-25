import './Terminal.js';
import commands from './Commands.js';
import { simulateWrite, sleep, print, getTerminal, connectToWebSocket } from './Console.js';

const PREROLL = `

@@@@@@            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@      
@@@@@@@@,               /@@@.                        @@@(                 
@@@@  @@@@#             /@@@.                        @@@(                 
@@@@    @@@@@@@@@       /@@@.     @@@@@@@@@@@&       @@@(                 
@@@@      @@@@@         /@@@.                        @@@(                 
(@@@        %           /@@@.                        @@@(                 
  .@                    /@@@.     @@@@@@@@@@@@@      @@@@@@@@@@@@@@@/     

`;
const INPUT_PREFIX = "terminal@52.59.209.57:~$ ";

let idle = true;

setTimeout(async () => {
    const terminal = getTerminal();
    
    await print(PREROLL);
    await sleep(200);
    await simulateWrite("Starting up", 12);
    await simulateWrite("... ", 250);
    await print("[OK]");
    await sleep(200);
    await simulateWrite("Connecting to Interface\0.\0.\0.", 24);
    await simulateWrite("\0\0\0\0", 12);
    
    const ws = connectToWebSocket(async () => {
        print("");

        while(true) {
            const value = await terminal.read(INPUT_PREFIX);
            const args = value.split(" ");
            await handleInput(args).catch(err => {
                console.error(err);
                print(`\n[Internal Error]: ${err.message}\n`);
            });
        }
    });

    async function handleInput(args) {
        if(args[0] != "") {
            if(commands[args[0]]) {
                idle = false;
                const exit = await commands[args[0]](args.slice(1));
                if(exit !== 0 && exit != undefined) {
                    print("\nProcess exited.\n");
                }
                terminal.read(INPUT_PREFIX);
                idle = true;
            } else {
                print(`\nCommand "${args[0]}" not found.\n`);
            }
        }
    }

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

}, 500);
