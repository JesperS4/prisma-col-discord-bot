const discord = require('discord.js')
const mysql = require('mysql')
const config = require('./botconfig.json')



const client = new discord.Client()


const Functions = {}
const Data = {}


// variables where we can callback on later
var connection;
var ticketMessage;

Functions.startUp = async () => {
    console.log("[DEBUG] BOT STARTING UP")
    const ticketCount = Object.keys(Data).length; 
    client.user.setActivity({name: `${ticketCount} orders`, type: "WATCHING"})

    
    connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'bot'
    });

    await connection.connect( () => {
        console.log("[DEBUG] DATABASE CONNECTED")
    });



    return;
}

Functions.setupData = async () => {
    connection.query('SELECT * FROM customorders', (error, results, fields) => {
        if (error) throw error;
        
        results.forEach( (v) => {
            Data[v.discordid] = {
                discordID: v.discordid,
                channelID: v.channelid,
                position: v.position
            }
        })
        return;
    })
}

Functions.setupEmbed = async () => {
    const ticketChannel = config.ticket_channel
    try {
        client.channels.cache.get(ticketChannel).fetch().then(message => {
            if (message.lastMessageID) {
                client.channels.cache.get(ticketChannel).messages.fetch(message.lastMessageID).then(message => message.delete())
            }
        })
    
    
        const ticketCount = Object.keys(Data).length;    
        const embed = new discord.MessageEmbed()
        .setThumbnail("https://cdn.discordapp.com/attachments/979775171680411648/1011224875962216468/logojesperzondertext2.0.png")
        .setTitle("Tickets / Orders")
        .setDescription("Op dit moment zijn er `" + ticketCount + "` aantal custom orders, dat betekend dat jij op plek `" + (ticketCount + 1) + "` komt zonder enige queue skips.")
        .addField("Vragen over een script?", "Druk dan op `❓` stel netjes je vraag en we gaan je zo spoedig mogelijk helpen.")
        .addField("Custom order aanvragen?", "Dit kan bij ons zeker, voor een goede betaalbare prijs en snelle levering. Om een custom-order-ticket aan het maken druk dan op `🔔`")
        .setFooter("Prisma Scripts ©")
    
        ticketMessage = await client.channels.cache.get(ticketChannel).send(embed);
        ticketMessage.react("❓")
        ticketMessage.react("🔔")
        console.log("[DEBUG] SENDED EMBED")
    } catch (e) {
        console.log(e)
    }


}

Functions.updateTicketCount = () => {
    const ticketCount = Object.keys(Data).length;    
    client.user.setActivity({name: `${ticketCount} orders`, type: "WATCHING"})
    console.log("[DEBUG] UPDATED ACTIVITY")
}

client.on("ready", async () => {
    await Functions.startUp();
    await Functions.setupData();
    await Functions.setupEmbed();
})

client.on("messageReactionAdd", (reaction) => {

})



client.login(config.token)

