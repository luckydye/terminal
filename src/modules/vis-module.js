let Console;

export default class VisModule extends ConsoleModule {

    static get moduleName() {
        return "vis-module";
    }

    static get commandName() {
        return "vis";
    }

    static install(cnsl) {
        Console = cnsl;
    }

    static run(args) {
        return new Promise((resolve) => {

            const ele = document.createElement('div');
            ele.className = "sidemodule";
            const style = document.createElement('style');
            style.innerHTML = `
            .sidemodule {
                width: 50%;
                height: 100%;
            }
            gyro-terminal {
                width: 50%;
            }
            iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            `;
            mainEle.appendChild(ele);
            ele.innerHTML = `
                <iframe src="https://vsource-viewer.web.app/"/>
            `;
            ele.appendChild(style);
            
            resolve();
        });
    }

}