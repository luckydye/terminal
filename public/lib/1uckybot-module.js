let Console;

export default class LuckybotModule extends ConsoleModule {
    
    static get moduleName() {
        return "1uckybot-module";
    }

    static get commandName() {
        return "1uckybot";
    }
    
    static install(cnsl) {
        Console = cnsl;
    }

    static uninstall() {
        
    }

}