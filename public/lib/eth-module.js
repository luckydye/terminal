class Coinbase {

    static get apiOrigin() {
        return 'https://api.coinbase.com/v2/';
    }

    static fetchApi(url) {
        return fetch(Coinbase.apiOrigin + url).then(res => res.json());
    }

    static async getBuyPrice(code) {
        return Coinbase.fetchApi(`prices/${code}/buy`).then(res => res.data);
    }

    static async getSpotPrize(code) {
        return Coinbase.fetchApi(`prices/${code}/spot`).then(res => res.data);
    }

    static async getSellPrize(code) {
        return Coinbase.fetchApi(`prices/${code}/sell`).then(res => res.data);
    }

}

export default class EthModule extends ConsoleModule {
    
    static get moduleName() {
        return "eth-module";
    }
    
    static install(Console) {
        const terminal = Console.getTerminal();
        const context = terminal.getContext();
        let lines = ["", ""];
        
        const update = async () => {
            const prize = await Coinbase.getSpotPrize("ETH-EUR");
            lines[0] = `ETH: ${prize.amount} ${prize.currency}`;
            const prize2 = await Coinbase.getSpotPrize("BTC-EUR");
            lines[1] = `BTC: ${prize2.amount} ${prize2.currency}`;
            this.int = setTimeout(update, 1000 * 10);
        }

        const draw = () => {
            context.textAlign = "right";
            context.font = "bold 18px monospace";
            let i = 0;
            for(let line of lines) {
                i++;
                context.fillText(line, context.canvas.width - 32, 80 + (i * 20));
            }

            this.frame = requestAnimationFrame(draw);
        }

        update();
        draw();
    }

    static uninstall() {
        clearTimeout(this.int);
        cancelAnimationFrame(this.frame);
    }

}