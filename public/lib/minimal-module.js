export default class MinimalModule extends ConsoleModule {

    // static get commandName() {
    //     return "";
    // }

    static install(Console) {
        this.console = Console;
    }

    static run(args) {
        console.log(args);
    }

}