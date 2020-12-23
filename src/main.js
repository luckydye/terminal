import './Terminal.js';

let ws;

const terminal = document.createElement('gyro-terminal');
terminal.disableInput();
mainEle.appendChild(terminal);

const preroll = `

@@@@@@            .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@     @@@@@@@@@@@@@@@      
@@@@@@@@,               /@@@.                        @@@(                 
@@@@  @@@@#             /@@@.                        @@@(                 
@@@@    @@@@@@@@@       /@@@.     @@@@@@@@@@@&       @@@(                 
@@@@      @@@@@         /@@@.                        @@@(                 
(@@@        %           /@@@.                        @@@(                 
  .@                    /@@@.     @@@@@@@@@@@@@      @@@@@@@@@@@@@@@/     

`;

async function simulateWrite(str, ms = 24) {
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

function print(str) {
    const lines = str.split("\n");
    for (let line of lines) {
        terminal.write(line);
        terminal.write('\n');
    }
}

function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    })
}

setTimeout(async () => {
    await print(preroll);
    await sleep(200);
    await simulateWrite("Starting up", 24);
    await simulateWrite("... ", 2);
    await print("[OK]");
    await sleep(200);
    await simulateWrite("Starting Chat Interface\0.\0.\0.", 24);
    await simulateWrite("\0\0\0\0", 12);

    ws = new WebSocket(`wss://luckydye.de:8080/`);

    ws.onopen = function (event) {
        print('\nConnection established.');
        simulateWrite("\n> \t", 0);
    };

    ws.onmessage = function incoming(msg) {
        const str = "User: " + msg.data + "\n";
        terminal.append(terminal.cursor[1], str);
    };

    terminal.addEventListener('submit', e => {
        ws.send(e.value);
    });

}, 500);
