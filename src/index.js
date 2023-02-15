require("dotenv").config();

const tmi = require("tmi.js");

const { hexToRGB, COLORS, colors_available } = require("./hue_colors");
const { updateColorLights, setColorLoop } = require("./hue_commands");

const client = new tmi.Client({
  options: { debug: process.env.DEBUG == "true", messagesLogLevel: "info" },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: process.env.TWITCH_USER,
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: process.env.TWITCH_CHANNELS.split(","),
});

client.connect().catch(console.error);

client.on("message", (channel, tags, message, self) => {
  // !luz rgb(255, 255, 255)
  // !luz #ffffff #fff
  // !luz azul
  try {
    message = message.toLocaleLowerCase();
    let rgbColorMessage, colorMessage;
    if (message.startsWith("!luz")) {
      // comando para cambiar la luz
      colorMessage = message.split("!luz ")[1];
      if (colorMessage) {
        colorMessage = colorMessage.toUpperCase();
        if (COLORS.hasOwnProperty(colorMessage)) {
          rgbColorMessage = COLORS[colorMessage];
        }
      }

      if (message.indexOf("rgb") !== -1) {
        rgbColorMessage = colorMessage;
      }
      if (message.indexOf("#") !== -1) {
        rgbColorMessage = hexToRGB(colorMessage);
      }
      if (message.indexOf("off") !== -1) {
        rgbColorMessage = hexToRGB("#000000");
      }

      if (rgbColorMessage) {
        updateColorLights(rgbColorMessage);
      } else {
        client
          .say(
            channel,
            `@${
              tags.username
            }, Cambia el color de las luces de mi fondo con !luz {color},
            Los colores disponibles son: ${colors_available().join()}.
            Si quieres alguno especial puedes poner el hexadecimal!!`
          )
          .catch(console.log);
      }
    }
    // !loop
    if (message.startsWith("!loop")) {
      loopState = message.split("!loop ")[1];
      setColorLoop(loopState == "start");
    }
  } catch (error) {
    console.error(error.message);
    client
      .say(channel, `@${tags.username} comando mal ejecutado uwu`)
      .catch(console.log);
  }
});
