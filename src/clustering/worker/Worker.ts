import { BotOptions } from '../master/Master'
import { Thread } from './Thread'

import { DiscordEventMap, CachedGuild } from '../../typings/Discord'
import { EventEmitter } from 'events'
import Collection from '@discordjs/collection'

import { Shard } from '../../socket/Shard'
import { CacheManager } from '../../socket/CacheManager'

import { APIUser, Snowflake } from 'discord-api-types'

import { CommandHandler } from '../../structures/CommandHandler'

import { RestManager } from '../../rest/Manager'

export default class Worker extends EventEmitter {
  on: <K extends keyof DiscordEventMap>(event: K, listener?: (data:  DiscordEventMap[K]) => void) => this

  once: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  emit: <K extends keyof DiscordEventMap>(event: K, data: DiscordEventMap[K]) => boolean

  off: <K extends keyof DiscordEventMap>(event: K, listener?: (data: DiscordEventMap[K]) => void) => this

  removeAllListeners: <K extends keyof DiscordEventMap>(event?: K) => this

  public options: BotOptions
  public shards: Collection<number, Shard> = new Collection()

  public api: RestManager
  public commands = new CommandHandler(this)
  public comms: Thread = new Thread(this)

  public guilds: Collection<Snowflake, CachedGuild>
  public guildRoles: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>>
  public channels: Collection<Snowflake, DiscordEventMap['CHANNEL_CREATE']>
  public selfMember: Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>
  public members: Collection<Snowflake, Collection<Snowflake, DiscordEventMap['GUILD_MEMBER_ADD']>>

  public user: APIUser

  public cacheManager: CacheManager

  async start (shardNumbers: number[]) {
    this.api = new RestManager(this.options.token)
    this.cacheManager = new CacheManager(this)

    for (let i = 0; i < shardNumbers.length; i++) {
      const shard = new Shard(shardNumbers[i], this)
      this.shards.set(shardNumbers[i], shard)
      await shard.register()
    }
  }

  log (data: string) {
    this.comms.tell('LOG', data)
  }
}