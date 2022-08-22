const discord = require("discord.js")

module.exports.run = async(bot, message, args) =>{

    const noPermsEmbed = new discord.MessageEmbed()
    .setTitle("Geen permission")
    .setDescription("Je hebt geen permissie tot dit commando!")
    .setFooter("Prisma Scripts ©")
    .setTimestamp()

    if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(noPermsEmbed)




}

module.exports.help = {
    name: "ban"
}