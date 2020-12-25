let Console;

export default class TestModule extends ConsoleModule {

    static get moduleName() {
        return "test-module";
    }

    static get commandName() {
        return "test";
    }

    static install(cnsl) {
        Console = cnsl;
    }

    static run(args) {
        return new Promise((resolve) => {
            const terminal = Console.getTerminal();
            let running = true;

            terminal.disableInput();

            const cancel = () => {
                running = false;
                resolve();
            }

            terminal.addEventListener('shortcut', e => {
                if(e.key.toLocaleLowerCase() == "c") cancel();
            })

            let x = 0, y = 0;

            const draw = () => {
                const ctxt = terminal.getContext();
                const time = performance.now() / 100;

                x += Math.sin(time) * 20;
                y += Math.cos(time + time) * 5;

                ctxt.fillStyle = "red";
                ctxt.fillRect(400 + x, 100 + y, 48, 48);

                if(running) {
                    requestAnimationFrame(draw);
                }
            }

            draw();
        });
    }

}