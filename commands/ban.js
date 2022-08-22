const discord = require("discord.js")

module.exports.run = async(bot, message, args) =>{
    try {
        const noPermsEmbed = new discord.MessageEmbed()
        .setTitle("Geen permission")
        .setDescription("Je hebt geen permissie tot dit commando!")
        .setFooter("Prisma Scripts ©")
        .setTimestamp()

    
        if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send(noPermsEmbed)
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!args[0]) return message.channel.send('Kan de gebruiker niet vinden, `bericht wordt automatisch verwijderd in 2 seconden`').then(x => {
            setTimeout(() => {
                x.delete()
            }, 2000 )
        });
    
        if(!member) return message.channel.send('Kan de gebruiker niet vinden, `bericht wordt automatisch verwijderd in 2 seconden`').then(x => {
            setTimeout(() => {
                x.delete()
            }, 2000 )
        });
    
        if(!member.bannable) return message.channel.send('Ik kan deze member niet eens bannen, `bericht wordt automatisch verwijderd in 2 seconden`').then(x => {
            setTimeout(() => {
                x.delete()
            }, 2000 )
        });;
    
        let reason = args.slice(1).join(" ") ? args.slice(1).join(" ") : "Geen reden";
    
        member.ban(reason)

        const banEmbed = new discord.MessageEmbed()
        .setTitle("Succesvol gebanned")
        .setDescription("Je hebt " + member + " succesvol gebanned, met de reden: " + reason + ".")
        .setFooter("Prisma Scripts ©")
        .setTimestamp()
    

    } catch(e) {
        return message.channel.send("Er is een error, error: `"+e+"`")
    }



}

module.exports.help = {
    name: "ban"
}