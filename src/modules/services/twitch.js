const API_CLIENT_ID = localStorage.twitch_client_id;
const API_CLIENT_SECRET = localStorage.twitch_client_secret;
const API_AUTH_SCOPES = ``;

let api_credentials = null;

function auth() {
    console.log('authorizing...');
    const url = `https://id.twitch.tv/oauth2/token?client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}&grant_type=client_credentials&scope=${API_AUTH_SCOPES}`;
    return fetch(url, { method: "POST" }).then(res => res.json()).then(json => {
        return api_credentials = json;
    })
}

async function fetchApi(url, options = {}) {
    const opt = Object.assign({ 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_credentials.access_token}`,
            'Client-ID': API_CLIENT_ID
        }
    }, options);
    return await fetch(url, opt).then(res => res.json());
}

async function getUserByLogin(user) {
    if(!api_credentials) {
        await auth();
    }
    const url = `https://api.twitch.tv/helix/users?login=${user}`;
    return fetchApi(url).then(json => {
        if(json.data.length == 0) {
            throw new Error('User not found');
        }
        return json;
    })
}

async function getStreamsByUser(user) {
    if(!api_credentials) {
        await auth();
    }

    const url = `https://api.twitch.tv/helix/streams?user_login=${user}`;

    return fetchApi(url).then(async json => {
        return json.data[0];
    });
}

async function queryClipsByStreamId(streamId) {
    let offset = 0;

    while(offset < 5910) {
        offset++;

        const url = `https://clips-media-assets2.twitch.tv/${streamId}-offset-${offset}.mp4`;

        await fetch(url).then(res => {
            console.log(url, res.status);
            // if(res.status != 403) {
            // }
        });
    }

    return streamId;
}

async function getVODsByUser(userlogin) {
    if(!api_credentials) {
        await auth();
    }

    const userInfo = await getUserByLogin(userlogin);
    const user = userInfo.data[0];
    const url = `https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=100`;

    return fetchApi(url).then(async json => {
        return json.data;
    });
}

async function getUserFollowers(userName) {
    const userInfo = await getUserByLogin(userName);

    const user = userInfo.data[0];

    async function getFollowerChunk(cursor) {
        let url = `https://api.twitch.tv/helix/users/follows?from_id=${user.id}&first=100`;

        if(cursor) {
            url += `&after=${cursor}`;
        }

        return await fetchApi(url);
    }

    const followersTotal = [];

    async function getAllFollowers(cursor) {
        const followers = await getFollowerChunk(cursor);

        followersTotal.push(...followers.data);

        if(followers.pagination.cursor) {
            await getAllFollowers(followers.pagination.cursor);
        }
    }

    await getAllFollowers();

    console.log(`${user.display_name} is following (${followersTotal.length}):`);

    for(let user of followersTotal) {
        console.log(`${user.followed_at}, ${user.to_name}`);
    }
}

async function getChannelFollowers(channel) {
    
    // fetch to cache
    const userInfo = await getUserByLogin(channel);
    const user = userInfo.data[0];

    async function getFollowerChunk(cursor) {
        let url = `https://api.twitch.tv/helix/users/follows?to_id=${user.id}&first=100`;

        if(cursor) {
            url += `&after=${cursor}`;
        }

        return await fetchApi(url);
    }

    const followersTotal = [];

    async function getAllFollowers(cursor) {
        const followers = await getFollowerChunk(cursor);

        console.log(`${followersTotal.length} / ${followers.total}`);

        followersTotal.push(...followers.data);

        if(followers.pagination.cursor) {
            await getAllFollowers(followers.pagination.cursor);
        }
    }

    console.log(`Fethcing ${channel} followers,`);
    await getAllFollowers();

    return followersTotal;
}

async function getChannelViewerOverlap(channel1, channel2) {
    console.log(`Getting channel follower overlap of ${channel1} and ${channel2}`);

    const followers1 = await getChannelFollowers(channel1);
    const followers2 = await getChannelFollowers(channel2);

    const hashmap = {};
    let overlap = 0;

    for(let follower of followers1) {
        hashmap[follower.from_id] = 0;
    }
    for(let follower of followers2) {
        if(hashmap[follower.from_id] != null) {
            overlap++;
            hashmap[follower.from_id] = 1;
        }
        hashmap[follower.from_id] = 0;
    }

    console.log(`${overlap} of ${channel1}(${followers1.length}) [${(overlap / followers1.length * 100).toFixed(3)}%] are also in ${channel2}`);

    return overlap / followers1.length * 100;
}

async function getChannelAllFollowers(channel) {
    console.log('Getting channel followers...');

    const followers = await getChannelFollowers(channel);

    for(let user of followers) {
        console.log(`${user.followed_at}, ${user.from_name}`);
    }
}

module.exports = {
    getUserByLogin,
    getUserFollowers,
    getChannelViewerOverlap,
    getStreamsByUser,
    queryClipsByStreamId,
    getVODsByUser,
    getChannelAllFollowers
}
