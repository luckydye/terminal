import commands from './Commands.js';
import Console from './Console.js';
import ConsoleModule from './ConsoleModule.js';
import TwitchModule from './modules/twitch-module.js';
import DownloadModule from './modules/dl-module.js';
import WebsocketModule from './modules/ws-module.js';

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
    WebsocketModule,
    TwitchModule,
    DownloadModule,
]

let idle = true;

const terminal = Console.getTerminal();
terminal.disableInput();
mainEle.appendChild(terminal);

setTimeout(async () => {
    const terminal = Console.getTerminal();
    
    await Console.print(PREROLL);
    await Console.simulateWrite("Initializing...\n\n", 4);

    await Console.print("Loading native modules...\n");
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

    await Console.print("Loading optional modules...\n");
    await Console.loadModules();
    Console.print("");

    async function handleInput(args) {

        function evaluate() {
            const result = eval(args.join(" "));
            if(result) {
                Console.print(result.toString());
            }
        }

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
                try {
                    evaluate.call(Console);
                } catch(err) {
                    console.error(err);
                    Console.print("\n[Error] " + err.message);
                }
            }
        }
    }

    terminal.addEventListener('shortcut', e => {
        if(e.key == "r") {
            location.reload();
        } else if(e.key == "v") {
            navigator.clipboard.readText().then(txt => {
                terminal.write(txt);
            })
            e.defaultPrevented = true;
        }
    });

    while(true) {
        const value = await terminal.read(INPUT_PREFIX);
        const args = value.split(" ");
        await handleInput(args).catch(err => {
            console.error(err);
            Console.print(`\n[Internal Error]: ${err.message}\n`);
        });
    }

}, 200);
