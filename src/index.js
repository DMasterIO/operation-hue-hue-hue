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

  let rgbColorMessage;
  if (message.startsWith("!luz")) {
    // comando para cambiar la luz
    colorMessage = message.split("!luz ")[1];
    if (colorMessage) {
      if (COLORS.hasOwnProperty(colorMessage.toUpperCase())) {
        rgbColorMessage = COLORS[colorMessage.toUpperCase()];
      }
    }

    if (message.indexOf("rgb") !== -1) {
      rgbColorMessage = colorMessage;
    }
    if (message.indexOf("#") !== -1) {
      rgbColorMessage = hexToRGB(message.split("!luz #")[1]);
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
});
