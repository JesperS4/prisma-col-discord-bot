const discord = require('discord.js')
const mysql = require('mysql')
const config = require('./botconfig.json')


const client = new discord.Client()


const Functions = {}
const Data = {}

var connection;

Functions.startUp = async () => {
    console.log("[DEBUG] BOT STARTING UP")
    let ticketCount = 0
    client.user.setActivity({name: `${ticketCount} orders`, type: "WATCHING"})

    // connecting sql
    // connection = mysql.createConnection({
    // host     : 'localhost',
    // user     : 'root',
    // password : '',
    // database : 'bot'
    // });

    // await connection.connect();

    return;
}

Functions.setupData = async () => {

}

client.on("ready", async () => {
    await Functions.startUp();
    await Functions.setupData();
})


client.login(config.token)

