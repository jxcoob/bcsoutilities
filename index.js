require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, REST, Routes, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const keep_alive = require('./keep_alive.js')




// ====== CONFIG ======
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;








const allowedRoles = ["1405655436585205846", "1426711225135403092"];
const rolesToRemove = ["1405655436522422327", "1405655436522422325","1405655436522422324"];
const rolesToAdd = [
  "1405655436576948245","1405655436564107373","1410486708998373387",
  "1410485432939974666","1410589840465985596","1426006779908849714",
  "1410434191111356562","1410669246341578814","1410668818275110994",
  "1410669950376611893","1410668907983011980","1410668818275110994",
];








const retireReinstate_allowedRoles = ["1405655436585205846","1405655436585205843","1405655436585205849","1405655436585205848","1410836174083199067","1405655436585205844",];
const retireReinstate_rolesToManage = [
  "1410836174083199067","1405655436585205844","1405655436585205846",
  "1405655436585205845","1405655436585205843","1412519861447430175",
  "1405655436585205842","1405655436585205841","1405655436576948249",
  "1412538809316409374","1412539508133724290","1405655436576948248",
  "1405655436576948247","1410437313531482162","1412208548884254771",
  "1405655436576948246","1405655436576948245","1405655436564107373",
  "1410486708998373387","1410480565492383754","1405655436538941570",
  "1405655436538941569","1423272192841486396","1405655436538941566",
  "1405655436538941565","1410482367629496411","1405655436538941563",
  "1410485432939974666","1410485506554462289","1410677732127412406",
  "1410589840465985596","1426006779908849714","1410482277221142548",
  "1410434191111356562","1422723437750780076","1422724053692711074",
  "1422724389530636288","1422724672772116532","1405655436467634238",
  "1405655436564107365","1426711225135403092","1405655436564107372",
  "1405655436564107370","1405655436564107369","1405655436564107368",
  "1410656412035715254","1405655436555845796","1410669246341578814",
  "1410668556462587995","1410668736368611548","1410668818275110994",
  "1410669950376611893","1410668907983011980","1423272804383461387",
  "1405655436522422328","1405655436522422327","1405655436522422325",
  "1411716983921053787","1430515063025958922","1430515221553877032",
  "1430280882328965200","1430281252862165062","1430281575731298460",
  "1431682792001110147","1431683035073347735","1431683143731249243",
  "1431683229106311169","1431683298521911438","1431762888334245970",
  "1432593948295036968","1432594307709145178","1432569127528042528",
  "1432578593891815444","1410485214274125907","1432568049038393404",                              
  "1432572282219401357","1405655436492931237","1430280806571704320",
];








const logArrestRoleId = "1410486708998373387";
const logCitationRoleId = "1410486708998373387";
const logWarrantRoleId = "1410486708998373387";
const logReportRoleId = "1410486708998373387";








const trainingAttendees = new Map();
const deploymentAttendees = new Map();
let specialPermissionCounter = 0;
let specialPermissions = {};
let citationCounter = 0;
let arrestCounter = 0;
let warrantCounter = 0;
let reportCounter = 0;








// ====== DB FUNCTIONS ======
const dbPath = path.join(__dirname, 'infractions.json');
const countersPath = path.join(__dirname, 'counters.json');
const permissionsPath = path.join(__dirname, 'permissions.json');
const reviewsPath = path.join(__dirname, 'reviews.json');
const logsPath = path.join(__dirname, 'logs.json');
const retiredUsersPath = path.join(__dirname, 'retired_users.json');







function loadDB() {
  if(fs.existsSync(dbPath)) return JSON.parse(fs.readFileSync(dbPath));
  return {infractions:[]};
}








function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}








function generateID(db) {
  const ids = db.infractions.map(i => parseInt(i.id.substring(2)));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return `IF${maxId + 1}`;
}








function loadCounter() {
  if(fs.existsSync(countersPath)) {
    const data = JSON.parse(fs.readFileSync(countersPath));
    specialPermissionCounter = data.counter || 0;
    return specialPermissionCounter;
  }
  return 0;
}








function saveCounter(counter) {
  fs.writeFileSync(countersPath, JSON.stringify({counter}, null, 2));
}






function loadRetiredUsers() {
  if(fs.existsSync(retiredUsersPath)) {
    const data = JSON.parse(fs.readFileSync(retiredUsersPath));
    // Convert the plain object back to a Map
    return new Map(Object.entries(data));
  }
  return new Map();
}

function saveRetiredUsers(retiredUsersMap) {
  // Convert Map to plain object for JSON serialization
  const obj = Object.fromEntries(retiredUsersMap);
  fs.writeFileSync(retiredUsersPath, JSON.stringify(obj, null, 2));
}

function loadPermissions() {
  if(fs.existsSync(permissionsPath)) return JSON.parse(fs.readFileSync(permissionsPath));
  return {};
}








function savePermissions(permissions) {
  fs.writeFileSync(permissionsPath, JSON.stringify(permissions, null, 2));
}








function loadReviews() {
  if(fs.existsSync(reviewsPath)) return JSON.parse(fs.readFileSync(reviewsPath));
  return {reviews:[]};
}








function saveReviews(reviews) {
  fs.writeFileSync(reviewsPath, JSON.stringify(reviews, null, 2));
}








function generateReviewID(reviewDB) {
  const ids = reviewDB.reviews.map(r => parseInt(r.id.substring(2)));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return `RV${maxId + 1}`;
}








function loadLogs() {
  if(fs.existsSync(logsPath)) return JSON.parse(fs.readFileSync(logsPath));
  return {citations: [], arrests: [], warrants: [], reports: []};
}








function saveLogs(logs) {
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}








function generateCitationID() {
  citationCounter++;
  return `#C${String(citationCounter).padStart(5, '0')}`;
}








function generateArrestID() {
  arrestCounter++;
  return `#A${String(arrestCounter).padStart(5, '0')}`;
}








function generateWarrantID() {
  warrantCounter++;
  return `#W${String(warrantCounter).padStart(5, '0')}`;
}








function generateReportID() {
  reportCounter++;
  return `#R${String(reportCounter).padStart(5, '0')}`;
}

function loadRetiredUsers() {
  if(fs.existsSync(retiredUsersPath)) {
    const data = JSON.parse(fs.readFileSync(retiredUsersPath));
    return new Map(Object.entries(data));
  }
  return new Map();
}

function saveRetiredUsers(retiredUsersMap) {
  const obj = Object.fromEntries(retiredUsersMap);
  fs.writeFileSync(retiredUsersPath, JSON.stringify(obj, null, 2));
}







// Load counter and permissions on startup
specialPermissionCounter = loadCounter();
specialPermissions = loadPermissions();
const logs = loadLogs();
citationCounter = logs.citations.length;
arrestCounter = logs.arrests.length;
warrantCounter = logs.warrants.length;
reportCounter = logs.reports.length;
const retiredUsers = loadRetiredUsers();








// ====== DEFINE COMMANDS ======
const commands = [
  new SlashCommandBuilder()
    .setName('infraction')
    .setDescription('Manage infractions for users')
    .setDefaultMemberPermissions(null)
    .addSubcommand(sub =>
      sub.setName('execute')
        .setDescription('Issue an infraction to a user')
        .addUserOption(opt => opt.setName('user').setDescription('User to issue infraction to').setRequired(true))
        .addStringOption(opt => opt.setName('type').setDescription('Type of infraction').setRequired(true)
          .addChoices(
            {name: 'Activity Notice', value: 'Activity Notice'},
            {name: 'Verbal Warning', value: 'Verbal Warning'},
            {name: 'Warning', value: 'Warning'},
            {name: 'Strike', value: 'Strike'},
            {name: 'Termination', value: 'Termination'}
          )
        )
        .addStringOption(opt => opt.setName('reason').setDescription('Reason for infraction').setRequired(true))
        .addStringOption(opt => opt.setName('division').setDescription('Division (optional)').setRequired(false)
          .addChoices(
            {name: 'Patrol', value: 'Patrol'},
            {name: 'CRU', value: 'CRU'},
            {name: 'MCD', value: 'MCD'},
            {name: 'Corrections', value: 'Corrections'},
            {name: 'Training', value: 'Training'}
          )
        )
        .addAttachmentOption(opt => opt.setName('evidence').setDescription('Evidence file').setRequired(false))
    )
    .addSubcommand(sub =>
      sub.setName('revoke')
        .setDescription('Revoke an infraction')
        .addStringOption(opt => opt.setName('id').setDescription('Infraction ID').setRequired(true))
        .addUserOption(opt => opt.setName('user').setDescription('User to revoke infraction from').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('list')
        .setDescription('List all active infractions for a user')
        .addUserOption(opt => opt.setName('user').setDescription('User to check').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('wipe')
        .setDescription('Remove all infractions for a user')
        .addUserOption(opt => opt.setName('user').setDescription('User to wipe infractions for').setRequired(true))
    )
    .toJSON(),








  new SlashCommandBuilder()
    .setName('roleprobie')
    .setDescription('Promote a user to probationary deputy')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('user').setDescription('User to promote').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('retire')
    .setDescription('Retire a user from their position')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('user').setDescription('User to retire').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('reinstate')
    .setDescription('Reinstate a retired user')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('user').setDescription('User to reinstate').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('special-permission-log')
    .setDescription('Grant a special permission to a user')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('user').setDescription('User to grant permission to').setRequired(true))
    .addStringOption(opt => opt.setName('permission').setDescription('Permission type').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for permission').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('special-permission-revoke')
    .setDescription('Revoke a special permission')
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName('id').setDescription('Permission ID to revoke').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('review')
    .setDescription('Manage deputy reviews')
    .setDefaultMemberPermissions(null)
    .addSubcommand(sub =>
      sub.setName('log')
        .setDescription('Log a deputy review')
        .addUserOption(opt => opt.setName('user').setDescription('User to review').setRequired(true))
        .addStringOption(opt => opt.setName('rating').setDescription('Rate the user out of 5. (e.g 2/5, 3/5, 4/5, etc.)').setRequired(true))
        .addStringOption(opt => opt.setName('duration').setDescription('Duration').setRequired(true))
        .addStringOption(opt => opt.setName('notes').setDescription('Review notes').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('view')
        .setDescription('View a specific review')
        .addStringOption(opt => opt.setName('id').setDescription('Review ID').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('clear')
        .setDescription('Clear a review')
        .addStringOption(opt => opt.setName('id').setDescription('Review ID to clear').setRequired(true))
    )
    .toJSON(),








  new SlashCommandBuilder()
    .setName('massshift-start')
    .setDescription('Start a mass shift event')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('watch-commander').setDescription('Watch Commander').setRequired(true))
    .addStringOption(opt => opt.setName('supervisors').setDescription('Supervisor(s)').setRequired(true))
    .addUserOption(opt => opt.setName('assistant-watch-commander').setDescription('Assistant Watch Commander').setRequired(false))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('massshift-end')
    .setDescription('End the current mass shift event')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('log-arrest')
    .setDescription('Log an arrest')
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName('username').setDescription('Name of person arrested').setRequired(true))
    .addStringOption(opt => opt.setName('charges').setDescription('Charges').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('log-citation')
    .setDescription('Log a citation')
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName('username').setDescription('Name of person cited').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Reason for citation').setRequired(true))
    .addStringOption(opt => opt.setName('fine').setDescription('Fine amount').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('log-report')
    .setDescription('Log an incident report')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('log-warrant')
    .setDescription('Log a warrant')
    .setDefaultMemberPermissions(null)
    .addStringOption(opt => opt.setName('user').setDescription('Name of person warrant issued for').setRequired(true))
    .addStringOption(opt => opt.setName('charges').setDescription('Warrant charges').setRequired(true))
    .toJSON(),








  new SlashCommandBuilder()
    .setName('statistics')
    .setDescription('View statistics on logs issued')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('training-vote')
    .setDescription('Initiate a cadet training vote')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('training-start')
    .setDescription('Start the cadet training')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('training-end')
    .setDescription('End the cadet training')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('award')
    .setDescription('Award a user with a departmental award')
    .setDefaultMemberPermissions(null)
    .addUserOption(opt => opt.setName('user').setDescription('User to award').setRequired(true))
    .addStringOption(opt => opt.setName('type').setDescription('Type of award').setRequired(true)
      .addChoices(
        {name: 'Medal of Valor', value: 'Medal of Valor'},
        {name: "Sheriff's Recognition Award", value: "Sheriff's Recognition Award"},
        {name: 'Distinguished Service Award', value: 'Distinguished Service Award'},
        {name: 'Lifesaving Award', value: 'Lifesaving Award'},
        {name: 'Meritorious Activity Award', value: 'Meritorious Activity Award'}
      )
    )
    .toJSON(),








  new SlashCommandBuilder()
    .setName('deployment-vote')
    .setDescription('Initiate a CRU deployment vote')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('deployment-start')
    .setDescription('Start the CRU deployment')
    .setDefaultMemberPermissions(null)
    .toJSON(),








  new SlashCommandBuilder()
    .setName('deployment-end')
    .setDescription('End the CRU deployment')
    .setDefaultMemberPermissions(null)
    .toJSON(),
];








// ====== CLIENT SETUP ======
const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});








// ====== READY ======
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    console.log('🧹 Clearing all existing commands...');
    
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    
    console.log('⏳ Waiting 2 seconds for Discord to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const commandNames = commands.map(c => c.name);
    const uniqueNames = new Set(commandNames);
    
    if (commandNames.length !== uniqueNames.size) {
      console.error('Error: Duplicate command names detected in code!');
      const duplicates = commandNames.filter((name, index) => commandNames.indexOf(name) !== index);
      console.error('Duplicates:', duplicates);
      return;
    }
    
    console.log(`Registering ${commands.length} unique commands...`);
    console.log('Commands:', commandNames.join(', '));
    
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId), 
      { body: commands }
    );
    
    console.log(`Successfully registered ${data.length} commands!`);
    
  } catch (err) {
    console.error('Error registering commands:', err);
  }
});








// ====== PREFIX COMMANDS ======
client.on('messageCreate', async message=>{
  if(message.author.bot || !message.guild) return;








  if(message.content.startsWith('$say')){
    const allowedSayRoles=['1405655436585205846','1405655436597661720'];
    if(!message.member.roles.cache.some(r=>allowedSayRoles.includes(r.id))) return message.reply('You do not have permission.');








    const text = message.content.slice(4).trim();
    if(!text) return message.reply('Please provide text.');








    await message.delete().catch(console.error);
    await message.channel.send(text);
  }
});






// ====== INTERACTION HANDLER ======
client.on('interactionCreate', async interaction=>{
  if(interaction.isButton()) {
    if(interaction.customId.startsWith('training_attend_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(!trainingAttendees.has(messageId)) {
        trainingAttendees.set(messageId, new Set());
      }
      
      const attendees = trainingAttendees.get(messageId);
      
      if(attendees.has(interaction.user.id)) {
        const removeButton = new ButtonBuilder()
          .setCustomId(`training_remove_${messageId}`)
          .setLabel('Remove Attendance')
          .setStyle(ButtonStyle.Danger);
        
        const removeRow = new ActionRowBuilder()
          .addComponents(removeButton);
        
        await interaction.reply({
          content: "You've already marked yourself as attending to this training, would you like to remove your attendance?",
          components: [removeRow],
          flags: MessageFlags.Ephemeral
        });
      } else {
        attendees.add(interaction.user.id);
        await interaction.reply({
          content: 'You have been marked as attending this training!',
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }
    
    if(interaction.customId.startsWith('training_view_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(!trainingAttendees.has(messageId) || trainingAttendees.get(messageId).size === 0) {
        await interaction.reply({
          content: 'No cadets have marked themselves as attending yet.',
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      
      const attendees = trainingAttendees.get(messageId);
      const attendeesList = Array.from(attendees).map(id => `<@${id}>`).join('\n');
      
      const embed = new EmbedBuilder()
        .setTitle('Cadets Attending:')
        .setDescription(attendeesList)
        .setColor('#95A5A6')
        .setFooter({text: 'BCSO Utilities'})
        .setTimestamp();
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    if(interaction.customId.startsWith('training_remove_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(trainingAttendees.has(messageId)) {
        const attendees = trainingAttendees.get(messageId);
        attendees.delete(interaction.user.id);
        
        await interaction.update({
          content: 'Your attendance has been removed.',
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }








    if(interaction.customId.startsWith('deployment_attend_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(!deploymentAttendees.has(messageId)) {
        deploymentAttendees.set(messageId, new Set());
      }
      
      const attendees = deploymentAttendees.get(messageId);
      
      if(attendees.has(interaction.user.id)) {
        const removeButton = new ButtonBuilder()
          .setCustomId(`deployment_remove_${messageId}`)
          .setLabel('Remove Attendance')
          .setStyle(ButtonStyle.Danger);
        
        const removeRow = new ActionRowBuilder()
          .addComponents(removeButton);
        
        await interaction.reply({
          content: "You've already marked yourself as attending to this deployment, would you like to remove your attendance?",
          components: [removeRow],
          flags: MessageFlags.Ephemeral
        });
      } else {
        attendees.add(interaction.user.id);
        await interaction.reply({
          content: 'You have been marked as attending this deployment!',
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }
    
    if(interaction.customId.startsWith('deployment_view_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(!deploymentAttendees.has(messageId) || deploymentAttendees.get(messageId).size === 0) {
        await interaction.reply({
          content: 'No operators have marked themselves as attending yet.',
          flags: MessageFlags.Ephemeral
        });
        return;
      }
      
      const attendees = deploymentAttendees.get(messageId);
      const attendeesList = Array.from(attendees).map(id => `<@${id}>`).join('\n');
      
      const embed = new EmbedBuilder()
        .setTitle('Operators Attending:')
        .setDescription(attendeesList)
        .setColor('#95A5A6')
        .setFooter({text: 'BCSO Utilities'})
        .setTimestamp();
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      return;
    }
    
    if(interaction.customId.startsWith('deployment_remove_')) {
      const messageId = interaction.customId.split('_')[2];
      
      if(deploymentAttendees.has(messageId)) {
        const attendees = deploymentAttendees.get(messageId);
        attendees.delete(interaction.user.id);
        
        await interaction.update({
          content: 'Your attendance has been removed.',
          components: [],
          flags: MessageFlags.Ephemeral
        });
      }
      return;
    }
    
    if(interaction.customId.startsWith('warrant_completed_') || interaction.customId.startsWith('warrant_remove_')) {
      const isCompleted = interaction.customId.startsWith('warrant_completed_');
      const warrantId = interaction.customId.split('_')[2];
      const completedUser = interaction.user.tag;
      const removedUser = interaction.user.tag;








      const embed = interaction.message.embeds[0];








      const warrantChannelId = '1412528915381092462';
      const warrantAnnounceChannelId = '1428920503438934046';








      const currentChannelId = interaction.channel.id;
      const otherChannelId = currentChannelId === warrantChannelId ? warrantAnnounceChannelId : warrantChannelId;








      if(isCompleted) {
        const updatedEmbed = new EmbedBuilder(embed.data)
          .setColor('#2ECC71');








        const completedButton = new ButtonBuilder()
          .setCustomId(`warrant_completed_${warrantId}`)
          .setLabel(`Completed by ${completedUser}`)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);








        const buttonRow = new ActionRowBuilder()
          .addComponents(completedButton);








        await interaction.update({embeds: [updatedEmbed], components: [buttonRow]});








        try {
          const otherChannel = await interaction.client.channels.fetch(otherChannelId);
          if(otherChannel) {
            const messages = await otherChannel.messages.fetch({ limit: 100 });
            const targetMessage = messages.find(msg => 
              msg.embeds.length > 0 && 
              msg.embeds[0].data.description && 
              msg.embeds[0].data.description.includes(warrantId)
            );








            if(targetMessage) {
              await targetMessage.edit({embeds: [updatedEmbed], components: [buttonRow]});
            }
          }
        } catch(err) {
          console.error('Error updating other channel:', err);
        }
      } else {
        const updatedEmbed = new EmbedBuilder(embed.data)
          .setColor('#95A5A6');








        const removeButton = new ButtonBuilder()
          .setCustomId(`warrant_remove_${warrantId}`)
          .setLabel(`Warrant Removed by ${removedUser}`)
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true);








        const buttonRow = new ActionRowBuilder()
          .addComponents(removeButton);








        await interaction.update({embeds: [updatedEmbed], components: [buttonRow]});








        try {
          const otherChannel = await interaction.client.channels.fetch(otherChannelId);
          if(otherChannel) {
            const messages = await otherChannel.messages.fetch({ limit: 100 });
            const targetMessage = messages.find(msg => 
              msg.embeds.length > 0 && 
              msg.embeds[0].data.description && 
              msg.embeds[0].data.description.includes(warrantId)
            );








            if(targetMessage) {
              await targetMessage.edit({embeds: [updatedEmbed], components: [buttonRow]});
            }
          }
        } catch(err) {
          console.error('Error updating other channel:', err);
        }
      }
      return;
    }
  }








  if(!interaction.isChatInputCommand() && !interaction.isModalSubmit()) return;








  const cmd = interaction.commandName;








  try{
    if(cmd==='infraction'){
      const sub = interaction.options.getSubcommand();
      const db = loadDB();
      const logChannelId = '1405655437218414753';








      if(sub==='execute' || sub==='revoke' || sub==='list'){
        const allowedRoles = ['1405655436585205846', '1405655436585205841'];
        const hasPermission = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));
        
        if(!hasPermission) {
          return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
        }
      }
      
      if(sub==='wipe'){
        const allowedRoles = ['1405655436585205846'];
        const hasPermission = interaction.member.roles.cache.some(r => allowedRoles.includes(r.id));
        
        if(!hasPermission) {
          return interaction.reply({content:'You do not have permission to wipe infractions.', flags: MessageFlags.Ephemeral});
        }
      }








      if(sub==='execute'){
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const type = interaction.options.getString('type');
        const division = interaction.options.getString('division');
        const evidence = interaction.options.getAttachment('evidence');








        const infractionId = generateID(db);
        const newInfraction = {id:infractionId,userId:targetUser.id,type,reason,division:division||null,evidence:evidence?evidence.url:null,moderator:interaction.user.id,timestamp:new Date().toISOString(),revoked:false};
        db.infractions.push(newInfraction);
        saveDB(db);








        const dmEmbed = new EmbedBuilder()
          .setTitle('Infraction Issued')
          .setColor('#95A5A6')
          .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
          .addFields(
            {name:'Infraction ID',value:infractionId,inline:true},
            {name:'Type',value:type,inline:true},
            {name:'Reason',value:reason}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        try{ await targetUser.send({embeds:[dmEmbed]}); }catch{}








        const logEmbed = new EmbedBuilder()
          .setTitle('Infraction Log')
          .setColor('#95A5A6')
          .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
          .addFields(
            {name:'Infraction ID',value:infractionId,inline:true},
            {name:'User',value:`${targetUser}`,inline:true},
            {name:'Type',value:type,inline:true},
            {name:'Reason',value:reason},
            {name:'Issued by:',value:`${interaction.user.tag}`,inline:true}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();
        if(division) logEmbed.addFields({name:'Division',value:division,inline:true});
        if(evidence) logEmbed.addFields({name:'Evidence',value:`[View Attachment](${evidence.url})`});








        const logChannel = await interaction.client.channels.fetch(logChannelId);
        if(logChannel) await logChannel.send({embeds:[logEmbed]});
        await interaction.reply({content:`Infraction ${infractionId} issued to ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});
      }








      else if(sub==='revoke'){
        const id = interaction.options.getString('id');
        const targetUser = interaction.options.getUser('user');








        const infraction = db.infractions.find(i=>i.id===id && i.userId===targetUser.id);
        if(!infraction) return interaction.reply({content:`No infraction found with ID ${id} for ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});








        infraction.revoked = true;
        infraction.revokedBy = interaction.user.id;
        infraction.revokedAt = new Date().toISOString();
        saveDB(db);








        const revokeEmbed = new EmbedBuilder()
          .setTitle('Infraction Revoked')
          .setColor('#95A5A6')
          .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
          .addFields(
            {name:'Infraction ID',value:infraction.id},
            {name:'User',value:`<@${infraction.userId}>`},
            {name:'Original Type',value:infraction.type},
            {name:'Reason',value:infraction.reason},
            {name:'Revoked By',value:`<@${interaction.user.id}>`}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        try{ await targetUser.send({embeds:[revokeEmbed]}); }catch{}








        const logChannel = await interaction.client.channels.fetch('1405655437218414753');
        if(logChannel) await logChannel.send({embeds:[revokeEmbed]});








        await interaction.reply({content:`Infraction ${id} revoked for ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});
      }








      else if(sub==='list'){
        const targetUser = interaction.options.getUser('user');
        const userInfractions = db.infractions.filter(i=>i.userId===targetUser.id && !i.revoked);
        if(userInfractions.length===0) return interaction.reply({content:`${targetUser.tag} has no active infractions.`, flags: MessageFlags.Ephemeral});








        const embed = new EmbedBuilder()
          .setTitle(`Active Infractions for ${targetUser.tag}`)
          .setColor('#95A5A6')
          .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();
        for(const inf of userInfractions){
          embed.addFields({
            name:`${inf.id} — ${inf.type}`,
            value:`**Reason:** ${inf.reason}\n**Division:** ${inf.division||'N/A'}\n**Moderator:** <@${inf.moderator}>\n**Date:** <t:${Math.floor(new Date(inf.timestamp).getTime()/1000)}:f>\n${inf.evidence?`[Evidence](${inf.evidence})`:''}`,
            inline:false
          });
        }
        await interaction.reply({embeds:[embed], flags: MessageFlags.Ephemeral});
      }








      else if(sub==='wipe'){
        const targetUser = interaction.options.getUser('user');
        const userInfractions = db.infractions.filter(i=>i.userId===targetUser.id);
        
        if(userInfractions.length===0) {
          return interaction.reply({content:`${targetUser.tag} has no infractions to wipe.`, flags: MessageFlags.Ephemeral});
        }








        const infractionCount = userInfractions.length;
        
        db.infractions = db.infractions.filter(i=>i.userId!==targetUser.id);
        saveDB(db);








        const wipeEmbed = new EmbedBuilder()
          .setTitle('Infractions Wiped')
          .setColor('#95A5A6')
          .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
          .addFields(
            {name:'User',value:`${targetUser}`,inline:true},
            {name:'Infractions Removed',value:`${infractionCount}`,inline:true},
            {name:'Wiped By',value:`<@${interaction.user.id}>`,inline:true}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        try{ 
          await targetUser.send({
            embeds:[new EmbedBuilder()
              .setTitle('Your Infractions Have Been Wiped')
              .setColor('#95A5A6')
              .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
              .setDescription(`All of your infractions (${infractionCount}) have been removed from the system.`)
              .setFooter({text:'BCSO Utilities'})
              .setTimestamp()]
          }); 
        }catch{}








        const logChannel = await interaction.client.channels.fetch('1405655437218414753');
        if(logChannel) await logChannel.send({embeds:[wipeEmbed]});








        await interaction.reply({content:`Wiped all ${infractionCount} infraction(s) for ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});
      }
    }








    else if(cmd==='roleprobie'){
      const allowedRoles = ['1426711225135403092', '1405655436585205846'];
      if(!interaction.member.roles.cache.some(r=>allowedRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      await interaction.deferReply({flags: MessageFlags.Ephemeral});








      const targetUser = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(targetUser.id);








      for(const roleId of rolesToRemove){
        if(member.roles.cache.has(roleId)){
          await member.roles.remove(roleId);
        }
      }








      for(const roleId of rolesToAdd){
        if(!member.roles.cache.has(roleId)){
          await member.roles.add(roleId);
        }
      }








      const embed = new EmbedBuilder()
        .setTitle('User Promoted to Probie')
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .addFields(
          {name:'User',value:`${targetUser}`,inline:true},
          {name:'Promoted By',value:`<@${interaction.user.id}>`,inline:true}
        )
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      const logChannel = await interaction.client.channels.fetch('1428156693107179601');
      if(logChannel) await logChannel.send({embeds:[embed]});








      await interaction.editReply({content:`${targetUser.tag} has been roled as a probationary deputy.`});
    }








    else if(cmd==='retire'){
      const allowedRoles = ['1405655436585205846'];
      if(!interaction.member.roles.cache.some(r=>allowedRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      await interaction.deferReply({flags: MessageFlags.Ephemeral});








      const targetUser = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(targetUser.id);








      const userRoles = member.roles.cache
        .filter(role => retireReinstate_rolesToManage.includes(role.id))
        .map(role => role.id);
      
      retiredUsers.set(targetUser.id, userRoles);
      saveRetiredUsers(retiredUsers);








      for(const roleId of userRoles){
        await member.roles.remove(roleId);
      }








      const embed = new EmbedBuilder()
        .setTitle('User Retired')
        .setColor('#95A5A6')
        .addFields(
          {name:'User',value:`${targetUser}`,inline:true},
          {name:'Retired By',value:`<@${interaction.user.id}>`,inline:true},
          {name:'Roles Removed',value:`${userRoles.length}`,inline:true}
        )
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      const logChannel = await interaction.client.channels.fetch('1427322965816639658');
      if(logChannel) await logChannel.send({embeds:[embed]});








      await interaction.editReply({content:`Successfully retired ${targetUser}.`});
    }








    else if(cmd==='reinstate'){
      const allowedRoles = ['1405655436585205846'];
      if(!interaction.member.roles.cache.some(r=>allowedRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      await interaction.deferReply({flags: MessageFlags.Ephemeral});
      const targetUser = interaction.options.getUser('user');
      const member = await interaction.guild.members.fetch(targetUser.id);








      if(!retiredUsers.has(targetUser.id)){
        return interaction.editReply({content:`${targetUser.tag} is not in the retired users list.`});
      }








      const userRoles = retiredUsers.get(targetUser.id);








      for(const roleId of userRoles){
        await member.roles.add(roleId);
      }








      retiredUsers.delete(targetUser.id);
      saveRetiredUsers(retiredUsers);








      const embed = new EmbedBuilder()
        .setTitle('User Reinstated')
        .setColor('#95A5A6')
        .addFields(
          {name:'User',value:`${targetUser}`,inline:true},
          {name:'Reinstated By',value:`<@${interaction.user.id}>`,inline:true},
          {name:'Roles Restored',value:`${userRoles.length}`,inline:true}
        )
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      const logChannel = await interaction.client.channels.fetch('1427322965816639658');
      if(logChannel) await logChannel.send({embeds:[embed]});








      await interaction.editReply({content:`${targetUser.tag} has been successfully reinstated.`});
    }








    else if(cmd==='special-permission-log'){
      const allowedRoles = ['1405655436585205846'];
      if(!interaction.member.roles.cache.some(r=>allowedRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      const targetUser = interaction.options.getUser('user');
      const permission = interaction.options.getString('permission');
      const reason = interaction.options.getString('reason');








      specialPermissionCounter++;
      const permissionId = `#${String(specialPermissionCounter).padStart(3,'0')}`;








      specialPermissions[permissionId] = {
        userId: targetUser.id,
        permission: permission,
        reason: reason,
        grantedBy: interaction.user.id,
        timestamp: new Date().toISOString()
      };








      saveCounter(specialPermissionCounter);
      savePermissions(specialPermissions);








      const embed = new EmbedBuilder()
        .setTitle('Special Permission Granted')
        .setColor('#95A5A6')
        .addFields(
          {name:'Permission ID',value:permissionId,inline:true},
          {name:'User',value:`${targetUser}`,inline:true},
          {name:'Granted By',value:`<@${interaction.user.id}>`,inline:true},
          {name:'Permission',value:permission},
          {name:'Reason',value:reason}
        )
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      try{ 
        await targetUser.send({embeds:[embed]}); 
      }catch{}








      const specialPermChannel = await interaction.client.channels.fetch('1410429136236711978');
      if(specialPermChannel) await specialPermChannel.send({embeds:[embed]});








      await interaction.reply({content:`Special permission ${permissionId} successfully logged and granted to ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='special-permission-revoke'){
      const allowedRoles = ['1405655436585205846'];
      if(!interaction.member.roles.cache.some(r=>allowedRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      const permissionId = interaction.options.getString('id').toUpperCase();








      if(!specialPermissions[permissionId]){
        return interaction.reply({content:`No special permission found with ID ${permissionId}.`, flags: MessageFlags.Ephemeral});
      }








      const permission = specialPermissions[permissionId];
      const user = await interaction.client.users.fetch(permission.userId);








      delete specialPermissions[permissionId];
      savePermissions(specialPermissions);








      const embed = new EmbedBuilder()
        .setTitle('Special Permission Revoked')
        .setColor('#95A5A6')
        .addFields(
          {name:'Permission ID',value:permissionId,inline:true},
          {name:'User',value:`${user}`,inline:true},
          {name:'Revoked By',value:`<@${interaction.user.id}>`,inline:true},
          {name:'Original Permission',value:permission.permission}
        )
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      try{ 
        await user.send({embeds:[embed]}); 
      }catch{}








      const specialPermChannel = await interaction.client.channels.fetch('1410429136236711978');
      if(specialPermChannel) await specialPermChannel.send({embeds:[embed]});








      await interaction.reply({content:`Special permission ${permissionId} revoked.`, flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='review'){
      const sub = interaction.options.getSubcommand();








      if(sub==='log'){
        const allowedReviewRoles = ['1405655436576948247', '1405655436585205841', '1405655436585205846'];
        const hasPermission = interaction.member.roles.cache.some(r => allowedReviewRoles.includes(r.id));
        
        if(!hasPermission) {
          return interaction.reply({content:'You do not have permission to log reviews.', flags: MessageFlags.Ephemeral});
        }








        const targetUser = interaction.options.getUser('user');
        const rating = interaction.options.getString('rating');
        const duration = interaction.options.getString('duration');
        const notes = interaction.options.getString('notes');








        const reviewDB = loadReviews();
        const reviewId = generateReviewID(reviewDB);








        const newReview = {
          id: reviewId,
          userId: targetUser.id,
          rating: rating,
          duration: duration,
          notes: notes,
          reviewer: interaction.user.id,
          timestamp: new Date().toISOString()
        };








        reviewDB.reviews.push(newReview);
        saveReviews(reviewDB);








        const dmEmbed = new EmbedBuilder()
          .setTitle('Deputy Review')
          .setColor('#95A5A6')
          .addFields(
            {name:'Review ID',value:reviewId,inline:true},
            {name:'Rating',value:rating,inline:true},
            {name:'Duration',value:duration,inline:true},
            {name:'Notes',value:notes}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        try{ await targetUser.send({embeds:[dmEmbed]}); }catch{}








        const logEmbed = new EmbedBuilder()
          .setTitle('Deputy Review')
          .setColor('#95A5A6')
          .addFields(
            {name:'Review ID',value:reviewId,inline:true},
            {name:'User',value:`${targetUser}`,inline:true},
            {name:'Rating',value:rating,inline:true},
            {name:'Duration',value:duration,inline:true},
            {name:'Reviewer',value:`<@${interaction.user.id}>`,inline:true},
            {name:'Notes',value:notes}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        const reviewChannel = await interaction.client.channels.fetch('1427315907297935400');
        if(reviewChannel) await reviewChannel.send({embeds:[logEmbed]});








        await interaction.reply({content:`Review ${reviewId} logged for ${targetUser.tag}.`, flags: MessageFlags.Ephemeral});
      }








      else if(sub==='view'){
        const allowedReviewRoles = ['1405655436576948247', '1405655436585205841', '1405655436585205846'];
        const hasPermission = interaction.member.roles.cache.some(r => allowedReviewRoles.includes(r.id));
        
        if(!hasPermission) {
          return interaction.reply({content:'You do not have permission to view reviews.', flags: MessageFlags.Ephemeral});
        }








        const reviewId = interaction.options.getString('id').toUpperCase();
        const reviewDB = loadReviews();
        const review = reviewDB.reviews.find(r => r.id === reviewId);








        if(!review) {
          return interaction.reply({content:`No review found with ID ${reviewId}.`, flags: MessageFlags.Ephemeral});
        }








        const user = await interaction.client.users.fetch(review.userId);








        const embed = new EmbedBuilder()
          .setTitle(`Review ${reviewId}`)
          .setColor('#95A5A6')
          .addFields(
            {name:'User',value:`${user}`,inline:true},
            {name:'Rating',value:review.rating,inline:true},
            {name:'Duration',value:review.duration,inline:true},
            {name:'Reviewer',value:`<@${review.reviewer}>`,inline:true},
            {name:'Date',value:`<t:${Math.floor(new Date(review.timestamp).getTime()/1000)}:f>`,inline:true}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();
        
        if(review.notes) embed.addFields({name:'Notes',value:review.notes});








        await interaction.reply({embeds:[embed], flags: MessageFlags.Ephemeral});
      }








      else if(sub==='clear'){
        const allowedReviewRoles = ['1405655436576948247', '1405655436585205841', '1405655436585205846'];
        const hasPermission = interaction.member.roles.cache.some(r => allowedReviewRoles.includes(r.id));
        
        if(!hasPermission) {
          return interaction.reply({content:'You do not have permission to clear reviews.', flags: MessageFlags.Ephemeral});
        }








        const reviewId = interaction.options.getString('id').toUpperCase();
        const reviewDB = loadReviews();
        const reviewIndex = reviewDB.reviews.findIndex(r => r.id === reviewId);








        if(reviewIndex === -1) {
          return interaction.reply({content:`No review found with ID ${reviewId}.`, flags: MessageFlags.Ephemeral});
        }








        const review = reviewDB.reviews[reviewIndex];
        const user = await interaction.client.users.fetch(review.userId);








        reviewDB.reviews.splice(reviewIndex, 1);
        saveReviews(reviewDB);








        const clearEmbed = new EmbedBuilder()
          .setTitle('Review Cleared')
          .setColor('#95A5A6')
          .addFields(
            {name:'Review ID',value:reviewId,inline:true},
            {name:'User',value:`${user}`,inline:true},
            {name:'Cleared By',value:`<@${interaction.user.id}>`,inline:true}
          )
          .setFooter({text:'BCSO Utilities'})
          .setTimestamp();








        const logChannel = await interaction.client.channels.fetch('1427315907297935400');
        if(logChannel) await logChannel.send({embeds:[clearEmbed]});








        await interaction.reply({content:`Review ${reviewId} successfully cleared.`, flags: MessageFlags.Ephemeral});
      }
    }








else if(cmd==='massshift-start'){
  const massshiftAllowedRoles = ['1405655436585205846', '1405655436585205841'];
  if(!interaction.member.roles.cache.some(r => massshiftAllowedRoles.includes(r.id))){
    return interaction.reply({content:'You do not have permission to start a mass shift.', flags: MessageFlags.Ephemeral});
  }


  const watchCommander = interaction.options.getUser('watch-commander');
  const assistantWC = interaction.options.getUser('assistant-watch-commander');
  const supervisorsInput = interaction.options.getString('supervisors');


  const embed = new EmbedBuilder()
    .setTitle('Briarfield County Sheriff\'s Office Mass Shift')
    .setDescription(`<@&1410486708998373387>\n\nA mass shift has now commenced, all deputies are encouraged to attend and assist with patrol duties. Please ensure you are in proper uniform and have all necessary equipment. Your dedication to serving the community is greatly appreciated!`)
    .setColor('#95A5A6')
    .addFields(
      { name: 'Watch Commander', value: `${watchCommander}`, inline: false },
      ...(assistantWC ? [{ name: 'Assistant Watch Commander', value: `${assistantWC}`, inline: false }] : []),
      { name: 'Supervisor(s)', value: supervisorsInput, inline: false }
    )
    .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png')
    .setTimestamp();


  const massShiftChannelId = '1405655437218414754';
  const massShiftChannel = await interaction.client.channels.fetch(massShiftChannelId);
  if(!massShiftChannel) return interaction.reply({content:'Mass shift channel not found.', flags: MessageFlags.Ephemeral});


  await massShiftChannel.send({
    content: '<@&1410486708998373387>',
    embeds: [embed],
    allowedMentions: { roles: ['1410486708998373387'] }
  });


  await interaction.reply({content:`Mass shift successfully started with Watch Commander ${watchCommander.tag}.`, flags: MessageFlags.Ephemeral});
}








    else if(cmd==='massshift-end'){
      const massshiftAllowedRoles = ['1405655436585205846', '1405655436585205841'];
      const hasPermission = interaction.member.roles.cache.some(r => massshiftAllowedRoles.includes(r.id));
      
      if(!hasPermission) {
        return interaction.reply({content:'You do not have permission to end a mass shift.', flags: MessageFlags.Ephemeral});
      }








      const embed = new EmbedBuilder()
        .setTitle('Briarfield County Sheriff\'s Office Mass Shift - End')
        .setDescription('The mass shift has now concluded. Thank you to all deputies who attended this mass shift, your hard work will not go unnoticed!')
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68ee68f0&is=68ed1770&hm=0286521c6e016e73a8f64be6f2ebd6ff20b4e2319c6121a1269ff4b816667ced&=&format=webp&quality=lossless')
        .setFooter({text:`Concluded by ${interaction.user.tag}`})
        .setTimestamp();








      const massShiftEndChannelId = '1405655437218414754';
      const massShiftEndChannel = await interaction.client.channels.fetch(massShiftEndChannelId);
      
      if(!massShiftEndChannel) {
        return interaction.reply({content:'Mass shift end channel not found.', flags: MessageFlags.Ephemeral});
      }








      await massShiftEndChannel.send({embeds:[embed]});








      await interaction.reply({content:'Mass shift successfully concluded.', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='log-arrest'){
      if(!interaction.member.roles.cache.some(r => r.id === logArrestRoleId)){
        return interaction.reply({content:'You do not have permission to log arrests.', flags: MessageFlags.Ephemeral});
      }








      const username = interaction.options.getString('username');
      const charges = interaction.options.getString('charges');
      const arrestId = generateArrestID();








      const embed = new EmbedBuilder()
        .setTitle('Arrest Log')
        .setDescription(`**ID:** ${arrestId}\n**Suspect:** ${username}\n**Charges:** ${charges}`)
        .setColor('#95A5A6')
        .setThumbnail('https://media.discordapp.net/attachments/1410429525329973379/1414810355980304486/briarfield_county.png?ex=68efb992&is=68ee6812&hm=28106432618af10c82fd63ee23c673aeb3001f3cdead2f4ec0efed6fe8ed1025&=&format=webp&quality=lossless')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:`Executed by ${interaction.user.tag}`})
        .setTimestamp();








      const arrestChannelId = '1412528856652320879';
      const arrestChannel = await interaction.client.channels.fetch(arrestChannelId);
      
      if(arrestChannel) {
        await arrestChannel.send({embeds:[embed]});
        const logs = loadLogs();
        logs.arrests.push({id: arrestId, username, charges, moderator: interaction.user.id, timestamp: new Date().toISOString()});
        saveLogs(logs);
        await interaction.reply({content:`Arrest logged successfully for ${username}.`, flags: MessageFlags.Ephemeral});
      } else {
        await interaction.reply({content:'Failed to log arrest: channel not found.', flags: MessageFlags.Ephemeral});
      }
    }








    else if(cmd==='log-citation'){
      if(!interaction.member.roles.cache.some(r => r.id === logCitationRoleId)){
        return interaction.reply({content:'You do not have permission to log citations.', flags: MessageFlags.Ephemeral});
      }








      const username = interaction.options.getString('username');
      const reason = interaction.options.getString('reason');
      const fine = interaction.options.getString('fine');
      const citationId = generateCitationID();








      const embed = new EmbedBuilder()
        .setTitle('Citation Log')
        .setDescription(`**ID:** ${citationId}\n**Suspect:** ${username}\n**Reason(s):** ${reason}\n**Fine:** ${fine}`)
        .setColor('#95A5A6')
        .setThumbnail('https://media.discordapp.net/attachments/1410429525329973379/1414810355980304486/briarfield_county.png?ex=68efb992&is=68ee6812&hm=28106432618af10c82fd63ee23c673aeb3001f3cdead2f4ec0efed6fe8ed1025&=&format=webp&quality=lossless')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:`Executed by ${interaction.user.tag}`})
        .setTimestamp();








      const citationChannelId = '1412526729184153640';
      const citationChannel = await interaction.client.channels.fetch(citationChannelId);
      
      if(citationChannel) {
        await citationChannel.send({embeds:[embed]});
        const logs = loadLogs();
        logs.citations.push({id: citationId, username, reason, fine, moderator: interaction.user.id, timestamp: new Date().toISOString()});
        saveLogs(logs);
        await interaction.reply({content:`Citation logged successfully for ${username}.`, flags: MessageFlags.Ephemeral});
      } else {
        await interaction.reply({content:'Failed to log citation: channel not found.', flags: MessageFlags.Ephemeral});
      }
    }








    else if(cmd==='log-report'){
      if(!interaction.member.roles.cache.some(r => r.id === logReportRoleId)){
        return interaction.reply({content:'You do not have permission to log reports.', flags: MessageFlags.Ephemeral});
      }








      const modal = new ModalBuilder()
        .setCustomId('report_modal')
        .setTitle('Incident Report');








      const sceneLocationInput = new TextInputBuilder()
        .setCustomId('scene_location')
        .setLabel('Scene Location')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);








      const callsignInput = new TextInputBuilder()
        .setCustomId('callsign')
        .setLabel('Your Callsign / Roleplay Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);








      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Description')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);








      const outcomeInput = new TextInputBuilder()
        .setCustomId('outcome')
        .setLabel('Outcome')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);








      modal.addComponents(
        new ActionRowBuilder().addComponents(sceneLocationInput),
        new ActionRowBuilder().addComponents(callsignInput),
        new ActionRowBuilder().addComponents(descriptionInput),
        new ActionRowBuilder().addComponents(outcomeInput)
      );








      await interaction.showModal(modal);
    }








    else if(interaction.isModalSubmit() && interaction.customId === 'report_modal'){
      const sceneLocation = interaction.fields.getTextInputValue('scene_location');
      const callsign = interaction.fields.getTextInputValue('callsign');
      const description = interaction.fields.getTextInputValue('description');
      const outcome = interaction.fields.getTextInputValue('outcome');
      const reportId = generateReportID();








      const embed = new EmbedBuilder()
        .setTitle('Incident Report')
        .setDescription(`**ID:** ${reportId}`)
        .setColor('#95A5A6')
        .addFields(
          {name:'Scene Location',value:sceneLocation,inline:false},
          {name:'Callsign / Roleplay Name',value:callsign,inline:false},
          {name:'Description',value:description,inline:false},
          {name:'Outcome',value:outcome,inline:false},
          {name:'Submitted By',value:`${interaction.user}`,inline:false}
        )
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      const reportChannelId = '1427332378715492442';
      const reportChannel = await interaction.client.channels.fetch(reportChannelId);
      
      if(reportChannel) {
        await reportChannel.send({embeds:[embed]});
        const logs = loadLogs();
        logs.reports.push({id: reportId, sceneLocation, callsign, description, outcome, moderator: interaction.user.id, timestamp: new Date().toISOString()});
        saveLogs(logs);
        await interaction.reply({content:'Incident report submitted successfully.', flags: MessageFlags.Ephemeral});
      } else {
        await interaction.reply({content:'Failed to submit report: channel not found.', flags: MessageFlags.Ephemeral});
      }
    }








    else if(cmd==='log-warrant'){
      if(!interaction.member.roles.cache.some(r => r.id === logWarrantRoleId)){
        return interaction.reply({content:'You do not have permission to log warrants.', flags: MessageFlags.Ephemeral});
      }








      const username = interaction.options.getString('user');
      const charges = interaction.options.getString('charges');
      const warrantId = generateWarrantID();








      const embed = new EmbedBuilder()
        .setTitle('New Warrant')
        .setDescription(`**ID:** ${warrantId}\n**Suspect:** ${username}\n**Charges:** ${charges}`)
        .setColor('#95A5A6')
        .setThumbnail('https://media.discordapp.net/attachments/1410429525329973379/1414810355980304486/briarfield_county.png?ex=68efb992&is=68ee6812&hm=28106432618af10c82fd63ee23c673aeb3001f3cdead2f4ec0efed6fe8ed1025&=&format=webp&quality=lossless')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:`Executed by ${interaction.user.tag}`})
        .setTimestamp();








      const completedButton = new ButtonBuilder()
        .setCustomId(`warrant_completed_${warrantId}`)
        .setLabel('Completed')
        .setStyle(ButtonStyle.Success);








      const removeButton = new ButtonBuilder()
        .setCustomId(`warrant_remove_${warrantId}`)
        .setLabel('Remove')
        .setStyle(ButtonStyle.Danger);








      const buttonRow = new ActionRowBuilder()
        .addComponents(completedButton, removeButton);








      const warrantChannelId = '1412528915381092462';
      const warrantAnnounceChannelId = '1428920503438934046';








      const warrantChannel = await interaction.client.channels.fetch(warrantChannelId);
      const warrantAnnounceChannel = await interaction.client.channels.fetch(warrantAnnounceChannelId);
      
      if(warrantChannel) {
        await warrantChannel.send({embeds:[embed], components:[buttonRow]});
      }
      
      if(warrantAnnounceChannel) {
        await warrantAnnounceChannel.send({embeds:[embed], components:[buttonRow]});
      }








      if(warrantChannel || warrantAnnounceChannel) {
        const logs = loadLogs();
        logs.warrants.push({id: warrantId, username, charges, moderator: interaction.user.id, timestamp: new Date().toISOString()});
        saveLogs(logs);
        await interaction.reply({content:`Warrant logged successfully for ${username}.`, flags: MessageFlags.Ephemeral});
      } else {
        await interaction.reply({content:'Failed to log warrant: channels not found.', flags: MessageFlags.Ephemeral});
      }
    }








    else if(cmd==='statistics'){
      if(!interaction.member.roles.cache.some(r => r.id === '1410486708998373387')){
        return interaction.reply({content:'You do not have permission to view statistics.', flags: MessageFlags.Ephemeral});
      }








      const logs = loadLogs();
      const userCitations = logs.citations.filter(c => c.moderator === interaction.user.id);
      const userArrests = logs.arrests.filter(a => a.moderator === interaction.user.id);
      const userWarrants = logs.warrants.filter(w => w.moderator === interaction.user.id);








      const embed = new EmbedBuilder()
        .setTitle('Your Statistics')
        .setColor('#95A5A6')
        .addFields(
          {name:'Citations Issued',value:`${userCitations.length}`,inline:true},
          {name:'Arrests Issued',value:`${userArrests.length}`,inline:true},
          {name:'Warrants Issued',value:`${userWarrants.length}`,inline:true}
        )
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:'BCSO Utilities'})
        .setTimestamp();








      await interaction.reply({embeds:[embed], flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='training-vote'){
      const allowedTrainingRoles = ['1405655436585205846', '1405655436564107365'];
      if(!interaction.member.roles.cache.some(r => allowedTrainingRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      const embed = new EmbedBuilder()
        .setTitle('BCSO Cadet Training Vote')
        .setDescription(`A Cadet Training Vote has been initiated by ${interaction.user} if you are a <@&1405655436522422325> and a <@&1405655436522422327> please mark yourself as attending to join the upcoming Deputy Training. This training will start at the time indicated by the trainer who initiated the training. If you have marked yourself attending, please ensure the following by the time the training will start.\n\n• Ready and in the department training server.\n• Spawned in the Crown Victoria with the correct livery and accessories in accordance to the SOP.\n• M4A1 in trunk. Have equipped the baton, pepper spray, taser, handcuffs, MDT, Glock 19/Shield 9, duty belt, and flashlight.\n• Ready and seated in the briefing room.`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655437885313137/1428915733814972579/CADET_TRAINING_6.png?ex=68f43cfa&is=68f2eb7a&hm=2a18605391d77fca909d17b822db664e86bb362bfc91db9cfaa9b5844a8a0989&=&format=webp&quality=lossless&width=1973&height=275')
        .setTimestamp();








      const trainingChannelId = '1405655437717803019';
      const trainingChannel = await interaction.client.channels.fetch(trainingChannelId);
      
      if(!trainingChannel) {
        return interaction.reply({content:'Training channel not found.', flags: MessageFlags.Ephemeral});
      }








      const attendButton = new ButtonBuilder()
        .setCustomId(`training_attend_PLACEHOLDER`)
        .setLabel('Attending')
        .setStyle(ButtonStyle.Success);








      const viewButton = new ButtonBuilder()
        .setCustomId(`training_view_PLACEHOLDER`)
        .setLabel('View Attendance')
        .setStyle(ButtonStyle.Secondary);








      const buttonRow = new ActionRowBuilder()
        .addComponents(attendButton, viewButton);








      const message = await trainingChannel.send({
        content: '<@&1405655436522422325>',
        embeds: [embed],
        components: [buttonRow],
        allowedMentions: { roles: ['1405655436522422325'] }
      });








      const updatedAttendButton = new ButtonBuilder()
        .setCustomId(`training_attend_${message.id}`)
        .setLabel('Attending')
        .setStyle(ButtonStyle.Success);








      const updatedViewButton = new ButtonBuilder()
        .setCustomId(`training_view_${message.id}`)
        .setLabel('View Attendance')
        .setStyle(ButtonStyle.Secondary);








      const updatedButtonRow = new ActionRowBuilder()
        .addComponents(updatedAttendButton, updatedViewButton);








      await message.edit({ components: [updatedButtonRow] });








      trainingAttendees.set(message.id, new Set());








      await interaction.reply({content:'Training vote initiated successfully!', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='training-start'){
      const allowedTrainingRoles = ['1405655436585205846', '1405655436564107365'];
      if(!interaction.member.roles.cache.some(r => allowedTrainingRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      let attendeesList = '';
      let latestMessageId = null;
      let latestTimestamp = 0;
      
      for(const [messageId, attendees] of trainingAttendees.entries()) {
        const timestamp = Number((BigInt(messageId) >> 22n) + 1420070400000n);
        if(timestamp > latestTimestamp && attendees.size > 0) {
          latestTimestamp = timestamp;
          latestMessageId = messageId;
        }
      }
      
      if(latestMessageId && trainingAttendees.get(latestMessageId).size > 0) {
        const attendees = trainingAttendees.get(latestMessageId);
        attendeesList = Array.from(attendees).map(id => `<@${id}>`).join(' ');
      }








      const embed = new EmbedBuilder()
        .setTitle('BCSO Cadet Training Start')
        .setDescription(`A Cadet Training has started by ${interaction.user}. If you are a <@&1405655436522422327> and <@&1405655436522422325> and you've marked yourself as attending to the vote, you are required to join the training. Please ensure the following to get ready for the training.\n\n• Ready and in the department training server.\n• Spawned in the Crown Victoria with the correct livery and accessories in accordance to the SOP.\n• M4A1 in trunk. Have equipped the baton, pepper spray, taser, handcuffs, MDT, Glock 19/Shield 9, duty belt, and flashlight.\n• Ready and seated in the briefing room.`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655437885313137/1428915825536008245/CADET_TRAINING_7.png?ex=68f43d10&is=68f2eb90&hm=f0e379bc6bfd0673657d1b5992d60fa753def7ca215de0af99826826cb6463f4&=&format=webp&quality=lossless&width=1973&height=275')
        .setTimestamp();








      const trainingChannelId = '1405655437717803019';
      const trainingChannel = await interaction.client.channels.fetch(trainingChannelId);
      
      if(!trainingChannel) {
        return interaction.reply({content:'Training channel not found.', flags: MessageFlags.Ephemeral});
      }








      const mentionContent = attendeesList ? `<@&1405655436522422325> ${attendeesList}` : '<@&1405655436522422325>';








      await trainingChannel.send({
        content: mentionContent,
        embeds: [embed],
        allowedMentions: { roles: ['1405655436522422325'], users: latestMessageId ? Array.from(trainingAttendees.get(latestMessageId)) : [] }
      });








      await interaction.reply({content:'Training started successfully!', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='training-end'){
      const allowedTrainingRoles = ['1405655436585205846', '1405655436564107365'];
      if(!interaction.member.roles.cache.some(r => allowedTrainingRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      const embed = new EmbedBuilder()
        .setTitle('Cadet Training Ended')
        .setDescription('The recent cadet training has now concluded. Thank you to all the cadets that have attended, your results will be posted shortly in https://discord.com/channels/1405655436467634236/1427793663936823436.\n\n We appreciate your dedication and hard work during the training session! If you have any questions or feedback, please feel free to reach out to your trainers.')
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655437885313137/1428915916128915601/CADET_TRAINING_8.png?ex=68f43d26&is=68f2eba6&hm=2a159302f76727b5a70b6b20e9044a36f01c49212caaf2d4257a948b90b74812&=&format=webp&quality=lossless&width=1973&height=275')
        .setFooter({text:`Concluded by ${interaction.user.tag}`})
        .setTimestamp();








      const trainingChannelId = '1405655437717803019';
      const trainingChannel = await interaction.client.channels.fetch(trainingChannelId);
      
      if(!trainingChannel) {
        return interaction.reply({content:'Training channel not found.', flags: MessageFlags.Ephemeral});
      }








      await trainingChannel.send({embeds: [embed]});








      trainingAttendees.clear();








      await interaction.reply({content:'Training ended successfully and attendance reset!', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='award'){
      const allowedAwardRoles = ['1405655436585205846'];
      if(!interaction.member.roles.cache.some(r => allowedAwardRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      const targetUser = interaction.options.getUser('user');
      const awardType = interaction.options.getString('type');








      const embed = new EmbedBuilder()
        .setTitle('Briarfield County Sheriff\'s Office Award')
        .setDescription(`Please congratulate ${targetUser} for earning the ${awardType}!\n\nCongratulations ${targetUser} for achieving this milestone within your career in BCSO. Thank you for your hard work and dedication to the department.`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1410429525329973379/1420971878981570622/CADET_TRAINING.png?ex=68efba70&is=68ee68f0&hm=91677fa47a337403cc4804fa00e289e23a6f9288aeed39037d10c3bcc0e6a2e0&=&format=webp&quality=lossless')
        .setFooter({text:`Feel free to congratulate them in「💬」public-chat`})
        .setTimestamp();








      const awardChannelId = '1405655437033996493';
      const awardChannel = await interaction.client.channels.fetch(awardChannelId);
      
      if(!awardChannel) {
        return interaction.reply({content:'Award channel not found.', flags: MessageFlags.Ephemeral});
      }








      await awardChannel.send({
        content: `${targetUser}`,
        embeds: [embed]
      });








      await interaction.reply({content:`Successfully awarded ${targetUser.tag} with ${awardType}!`, flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='deployment-vote'){
      const allowedDeploymentRoles = ['1405655436538941570', '1405655436585205846', '1405655436538941569'];
      if(!interaction.member.roles.cache.some(r => allowedDeploymentRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }




      const embed = new EmbedBuilder()
        .setTitle('<:checklist:1428897204688650321> CRU Deployment - Vote')
        .setDescription(`> A CRU Deployment vote has been initiated by ${interaction.user} Please mark yourself attending to join the upcoming deployment. In order for this deployment to start, it'll require at least 2+ operators attending.\n\n **If you mark yourself as attending, you are required to join the deployment.**`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655438787346437/1428906035451527218/CRITICAL_RESPONSE_8.png?ex=68f433f2&is=68f2e272&hm=394d057e84ee31d06b3b5252c2ba00da7be4f64b5dcf51a01b7ca46317478f16&=&format=webp&quality=lossless&width=3440&height=680')
        .setTimestamp();








      const deploymentChannelId = '1405655438787346432';
      const deploymentChannel = await interaction.client.channels.fetch(deploymentChannelId);
      
      if(!deploymentChannel) {
        return interaction.reply({content:'Deployment channel not found.', flags: MessageFlags.Ephemeral});
      }








      const attendButton = new ButtonBuilder()
        .setCustomId(`deployment_attend_PLACEHOLDER`)
        .setLabel('Attending')
        .setStyle(ButtonStyle.Success);








      const viewButton = new ButtonBuilder()
        .setCustomId(`deployment_view_PLACEHOLDER`)
        .setLabel('View Attendance')
        .setStyle(ButtonStyle.Secondary);








      const buttonRow = new ActionRowBuilder()
        .addComponents(attendButton, viewButton);








      const message = await deploymentChannel.send({
        content: '<@&1410480565492383754>',
        embeds: [embed],
        components: [buttonRow],
        allowedMentions: { roles: ['1410480565492383754'] }
      });








      const updatedAttendButton = new ButtonBuilder()
        .setCustomId(`deployment_attend_${message.id}`)
        .setLabel('Attending')
        .setStyle(ButtonStyle.Success);








      const updatedViewButton = new ButtonBuilder()
        .setCustomId(`deployment_view_${message.id}`)
        .setLabel('View Attendance')
        .setStyle(ButtonStyle.Secondary);








      const updatedButtonRow = new ActionRowBuilder()
        .addComponents(updatedAttendButton, updatedViewButton);








      await message.edit({ components: [updatedButtonRow] });








      deploymentAttendees.set(message.id, new Set());








      await interaction.reply({content:'Deployment vote initiated successfully!', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='deployment-start'){
      const allowedDeploymentRoles = ['1405655436538941570', '1405655436585205846', '1405655436538941569'];
      if(!interaction.member.roles.cache.some(r => allowedDeploymentRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }








      let attendeesList = '';
      let latestMessageId = null;
      let latestTimestamp = 0;
      
      for(const [messageId, attendees] of deploymentAttendees.entries()) {
        const timestamp = Number((BigInt(messageId) >> 22n) + 1420070400000n);
        if(timestamp > latestTimestamp && attendees.size > 0) {
          latestTimestamp = timestamp;
          latestMessageId = messageId;
        }
      }
      
      if(latestMessageId && deploymentAttendees.get(latestMessageId).size > 0) {
        const attendees = deploymentAttendees.get(latestMessageId);
        attendeesList = Array.from(attendees).map(id => `<@${id}>`).join(' ');
      }




      const embed = new EmbedBuilder()
        .setTitle('<:alert:1428897341355851856> CRU Deployment - Start')
        .setDescription(`> A CRU Deployment has now commenced by ${interaction.user} If you have marked yourself attending to the deployment vote, you are required to attend this deployment.\n\n > Please ensure you are in proper uniform and have all necessary equipment, then head your way down to the briefing room for assignments and deployment details.`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655438787346437/1428906035451527218/CRITICAL_RESPONSE_8.png?ex=68f433f2&is=68f2e272&hm=394d057e84ee31d06b3b5252c2ba00da7be4f64b5dcf51a01b7ca46317478f16&=&format=webp&quality=lossless&width=1973&height=275')
        .setTimestamp();








      const deploymentChannelId = '1405655438787346432';
      const deploymentChannel = await interaction.client.channels.fetch(deploymentChannelId);
      
      if(!deploymentChannel) {
        return interaction.reply({content:'Deployment channel not found.', flags: MessageFlags.Ephemeral});
      }








      const mentionContent = attendeesList ? `<@&1410480565492383754> ${attendeesList}` : '<@&1410480565492383754>';








      await deploymentChannel.send({
        content: mentionContent,
        embeds: [embed],
        allowedMentions: { roles: ['1410480565492383754'], users: latestMessageId ? Array.from(deploymentAttendees.get(latestMessageId)) : [] }
      });








      deploymentAttendees.clear();








      await interaction.reply({content:'Deployment started successfully!', flags: MessageFlags.Ephemeral});
    }








    else if(cmd==='deployment-end'){
      const allowedDeploymentRoles = ['1405655436538941570', '1405655436585205846', '1405655436538941569'];
      if(!interaction.member.roles.cache.some(r => allowedDeploymentRoles.includes(r.id))){
        return interaction.reply({content:'You do not have permission to use this command.', flags: MessageFlags.Ephemeral});
      }




      const embed = new EmbedBuilder()
        .setTitle('<:checkmark:1428897510037913736> CRU Deployment - Ended')
        .setDescription(`> The recent CRU Deployment has now concluded by ${interaction.user}.\n\n > Thank you to all operators who have attended the deployment. If you missed this one, don't worry! You'll be able to attend the other deployments usually hosted every other day unless said otherwise by CRU Command.`)
        .setColor('#95A5A6')
        .setImage('https://media.discordapp.net/attachments/1405655438787346437/1428906035451527218/CRITICAL_RESPONSE_8.png?ex=68f433f2&is=68f2e272&hm=394d057e84ee31d06b3b5252c2ba00da7be4f64b5dcf51a01b7ca46317478f16&=&format=webp&quality=lossless&width=1973&height=275')
        .setFooter({text:`Concluded by ${interaction.user.tag}`})
        .setTimestamp();








      const deploymentChannelId = '1405655438787346432';
      const deploymentChannel = await interaction.client.channels.fetch(deploymentChannelId);
      
      if(!deploymentChannel) {
        return interaction.reply({content:'Deployment channel not found.', flags: MessageFlags.Ephemeral});
      }








      await deploymentChannel.send({embeds: [embed]});








      await interaction.reply({content:'Deployment ended successfully!', flags: MessageFlags.Ephemeral});
    }








  }catch(err){
    console.error(err);
    if(!interaction.replied && !interaction.deferred){
      await interaction.reply({content:'An error occurred while executing this command.', flags: MessageFlags.Ephemeral});
    }
  }
});








const app = express();
app.get('/',(req,res)=>res.send('Bot is alive!'));
app.listen(3000,()=>console.log('Web server running on port 3000'));








client.login(token);
