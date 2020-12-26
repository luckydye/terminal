const BORDER_PADDING = [32, 32];
const CURSOR_OFFSET = [1, 0];
const FONT_SIZE = 13;
const FONT_WEIGHT = 300;
const FONT_COLOR = '#99d0f7';
const CURSOR_HEIGHT = 16;
const CURSOR_WIDTH = 6;
const VALID_CHARS = ` ~{}=<>^abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ()[]-.,_:;#+'*/&%$§!?€1234567890"`;
const LINE_PADDING = 3;

let LINE_WRAPPING = true;
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
let history = [];
let historyCursor = -1;

class SubmitEvent extends Event {
    constructor(value) {
        super('submit');
        this.value = value;
    }
}

class ShortcutEvent extends Event {

    get defaultPrevented() {
        return this._defaultPrevented;
    }

    set defaultPrevented(v) {
        this._defaultPrevented = v;
    }

    constructor(key) {
        super('shortcut');
        this.key = key;
        this._defaultPrevented = false;
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
        canvas.tabIndex = 0;
        context = canvas.getContext("2d");

        window.addEventListener('resize', e => {
            this.reformat();
        })

        window.addEventListener('wheel', e => {
            const dir = Math.sign(e.deltaY);
            const lineHeight = CHAR_HEIGHT + LINE_PADDING;

            const cursorY = this.getCursorPosition()[1];
            const maxY = Math.max(0, cursorY - (canvas.height - (lineHeight * 3)));

            view[1] = Math.max(0, Math.min(maxY, view[1] + dir * lineHeight));
        });

        window.addEventListener('keydown', e => {
            this.handleInput(e);
        })

        this.attachShadow({ mode: 'open' });
    }

    getContext() {
        return context;
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
                outline: none;
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

    disableLineWrapping() {
        LINE_WRAPPING = false;
    }

    enableLineWrapping() {
        LINE_WRAPPING = true;
    }

    handleSubmit(line) {
        if(hideOutput) {
            line = hiddenBuffer.join("");
            hideOutput = false;
        } else {
            line = line.slice(this.prefix.length);
        }
        this.pushToHistory(line);
        this.dispatchEvent(new SubmitEvent(line));
    }

    pushToHistory(input) {
        if(input != "") {
            history.unshift(input);
        }
        historyCursor = -1;
    }

    cancelInput() {
        buffer[cursor[1]] = this.prefix;
        this.setCursor(buffer[cursor[1]].length);
    }

    replaceInput(str) {
        this.cancelInput();
        this.write(str);
    }

    read(newPrefix) {
        return new Promise((resolve) => {
            const currLine = buffer[buffer.length-1];
            this.inputEnabled = true;
            this.prefix = newPrefix || currLine;
            if(newPrefix && currLine !== newPrefix) {
                this.write(newPrefix);
            }

            const submitCallback = e => {
                resolve(e.value);
                this.removeEventListener('submit', submitCallback);
            }
            this.addEventListener('submit', submitCallback);
        })
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
            case "\r":
                    const currLine = this.newline();
                    this.handleSubmit(currLine);
                break;
            case "\n":
                    this.newline();
                break;
            default:
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

        const lineHeight = CHAR_HEIGHT + LINE_PADDING;
        const cursorY = this.getCursorPosition()[1];
        view[1] = Math.max(0, cursorY - (canvas.height - (lineHeight * 3)));
    }

    handleInput(e) {
        let key = e.key;
        const shift = e.shiftKey;
        const ctrl = e.ctrlKey;

        if(inputEnabled) {
            if(key == "Enter") {
                this.write('\r');
            }
            if(key == "ArrowUp") {
                historyCursor = Math.min(historyCursor + 1, history.length-1);
                if(history[historyCursor]) {
                    this.replaceInput(history[historyCursor]);
                }
            }
            if(key == "ArrowDown") {
                historyCursor = Math.max(historyCursor - 1, 0);
                if(history[historyCursor]) {
                    this.replaceInput(history[historyCursor]);
                }
            }
            if(key == "ArrowLeft") {
                cursor[0] = Math.max(cursor[0]-1, Math.max(prefix.length, 0));
            }
            if(key == "ArrowRight") {
                cursor[0] = Math.min(cursor[0]+1, buffer[buffer.length-1].length);
            }
            if(key == "Escape") {
                this.cancelInput();
            }
            if(key == "End") {
                cursor[0] = buffer[buffer.length-1].length;
            }
            if(key == "Home") {
                cursor[0] = Math.max(prefix.length, 0);
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
        }

        if(ctrl) {
            const ev = new ShortcutEvent(key);
            const canceled = this.dispatchEvent(ev);

            e.preventDefault();
            e.stopPropagation();

            if(!ev.defaultPrevented) {
                if(VALID_CHARS.indexOf(key) != -1) {
                    this.dispatchEvent(new SubmitEvent("^" + key));
                }
            }
        }
    }

    reformat() {
        canvas.width = this.clientWidth;
        canvas.height = this.clientHeight;

        const lineHeight = CHAR_HEIGHT + LINE_PADDING;
        const cursorY = this.getCursorPosition()[1];
        view[1] = Math.max(0, cursorY - (canvas.height - (lineHeight * 3)));
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

        if(this.inputEnabled) {
            this.drawCursor();
        }

        context.shadowColor = "none";
        context.shadowBlur = 0;
    }

    drawCursor() {
        const ts = Date.now() / 500;

        if(ts % 2 > 1) {
            const pos = this.getCursorPosition();

            context.fillStyle = FONT_COLOR;
            context.fillRect(pos[0], pos[1] - view[1], CURSOR_WIDTH, CURSOR_HEIGHT);
        }
    }

    getMaxBufferWidth() {
        return canvas.width - (BORDER_PADDING[0] * 2);
    }

    getCursorPosition() {
        const text = context.measureText("M");
        CHAR_WIDTH = text.width;

        const max_line_px_length = this.getMaxBufferWidth();

        let posY = 0;
        for(let i = 0; i < cursor[1]; i++) {
            const line = buffer[i];
            const text = context.measureText(line);
            if(max_line_px_length - text.width < 0 && LINE_WRAPPING) {
                const parts = sliceLine(line, max_line_px_length / CHAR_WIDTH);
                for(let part of parts) {
                    posY++;
                }
            } else {
                posY++;
            }
        }

        const lineHeight = CHAR_HEIGHT + LINE_PADDING;
        const x = BORDER_PADDING[0] + (cursor[0] * CHAR_WIDTH);
        const y = BORDER_PADDING[1] + (posY * CHAR_HEIGHT) + (posY * LINE_PADDING) + (CHAR_HEIGHT / 2) - (CURSOR_HEIGHT / 2);

        return [x + CURSOR_OFFSET[0], y + CURSOR_OFFSET[1]];
    }

    drawBuffer() {
        const max_line_px_length = this.getMaxBufferWidth();

        let x = BORDER_PADDING[0];
        let y = BORDER_PADDING[1] - view[1];

        const drawLine = (line) => {
            context.fillText(line, x, y);
            y += CHAR_HEIGHT + LINE_PADDING;
        }

        for(let line of buffer) {
            const text = context.measureText(line);
            if(max_line_px_length - text.width < 0 && LINE_WRAPPING) {
                const parts = sliceLine(line, max_line_px_length / CHAR_WIDTH);
                for(let part of parts) {
                    drawLine(part);
                }
            } else {
                drawLine(line);
            }
        }
    }

    loop() {
        this.draw(context);
        requestAnimationFrame(this.loop.bind(this));
    }

}

function sliceLine(line, maxLength) {
    const parts = [];

    line = line.split("");

    while(line.length > maxLength) {
        const temp = line.splice(0, maxLength);
        parts.push(temp.join(""));
    }
    parts.push(line.join(""));

    return parts;
}

customElements.define('gyro-terminal', Terminal);
