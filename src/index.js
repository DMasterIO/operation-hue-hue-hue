require("dotenv").config();

const tmi = require("tmi.js");

const { hexToRGB, COLORS } = require("./hue_colors");
const { updateColorLights, setColorLoop } = require("./hue_commands");

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  channels: process.env.TWITCH_CHANNELS.split(","),
});

client.connect();

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
    }
  }
  // !loop
  if (message.startsWith("!loop")) {
    loopState = message.split("!loop ")[1];
    setColorLoop(loopState == "start");
  }
});
