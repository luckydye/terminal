import './ConsoleModule.js';
import Console from './Console.js';
import FileSystem from './FileSystem.js';
import DownloadModule from './modules/dl.js';
import TwitchModule from './modules/twitch.js';
import WebsocketModule from './modules/ws.js';
import TitleModule from './modules/title.js';
import EchoModule from './modules/echo.js';
import HTMLModule from './modules/html.js';

async function init() {
    
    const PREROLL = `

@@@@@@            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@ 
@@@@@@@@,               /@@@.                        @@@(            
@@@@  @@@@#             /@@@.                        @@@(            
@@@@    @@@@@@@@@       /@@@.     @@@@@@@@@@@&       @@@(            
@@@@      @@@@@         /@@@.                        @@@(            
(@@@        %           /@@@.                        @@@(            
  .@                    /@@@.     @@@@@@@@@@@@@      @@@@@@@@@@@@@@@/

\\\\\\HTML 500 100 <img height="100" src="https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x"/> <img height="100" src="https://cdn.betterttv.net/emote/5ada077451d4120ea3918426/3x"/>
\\\\\\HTML 500 15 <a>Testing the html text font.</a>
    `;

    const nativeModules = [
        WebsocketModule,
        TwitchModule,
        DownloadModule,
        TitleModule,
        EchoModule,
        HTMLModule,
        ...FileSystem.modules,
    ]

    const terminal = Console.getTerminal();
    terminal.disableInput();

    setTimeout(async () => {
        const terminal = Console.getTerminal();
        
        await Console.print(PREROLL);
        await Console.log("Initializing");

        await Console.log("Loading modules\n");
        for(let modulePath of nativeModules) {
            let module = modulePath;
            if(typeof module === "string") {
                module = await Console.fetchModule(modulePath).catch(err => {
                    Console.log("[Error] " + err.message);
                })
            }
            await Console.installModule(module);
        }

        await Console.loadModules();
        Console.print("");

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
            const value = await terminal.read(Console.INPUT_PREFIX);
            const args = value.split(" ");
            await Console.evaluateInput(args).catch(err => {
                console.error(err);
                Console.print(`\n[Internal Error]: ${err.message}\n`);
            });
        }

    }, 200);

    return Console;
}

window.initialiseTerminal = async () => {
    const Cnsl = await init();
    const terminal = Cnsl.getTerminal();
    document.body.appendChild(terminal);
}

window.createTerminal = async () => {
    return await init();
}
