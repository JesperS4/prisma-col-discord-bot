const discord = require('discord.js')
const mysql = require('mysql')
const config = require('./botconfig.json')


const client = new discord.Client()


const Functions = {}
const Data = {}

var connection;

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

        console.log(Data)
    })
}

Functions.updateTicketCount = () => {
    const ticketCount = Object.keys(Data).length;    
    client.user.setActivity({name: `${ticketCount} orders`, type: "WATCHING"})
    console.log("[DEBUG] UPDATED ACTIVITY")
}

client.on("ready", async () => {
    await Functions.startUp();
    await Functions.setupData();
})


client.login(config.token)

