const terminal = document.createElement('gyro-terminal');
terminal.disableInput();
mainEle.appendChild(terminal);

export function getTerminal() {
    return terminal;
}

export async function simulateWrite(str, ms = 24) {
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

export function print(str) {
    const lines = str.split("\n");
    for (let line of lines) {
        terminal.write(line);
        terminal.write('\n');
    }
}

export function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    })
}
