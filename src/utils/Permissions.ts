import Collection from '@discordjs/collection'
import { APIGuildMember, APIOverwrite, OverwriteType, Snowflake } from 'discord-api-types'
import { CachedGuild, DiscordEventMap } from '../typings/Discord'

export const bits = {
  createInvites: 0x00000001,
  kick: 0x00000002,
  ban: 0x00000004,
  administrator: 0x00000008,
  manageChannels: 0x00000010,
  manageGuild: 0x00000020,
  addReactions: 0x00000040,
  auditLog: 0x00000080,
  prioritySpeaker: 0x00000100,
  stream: 0x00000200,
  viewChannel: 0x00000400,
  sendMessages: 0x00000800,
  tts: 0x00001000,
  manageMessages: 0x00002000,
  embed: 0x00004000,
  files: 0x00008000,
  readHistory: 0x00010000,
  mentionEveryone: 0x00020000,
  externalEmojis: 0x00040000,
  viewInsights: 0x00080000,
  connect: 0x00100000,
  speak: 0x00200000,
  mute: 0x00400000,
  deafen: 0x00800000,
  move: 0x01000000,
  useVoiceActivity: 0x02000000,
  nickname: 0x04000000,
  manageNicknames: 0x08000000,
  manageRoles: 0x10000000,
  webhooks: 0x20000000,
  emojis: 0x40000000
}

export const PermissionsUtils = {
  bits: bits,

  /**
   * Test a permission on a user
   * @param bit Combined permission
   * @param perm Permission name to test
   * @returns Whether or not the user has permissions
   */
  has (bit: number, perm: keyof typeof bits): boolean {
    return this.hasPerms(bit, bits[perm])
  },

  /**
   * @deprecated
   */
  calculate (member: APIGuildMember, guild: CachedGuild, roleList: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>, required: keyof typeof bits): boolean {
    if (guild.owner_id === member.user?.id) return true
    return this.has(
      member.roles.reduce(
        (a, b) => a | Number(roleList.get(b)?.permissions),
        Number(roleList.get(guild.id)?.permissions)
      ),
      required
    )
  },

  /**
   * Adds multiple permission sources together
   * @param data Data filled with possible permission data
   * @returns Full permission bit
   */
  combine (data: { member: APIGuildMember, guild: CachedGuild, roleList?: Collection<Snowflake, DiscordEventMap['GUILD_ROLE_CREATE']['role']>, overwrites?: APIOverwrite[] }): number {
    if (data.member.user?.id === data.guild.owner_id) return PermissionsUtils.bits.administrator
    let result = data.roleList ? BigInt(data.roleList.get(data.guild.id)?.permissions) : BigInt(0)

    if (data.roleList) {
      data.member.roles.forEach(role => {
        const r = data.roleList?.get(role)
        if (!r) return
        result |= BigInt(r.permissions)
      })
    }

    if (data.overwrites) {
      let allow = BigInt(0)
      let deny = BigInt(0)

      data.overwrites.filter(x => x.type === OverwriteType.Role).forEach(overwrite => {
        if (overwrite.id === data.guild.id) {
          result |= BigInt(overwrite.allow)
          result &= ~BigInt(overwrite.deny)
          return
        }

        if (!data.member.roles.includes(overwrite.id)) return

        allow |= BigInt(overwrite.allow)
        deny |= BigInt(overwrite.deny)
      })

      result |= allow
      result &= ~deny

      data.overwrites.filter(x => x.type === OverwriteType.Member && data.member.user?.id === x.id).forEach(overwrite => {
        result |= BigInt(overwrite.allow)
        result &= ~BigInt(overwrite.deny)
      })
    }

    return Number(result)
  },

  /**
   * Test two bits together
   * @param perms Combined permissions
   * @param bit Number bit ermission to test
   * @returns Whether or not the user has permissions
   */
  hasPerms (perms: number, bit: number): boolean {
    if ((perms & bits.administrator) !== 0) return true // administrator
    if ((perms & bit) !== 0) return true

    return false
  }
}
