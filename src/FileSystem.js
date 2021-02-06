import Console from "./Console";

const fs = {
    children: []
};
const cd = "/";

export default class FileSystem {

    static get modules() {
        return [
            {
                moduleName: "ls",
                commandName: "ls",
                install() {},
                run(arguemnts) {
                    Console.print(cd);
                    for(let child of fs.children) {
                        Console.print(child);
                    }
                }
            }
        ]
    }

}