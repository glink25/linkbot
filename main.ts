import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { CONFIG } from './config';
import { stepper } from './stepper';

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'rich-text',
    description: '展示富文本消息的多样性',
  },
  {
    name: 'interaction',
    description: '展示连续交互',
  },
];

const registerCommands = async () => {
  const rest = new REST({
    version: '10',
    userAgentAppendix: 'DiscordBot',
  }).setToken(CONFIG.TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CONFIG.CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

registerCommands();
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'rich-text') {
    await interaction.reply(
      `機器人名稱：${client.user?.username}\n` +
        `機器人ＩＤ：${client.user?.id}\n` +
        `機器人建立時間：<t:${~~(
          (client.user?.createdTimestamp ?? 0) / 1000
        )}:R>\n` +
        `伺服器擁有者：<@${interaction.guild?.ownerId}>\n` +
        `伺服器人數：${interaction.guild?.memberCount}\n` +
        '链接：[bilibili](https://www.bilibili.com/video/BV1GJ411x7h7)'
    );
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'interaction') {
    stepper(interaction, {
      message: {
        content: '1+1=2对吗？',
        ephemeral: true, // 此消息仅用户自己可见，并且会在一段时间后自动消失。该消息无法被bot删除
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('1')
              .setLabel('Yes')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(false),
            new ButtonBuilder()
              .setCustomId('2')
              .setLabel('No')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(false)
          ),
        ],
      },
      matchers: [
        {
          case: '1',
          execute: () => {
            return {
              message: {
                content: 'You are right!' + '\n' + '3+4=7 对吗？',
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                      .setCustomId('3')
                      .setLabel('Yes')
                      .setStyle(ButtonStyle.Primary)
                      .setDisabled(false),
                    new ButtonBuilder()
                      .setCustomId('4')
                      .setLabel('No')
                      .setStyle(ButtonStyle.Secondary)
                      .setDisabled(false)
                  ),
                ],
                embeds: [],
              },
              matchers: [
                {
                  case: '3',
                  execute: () => {
                    return {
                      message: 'Your are right again!',
                    };
                  },
                },
                {
                  case: '4',
                  execute: () => {
                    return {
                      message: 'Your are wrong,sorry',
                    };
                  },
                },
              ],
            };
          },
        },
        {
          case: '2',
          execute: () => {
            return {
              message: {
                content: 'You are wrong!',
                components: [],
                embeds: [],
              },
            };
          },
        },
      ],
    });
  }
});

client.login(CONFIG.TOKEN);
