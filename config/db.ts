const username: string = "";
const password: string = "";
const MongoUri: string = "";
const offlineMode: boolean = false;

/**
 * When app is started, ask username and password. When is logged, save into current module the username, password and MongoUri
 */
module.exports = {
    username: username,
    password: password,
    MongoUri: MongoUri,
    offlineMode: offlineMode

};