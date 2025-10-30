import 'dotenv/config';
import { REST, Routes } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

try {
  const commands = [
    {
      name: 'ping',
      description: 'Replies with pong!'
    }
  ];

  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );

  console.log('✅ Successfully registered /ping command to your guild!');
} catch (error) {
  console.error('❌ Failed to register:', error);
}
