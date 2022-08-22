const discord = require("discord.js")

module.exports.run = async(bot, message, args) =>{
    try {

        if (!message.member.hasPermission("BAN_MEMBERS")) return;


        var index;
        let result = false

        Object.entries(Data).forEach(entry => {
            const [key, value] = entry;

            if (Data[key].channelID === message.channel.id) {
                index = key
                result = true
            }
        })

        if (!result) return message.channel.send("Dit is geen order channel..").then(x => {
            setTimeout(() => {
                x.delete()
            }, 2000 )
        })

        Functions.removePositionAtQueue(Data[index].position, index, message)

        return message.channel.send("Channel wordt verwijderd, `binnen 2 seconden`").then(x => {
            setTimeout(() => {
                message.channel.delete()
            }, 2000 )
        })


    } catch(e) {
        return message.channel.send("Er is een error, error: `"+e+"`")
    }



}

module.exports.help = {
    name: "closeorder"
}