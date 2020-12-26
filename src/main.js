import commands from './Commands.js';
import Console from './Console.js';
import ConsoleModule from './ConsoleModule.js';
import TestModule from './modules/test-module.js';

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

const nativeModules = [
    '/statc/lib/minimal-module.js',
    '/statc/lib/chat-module.js',
    TestModule,
]

let idle = true;

const terminal = Console.getTerminal();
terminal.disableInput();
mainEle.appendChild(terminal);

setTimeout(async () => {
    const terminal = Console.getTerminal();
    
    await Console.print(PREROLL);
    await Console.sleep(100);
    await Console.simulateWrite("Initializing", 4);
    await Console.simulateWrite("...\n\n", 64);

    for(let modulePath of nativeModules) {
        let module = modulePath;
        if(typeof module === "string") {
            module = await Console.fetchModule(modulePath).catch(err => {
                Console.print("[Error] " + err.message);
            })
        }
        await Console.installModule(module);
    }
    Console.print("");

    await Console.sleep(100);
    await Console.print("Connecting to Interface...", 4);
    
    const ws = Console.connectToWebSocket(async () => {
        Console.print('Connection established.');
        Console.print("");
        await Console.sleep(100);

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
                const exit = await commands[args[0]](args.slice(1));
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

    terminal.addEventListener('shortcut', e => {
        if(e.key == "r") {
            location.reload();
        } else if(e.key == "v") {
            e.preventDefault();
        }
    });

    window.addEventListener('paste', e => {
        e.clipboardData.items[0].getAsString(str => {
            terminal.write(str);
        });
    })

}, 200);
