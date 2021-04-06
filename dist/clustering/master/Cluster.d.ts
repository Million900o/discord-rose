import { Master } from './Master';
import { ThreadComms } from '../ThreadComms';
import { APIGuild, Snowflake } from 'discord-api-types';
/**
 * Cluster utility for working with the thread from the master process
 */
export declare class Cluster extends ThreadComms {
    id: string;
    master: Master;
    fileName: string;
    custom: boolean;
    private thread?;
    /**
     * Whether or not the Cluster has started before
     * @type {boolean}
     */
    started: boolean;
    /**
     * Whether or not the Cluster shouldn't restart
     * @type {boolean}
     */
    dying: boolean;
    constructor(id: string, master: Master, fileName?: string, custom?: boolean);
    spawn(): Promise<void>;
    start(): Promise<{} | undefined>;
    logAs(msg: string): void;
    /**
     * Restarts the cluster
     */
    restart(): void;
    /**
     * Kills cluster without restarting
     */
    kill(): void;
    /**
     * Restarts a shard
     * @param {number} id ID of shard to restart
     */
    restartShard(id: number): void;
    /**
     * Gets a guild from the clusters cache
     * @param {Snowflake} id ID of guild
     */
    getGuild(id: Snowflake): Promise<APIGuild>;
    /**
     * Evals code on the cluster
     * @param {string} code Code to eval
     */
    eval(code: string): Promise<any[]>;
}
