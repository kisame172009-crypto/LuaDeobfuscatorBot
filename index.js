const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const axios = require('axios');
const deobfuscate = require('./deobfuscator');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot en ligne ! ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    
    if (interaction.commandName === 'deobf') {
        await interaction.deferReply();
        const code = interaction.options.getString('code');
        
        try {
            const result = await deobfuscate(code);
            await interaction.editReply({
                content: `\`\`\`lua\n${result.substring(0, 1900)}\n\`\`\``
            });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Erreur de désobfuscation: ${error.message}`
            });
        }
    }
    
    if (interaction.commandName === 'deobfurl') {
        await interaction.deferReply();
        const url = interaction.options.getString('url');
        
        try {
            const response = await axios.get(url);
            const result = await deobfuscate(response.data);
            await interaction.editReply({
                content: `\`\`\`lua\n${result.substring(0, 1900)}\n\`\`\``
            });
        } catch (error) {
            await interaction.editReply({
                content: `❌ Erreur: ${error.message}`
            });
        }
    }
});

const commands = [
    {
        name: 'deobf',
        description: 'Désobfusque du code Lua (Luarmor, Moonsec, etc.)',
        options: [{
            name: 'code',
            type: 3,
            description: 'Le code Lua obfusqué',
            required: true
        }]
    },
    {
        name: 'deobfurl',
        description: 'Désobfusque un script depuis une URL',
        options: [{
            name: 'url',
            type: 3,
            description: 'URL du script obfusqué',
            required: true
        }]
    }
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('✅ Commandes slash enregistrées');
    } catch (error) {
        console.error('❌ Erreur commandes:', error.message);
    }
    client.login(token);
})();
