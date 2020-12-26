export default class ClockModule extends ConsoleModule {
    
    static get moduleName() {
        return "clock-module";
    }
    
    static install(Console) {
        const terminal = Console.getTerminal();
        const context = terminal.getContext();
        
        const draw = () => {
            const timeString = new Date().toLocaleTimeString();

            context.alignText = "right";
            context.font = "monospace 24px";
            context.fillText(timeString, context.canvas.width - 32, 32);

            requestAnimationFrame(draw);
        }

        draw();
    }

}