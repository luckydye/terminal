export default class ClockModule extends ConsoleModule {
    
    static get moduleName() {
        return "clock-module";
    }
    
    static install(Console) {
        const terminal = Console.getTerminal();
        const context = terminal.getContext();
        
        const draw = () => {
            const timeString = new Date().toLocaleTimeString();

            context.textAlign = "right";
            context.font = "bold 24px monospace";
            context.fillText(timeString, context.canvas.width - 32, 32);

            this.frame = requestAnimationFrame(draw);
        }

        draw();
    }

    static uninstall() {
        cancelAnimationFrame(this.frame);
    }

}