import commands from './Commands.js';
import Terminal from './Terminal.js';

const terminal = new Terminal();

let ws;
let modules = new Map();

const MODULE_REGISTRY_ID = "modules";

function getModuleRegistry() {
    let moduleRegistry = localStorage.getItem(MODULE_REGISTRY_ID);
    if(!moduleRegistry) {
        moduleRegistry = '{ "modules": [] }';
    }
    return JSON.parse(moduleRegistry);
}

function saveModuleRegistry(reg) {
    localStorage.setItem(MODULE_REGISTRY_ID, JSON.stringify(reg));
}

export default class Console {
    
    static async loadModules() {
        const moduleRegistry = getModuleRegistry();
        for(let modulePath of moduleRegistry.modules) {
            const module = await Console.fetchModule(modulePath);
            Console.installModule(module);
        }
    }

    static getModules() {
        return modules;
    }

    static async fetchModule(path) {
        const raw = await fetch(path).then(res => res.text());
        const base64 = "data:application/javascript;base64," + btoa(raw);
        const module = await fetchModule(base64);
        module.origin = path;

        // register module in localstorage
        let registry = getModuleRegistry();
        if(registry.modules.indexOf(module.origin) === -1) {
            registry.modules.push(module.origin);
        }
        saveModuleRegistry(registry);

        return module;
    }

    static async installModule(module) {
        const name = module.moduleName || module.origin;
        if(modules.get(name)) {
            Console.print(`[Module] Module '${name}' already installed.`);
            return;
        }
        try {
            if(module.install) {
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

    static uninstallModule(moduleName) {
        const module = modules.get(moduleName);
        if(module) {
            modules.delete(moduleName);
            module.uninstall();
            if(module.commandName) {
                commands[module.commandName] = null;
            }

            // nuregister
            let moduleRegistry = getModuleRegistry();
            moduleRegistry.modules.splice(moduleRegistry.modules.indexOf(module.origin), 1);
            saveModuleRegistry(moduleRegistry);

            Console.print(`[Module] Uninstalled module '${moduleName}'`);
        } else {
            Console.print("Module not found.");
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
