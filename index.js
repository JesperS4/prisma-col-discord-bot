const discord = require('discord.js')
const mysql = require('mysql')
const fs = require("fs");
const config = require('./botconfig.json')



const client = new discord.Client()


const Functions = {}
const Data = {}


// variables where we can callback on later
var connection;
var ticketMessage;


client.commands = new discord.Collection();




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

Functions.isChannelValid = (name, reaction) => {
    let retval = false
    reaction.message.guild.channels.cache.forEach((channel) => {
        if (channel.name == name) {
            retval = true
        } 
    })
    return retval
}


Functions.addToOrderQueue = (user, channel) => {
    const ticketCount = (Object.keys(Data).length + 1);   
    
    
    var query = connection.query('INSERT INTO customorders (discordid, channelid, position) VALUES(?,?,?)', [user.id, channel.id, ticketCount]);


    Data[user.id] = {
        discordID: user.id,
        channelID: channel.id,
        position: ticketCount
    }


    return ticketCount;

}

Functions.createTicketChannel = async (type, reaction, user) => {
    if (type === 'custom_order') {

        const channelName = `order-${user.username.toLowerCase()}-${user.discriminator}`
        let isChannelValid = Functions.isChannelValid(channelName, reaction);
        if (isChannelValid) return;

        reaction.message.guild.channels.create(channelName, { parent: config.order_category})
        .then(async x => {
            const sr = reaction.message.guild.roles.cache.find(role => role.id === "1010912090413867038")
            const everyone = reaction.message.guild.roles.cache.find(role => role.name === '@everyone')
            x.updateOverwrite(sr, {
              SEND_MESSAGES: true,
              VIEW_CHANNEL: true,
            });
            x.updateOverwrite(everyone, {
              SEND_MESSAGES: false,
              VIEW_CHANNEL: false,
            });
            x.updateOverwrite(reaction.message.author, {
              SEND_MESSAGES: true,
              VIEW_CHANNEL: true,
            });


            const position = await Functions.addToOrderQueue(user, x)

            const embed = new discord.MessageEmbed()
            .setTitle("Nieuwe order")
            .setDescription("Bedankt voor je nieuwe order aanvraag, leg duidelijk uit wat je wilt laten maken. Hierna bespreken wij de prijs. Mocht er akkoord zijn over de prijs wordt het eerst betaald voor dat wij hier aan werken.")
            .addField("Wachtrij posititie", "Op dit moment sta je `"+position+"` in de wachtrij, je krijgt een update wanneer je een plek bent opgeschroven.")
            .setFooter("Prisma Scripts ©")
            .setTimestamp()


            x.send(embed)
        })
    } else if (type === 'question') {
        const channelName = `vraag-${user.username.toLowerCase()}-${user.discriminator}`
        let isChannelValid = Functions.isChannelValid(channelName, reaction);
        if (isChannelValid) return;

        reaction.message.guild.channels.create(channelName, { parent: config.support_category})
        .then(async x => {
            const sr = reaction.message.guild.roles.cache.find(role => role.id === "1010912090413867038")
            const everyone = reaction.message.guild.roles.cache.find(role => role.name === '@everyone')
            x.updateOverwrite(sr, {
              SEND_MESSAGES: true,
              VIEW_CHANNEL: true,
            });
            x.updateOverwrite(everyone, {
              SEND_MESSAGES: false,
              VIEW_CHANNEL: false,
            });
            x.updateOverwrite(reaction.message.author, {
              SEND_MESSAGES: true,
              VIEW_CHANNEL: true,
            });

            const embed = new discord.MessageEmbed()
            .setTitle("Nieuwe vraag")
            .setDescription("Stel je vraag hieronder, er zou zo snel mogelijk worden gereageerd. Alvast bedankt voor het wachten!")
            .setFooter("Prisma Scripts ©")
            .setTimestamp()


            x.send(embed)
        })
    }
}

client.on("ready", async () => {
    await Functions.startUp();
    await Functions.setupData();
    await Functions.setupEmbed();
})

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch(); 
    if (reaction.partial) await reaction.fetch();

    if (user.bot) return; 
    if (!reaction.message.guild) return;

    if (reaction.message.channel.id !== config.ticket_channel) return;

    if (reaction.emoji.name === "❓") {
        Functions.createTicketChannel('question', reaction, user)
    } else if (reaction.emoji.name === "🔔") {
        Functions.createTicketChannel('custom_order', reaction, user)
    }   
})



client.on("message", async message => {

    if (message.author.bot) return;

    if (message.channel.type === "dm") return;

    var prefix = "!";

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var commands = client.commands.get(command.slice(prefix.length));

    var arguments = messageArray.slice(1);

    if (commands) commands.run(client, message, arguments);
})

fs.readdir("./commands", (err, files) => {


    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if (jsFiles.length <= 0) {
        console.log("Geen files in de command handler gevonden!");
        return;
    }

    jsFiles.forEach((f, i) => {

        var fileGet = require(`./commands/${f}`);
        console.log(`Command handler heeft ${f} geladen!`);
        client.commands.set(fileGet.help.name, fileGet);

    })


});




client.login(config.token)

