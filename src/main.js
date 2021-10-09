import './ConsoleModule.js';
import Console from './Console.js';
import FileSystem from './FileSystem.js';
import WebsocketModule from './modules/ws.js';
import TitleModule from './modules/title.js';
import EchoModule from './modules/echo.js';
import HTMLModule from './modules/html.js';

async function startSequence() {
    return new Promise((resolve) => {
        setTimeout(() => {
            Console.clear();
            Console.print("Booting up .");
        }, 1000 * 1);
        setTimeout(() => {
            Console.clear();
            Console.print("Booting up ..");
        }, 1000 * 2);
        setTimeout(() => {
            Console.clear();
            Console.print("Booting up ...");
        }, 1000 * 3);
        setTimeout(() => {
            Console.clear();
            Console.print("Booting up .");
        }, 1000 * 4);
        setTimeout(() => {
            Console.clear();
            Console.print("Booting up ..");
        }, 1000 * 5);
        setTimeout(() => {
            Console.clear();
            resolve();
        }, 1000 * 6);
    })
}

async function sleep(seconds = 1) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000 * seconds);
    })
}

async function initTerminal() {
    
    const nativeModules = [
        WebsocketModule,
        TitleModule,
        EchoModule,
        HTMLModule,
        ...FileSystem.modules,
    ]

    const terminal = Console.getTerminal();
    terminal.clear();
    terminal.disableInput();

    setTimeout(async () => {
        const terminal = Console.getTerminal();
        
        await startSequence();
        
        await Console.simulateWrite("Initializing\n\n");
        await sleep();

        await Console.log("Loading modules\n");
        await sleep(0.5);
        for(let modulePath of nativeModules) {
            let module = modulePath;
            if(typeof module === "string") {
                module = await Console.fetchModule(modulePath).catch(err => {
                    Console.log("[Error] " + err.message);
                })
            }
            await Console.installModule(module);
            await sleep(0.05);
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

    }, 50);

    return Console;
}

window.createTerminal = async () => {
    return await initTerminal();
}
