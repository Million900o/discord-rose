"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
// caches
const guilds_1 = require("./cache/guilds");
const defaults_1 = require("./cache/defaults");
const roles_1 = require("./cache/roles");
const channels_1 = require("./cache/channels");
const self_1 = require("./cache/self");
const members_1 = require("./cache/members");
const users_1 = require("./cache/users");
const Emitter_1 = require("../utils/Emitter");
const createNulledCollection = (cache) => {
    return new Proxy(() => { }, {
        get() {
            throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`);
        },
        apply() {
            throw new Error(`CachingOptions.${cache} is disabled so this cache cannot be accessed`);
        }
    });
};
/**
 * Utility for managing and ruling cache and it's subsequent control
 */
class CacheManager extends Emitter_1.Emitter {
    constructor(worker) {
        super();
        this.worker = worker;
        this.worker.on('*', (data) => {
            this.emit(data.t, data.d);
        });
        const cache = this.worker.options.cache;
        defaults_1.defaults(this, this.worker);
        if (cache.guilds)
            guilds_1.guilds(this, this.worker);
        else
            worker.guilds = createNulledCollection('guilds');
        if (cache.roles)
            roles_1.roles(this, this.worker);
        else
            worker.guildRoles = createNulledCollection('roles');
        if (cache.channels)
            channels_1.channels(this, this.worker);
        else
            worker.channels = createNulledCollection('channels');
        if (cache.self)
            self_1.self(this, this.worker);
        else
            worker.selfMember = createNulledCollection('self');
        if (cache.members)
            members_1.members(this, this.worker);
        else
            worker.members = createNulledCollection('member');
        if (cache.users)
            users_1.users(this, this.worker);
        else
            worker.users = createNulledCollection('users');
    }
}
exports.CacheManager = CacheManager;
