const discord = require('discord.js')
const config = require('./botconfig.json')


const client = new discord.Client()


client.on("ready", () => {
    console.log("[DEBUG] BOT STARTING UP")
    let ticketCount = 0
    client.user.setActivity({name: `${ticketCount} orders`, type: "WATCHING"})
})


client.login(config.token)

