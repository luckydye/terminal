const BORDER_PADDING = [32, 32];
const CURSOR_OFFSET = [1, 0];
const FONT_SIZE = 13;
const FONT_WEIGHT = 300;
const FONT_COLOR = '#99d0f7';
const CURSOR_HEIGHT = 16;
const CURSOR_WIDTH = 6;
const VALID_CHARS = " =<>^abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ()[]-.,_:;#+'*/&%$§!?€1234567890";
const LINE_PADDING = 3;

let CHAR_WIDTH = 7.69;
let CHAR_HEIGHT = 12;

let canvas, context;
let buffer = [
    "Terminal Version 1.0",
    "(c) 2020 luckydye. All rights reserved.",
    "",
];
let hiddenBuffer = [];
let cursor = [
    buffer[buffer.length-1].length, 
    buffer.length - 1
];
let view = [0, 0];
let prefix = "";
let inputEnabled = true;
let hideOutput = false;

class SubmitEvent extends Event {
    constructor(value) {
        super('submit');
        this.value = value;
    }
}

export default class Terminal extends HTMLElement {

    get hideOutput() {
        return hideOutput;
    }

    set hideOutput(v) {
        hideOutput = v;
    }

    get inputEnabled() {
        return inputEnabled;
    }

    set inputEnabled(v) {
        inputEnabled = v;
    }

    get prefix() {
        return prefix;
    }
    
    set prefix(v) {
        prefix = v;
    }

    get cursor() {
        return cursor;
    }

    constructor() {
        super();

        canvas = document.createElement('canvas');
        context = canvas.getContext("2d");

        window.addEventListener('resize', e => {
            this.reformat();
        })

        window.addEventListener('keydown', e => {
            this.handleInput(e);
        })

        this.attachShadow({ mode: 'open' });
    }

    init() {
        const style = document.createElement('style');
        style.innerHTML = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            canvas {
                filter: contrast(1.1) blur(.33px);
            }
        `;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.appendChild(canvas);
    
        this.loop();
    }

    connectedCallback() {
        if(!canvas.parentNode) {
            this.init();
        }
        this.reformat();
    }

    append(index, line) {
        const temp = buffer.slice(0, index);
        temp.push(line);
        temp.push(...buffer.slice(index));

        if(cursor[1] >= index) {
            cursor[1]++;
        }

        this.setBuffer(temp);
    }

    setBuffer(newBuffer) {
        buffer = newBuffer;
    }

    clear() {
        buffer = [""];
        this.setCursor(0, 0);
    }

    setCursor(x, y) {
        cursor[0] = x != null ? x : cursor[0];
        cursor[1] = y != null ? y : cursor[1];
    }

    setPrefix(str = "") {
        this.prefix = str;
    }

    disableInput() {
        this.inputEnabled = false;
    }

    enableInput() {
        this.inputEnabled = true;
    }

    handleSubmit(line) {
        if(hideOutput) {
            line = hiddenBuffer.join("");
            hideOutput = false;
        } else {
            line = line.slice(this.prefix.length);
        }
        this.dispatchEvent(new SubmitEvent(line));
        this.write(this.prefix);
    }

    read() {
        const currLine = buffer[buffer.length-1];
        this.inputEnabled = true;
        this.prefix = currLine;
    }

    newline() {
        const newLine = "";
        const currLine = buffer[buffer.length-1];
        buffer.push(newLine);
        cursor[0] = newLine.length;
        cursor[1]++;
        return currLine;
    }

    write(str) {
        switch(str) {
            case "\0":
                    // nothing (sleep)
                break;
            case "\t":
                    this.read();
                break;
            case "\r":
                    const currLine = this.newline();
                    this.handleSubmit(currLine);
                break;
            case "\n":
                    this.newline();
                break;
            default:
                const text = context.measureText("M");
                CHAR_WIDTH = text.width;
            
                const temp = buffer[cursor[1]].split("").slice(0, cursor[0]);

                if(hideOutput) {
                    hiddenBuffer.push(str);
                    temp.push(...(new Array(str.length).fill("*")));
                } else {
                    temp.push(str);
                }
        
                const tail = buffer[cursor[1]].split("").slice(cursor[0]);
                temp.push(...tail);
                buffer[cursor[1]] = temp.join("");
                cursor[0] += str.length;
        }
    }

    handleInput(e) {
        if(!inputEnabled) return;
        let key = e.key;
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey;

        if(key == "Enter") {
            this.write('\r');
        }
        if(key == "ArrowLeft") {
            cursor[0] = Math.max(cursor[0]-1, 0);
        }
        if(key == "ArrowRight") {
            cursor[0] = Math.min(cursor[0]+1, buffer[buffer.length-1].length);
        }
        if(key == "End") {
            cursor[0] = buffer[buffer.length-1].length;
        }
        if(key == "Home") {
            cursor[0] = 0;
        }
        if(key == "Backspace") {
            if(cursor[0] > 0 && cursor[0] > prefix.length) {
                const temp = buffer[buffer.length-1].split("").slice(0, cursor[0]-1);
                const tail = buffer[buffer.length-1].split("").slice(cursor[0]);
                temp.push(...tail);
                buffer[buffer.length-1] = temp.join("");
                cursor[0]--;
            }
        }
        if(key == "Delete") {
            const temp = buffer[buffer.length-1].split("").slice(0, cursor[0]);
            const tail = buffer[buffer.length-1].split("").slice(cursor[0]+1);
            temp.push(...tail);
            buffer[buffer.length-1] = temp.join("");
        }

        if(VALID_CHARS.indexOf(key) != -1 && !ctrl) {
            this.write(key);
        }

        if(ctrl) {
            // ctrl binds
        }
    }

    reformat() {
        canvas.width = this.clientWidth;
        canvas.height = this.clientHeight;
    }

    draw(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.font = `${FONT_WEIGHT} ${FONT_SIZE}px monospace`;
        context.textAlign = 'left';
        context.textBaseline = 'top';

        context.shadowColor = FONT_COLOR;
        context.shadowBlur = 12;
        
        context.fillStyle = FONT_COLOR;

        this.drawBuffer();

        if(inputEnabled) {
            this.drawCursor();
        }
    }

    drawCursor() {
        const ts = Date.now() / 500;

        if(ts % 2 > 1) {
            const lineHeight = CHAR_HEIGHT + LINE_PADDING;
            const x = BORDER_PADDING[0] + (cursor[0] * CHAR_WIDTH);
            const y = BORDER_PADDING[1] + (cursor[1] * CHAR_HEIGHT) + (cursor[1] * LINE_PADDING) + (CHAR_HEIGHT / 2) - (CURSOR_HEIGHT / 2) - view[1];

            context.fillStyle = FONT_COLOR;
            context.fillRect(x + CURSOR_OFFSET[0], y + CURSOR_OFFSET[1], CURSOR_WIDTH, CURSOR_HEIGHT);
        }
    }

    drawBuffer() {
        const lineHeight = CHAR_HEIGHT + LINE_PADDING;
        const cursorY = BORDER_PADDING[1] + (cursor[1] * CHAR_HEIGHT) + (cursor[1] * LINE_PADDING);
        view[1] = Math.max(0, cursorY - (canvas.height - (lineHeight * 2)));

        let index = 0;
        for(let line of buffer) {
            const x = BORDER_PADDING[0];
            const y = BORDER_PADDING[1] + (index * CHAR_HEIGHT) + (index * LINE_PADDING) - view[1];

            context.fillText(line, x, y);
            index++;
        }
    }

    loop() {
        this.draw(context);
        requestAnimationFrame(this.loop.bind(this));
    }

}

customElements.define('gyro-terminal', Terminal);
