import commands from './Commands.js';
import Terminal from './Terminal.js';

const terminal = new Terminal();

let ws;
let modules = new Map();

export default class Console {

    static getModules() {
        return modules;
    }

    static async fetchModule(path) {
        const raw = await fetch(path).then(res => res.text());
        const base64 = "data:application/javascript;base64," + btoa(raw);
        const module = await fetchModule(base64);
        module.origin = path;
        return module;
    }

    static async installModule(module) {
        // TODO:
        // Actually "install" them into local storage for reuse.
        // Also make a "unsintsall" function/method.
        try {
            if(module.install) {
                const name = module.moduleName || module.origin;
                modules.set(name, module);
                module.install(Console);

                Console.print(`[Module] Installed module '${name}'`);
    
                if(module.commandName) {
                    commands[module.commandName] = module.run;
                }
            } else {
                throw new Error(`Missing install method in module: ${path}`);
            }
        } catch(err) {
            Console.print("[Error] " + err.message);
        }
    }

    static connectToWebSocket(callback = () => {}) {
        ws = new WebSocket(location.origin.replace("https", "wss").replace("http", "ws"));
    
        ws.onopen = (event) => {
            callback();
        };
    
        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            
            if(data.type == "message") {
                const str = `${data.data.username}: ${data.data.text}`;
                terminal.append(terminal.cursor[1], str);
            }
            
            if(data.type == "left") {
                const str = `${data.data.username} left the room.`;
                terminal.append(terminal.cursor[1], str);
            }
        };
    
        return ws;
    }
    
    static getSocket() {
        return ws;
    }
    
    static getTerminal() {
        return terminal;
    }
    
    static async simulateWrite(str, ms = 24) {
        return new Promise((resolve) => {
            terminal.disableInput();
    
            const time = ms;
    
            let index = 0;
            const int = setInterval(() => {
    
                const curr = str[index];
    
                terminal.write(curr);
    
                index++;
    
                if (index == str.length) {
                    clearInterval(int);
                    resolve();
                }
            }, time);
        })
    }
    
    static print(str) {
        const lines = str.split("\n");
        for (let line of lines) {
            terminal.write(line);
            terminal.write('\n');
        }
    }
    
    static sleep(time) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), time);
        })
    }
}
