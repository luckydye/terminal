import './Terminal.js';
import commands from './Commands.js';
import Console from './Console.js';

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

const terminal = Console.getTerminal();
terminal.disableInput();
mainEle.appendChild(terminal);

setTimeout(async () => {
    const terminal = Console.getTerminal();
    
    await Console.print(PREROLL);
    await Console.sleep(200);
    await Console.simulateWrite("Starting up", 12);
    await Console.simulateWrite("... ", 250);
    await Console.print("[OK]");
    await Console.sleep(200);
    await Console.simulateWrite("Connecting to Interface\0.\0.\0.", 24);
    await Console.simulateWrite("\0\0\0\0", 12);
    
    const ws = Console.connectToWebSocket(async () => {
        Console.print("");

        while(true) {
            const value = await terminal.read(INPUT_PREFIX);
            const args = value.split(" ");
            await handleInput(args).catch(err => {
                console.error(err);
                Console.print(`\n[Internal Error]: ${err.message}\n`);
            });
        }
    });

    async function handleInput(args) {
        if(args[0] != "") {
            if(commands[args[0]]) {
                idle = false;
                const exit = await commands[args[0]](args.slice(1), Console);
                if(exit !== 0 && exit != undefined) {
                    Console.print("\nProcess exited.\n");
                }
                terminal.read(INPUT_PREFIX);
                idle = true;
            } else {
                Console.print(`\nCommand "${args[0]}" not found.\n`);
            }
        }
    }

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

}, 200);
