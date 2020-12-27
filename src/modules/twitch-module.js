import {
    setConsole,
    getUserByLogin,
    getUserFollowers,
    getChannelViewerOverlap,
    getStreamsByUser,
    getVODsByUser,
    queryClipsByStreamId,
    getChannelAllFollowers
} from './services/twitch.js';

const commands = {

    // brute force clip assets by *Stream* id
    async streamClips(args) {
        if(args[0]) {
            return await queryClipsByStreamId(args[0]);
        } else {
            return "Provide twitch login name.";
        }
    },

    // get first 100 vods by user login
    async vod(args) {
        if(args[0]) {
            return await getVODsByUser(args[0]);
        } else {
            return "Provide twitch login name.";
        }
    },

    // get stream info by user login
    async stream(args) {
        if(args[0]) {
            return await getStreamsByUser(args[0]);
        } else {
            return "Provide twitch login name.";
        }
    },

    // get user info by user login
    async user(args) {
        if(args[0]) {
            const userInfo = await getUserByLogin(args[0]);
            return userInfo.data[0];
        } else {
            return "Provide twitch login name.";
        }
    },

    // see following channels by user login
    following(args) {
        if(args[0]) {
            getUserFollowers(args[0]);
        } else {
            return "Provide twitch login name!";
        }
    },

    // see all followers of a user login
    followers(args) {
        if(args[0]) {
            getChannelAllFollowers(args[0]);
        } else {
            return "Provide twitch login name!";
        }
    },

    // compare viewrship by two user logins
    viewership(args) {
        if(args[0] && args[1]) {
            getChannelViewerOverlap(args[0], args[1]);
        } else {
            return "Provide twitch login name!";
        }
    }

}

let Console;

export default class TwitchModule extends ConsoleModule {
    
    static get moduleName() {
        return "twitch-module";
    }
    
    static get commandName() {
        return "twitch";
    }
    
    static install(cnsl) {
        Console = cnsl;
    }

    static async run(arguemnts) {
        setConsole(Console);
        const command = arguemnts[0];
        const args = arguemnts.slice(1);

        if(command in commands) {
            const output = await commands[command](args);
            if(output) {
                Console.print(output);
            }
        } else {
            Console.print('Unknown command');
            Console.print(`Commands: ${Object.keys(commands)}`);
        }
    }

}