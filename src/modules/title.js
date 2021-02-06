export default {
    moduleName: "title",
    commandName: "title",
    install() {},
    run(arguemnts) {
        const newTitle = arguemnts.join(" ");
        document.title = newTitle;
    }
}