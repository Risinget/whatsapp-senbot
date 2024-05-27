const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const delay = require("./helpers.js");
const path = require("path");
dotenv.config();

const PATH_BASE = __dirname;
const TOKEN = process.env.TOKEN;
const NUMBER_ID = process.env.NUMBER_ID;
const URL_BASE = `https://graph.facebook.com/v19.0/${NUMBER_ID}`;

// Funcion para subir el archivo a la API de WhatsApp
async function uploadMedia(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("messaging_product", "whatsapp");

  const headers = {
    ...form.getHeaders(),
    Authorization: `Bearer ${TOKEN}`,
  };

  try {
    const response = await axios.post(`${URL_BASE}/media`, form, { headers });
    return response.data.id; // Devuelve el ID del archivo
  } catch (error) {
    console.log(error);
  }
}

// Funcion para determinar el tipo de archivo basado en su extensión
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".txt":
    case ".pdf":
    case ".docx":
    case ".xlsx":
    case ".pptx":
    case ".zip":
      return "DOCUMENT";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".svg":
      return "IMAGEN";
    case ".mp4":
      return "VIDEO";
    case ".mp3":
    case ".wav":
    case ".opus":
      return "AUDIO";
    default:
      return "DESCONOCIDO";
  }
}

// Funcion para guardar el ID del archivo en un archivo txt con su tipo correspondiente
function saveIdMediaOnTxt(id, media_original, type) {
  let text = `${type} ID: ${id} MEDIA_ORIGINAL: ${media_original}\n`;
  fs.appendFileSync("media_ids.txt", text);
  console.log("Saved", text);
}

const main = async () => {
  // Aqui las rutas de los archivos de los cuales quieres obtener su ID
  const media_paths = [
    // `${__dirname}/media/image_1.png`,
    // `${__dirname}/media/txt_test.txt`,
    // `${__dirname}/media/video.mp4`,
    `${__dirname}/media/audio.opus`,
    `${__dirname}/media/audio_musica.mp3`
  ];

  // Iteramos sobre los archivos para subirlos a la API de WhatsApp y guardarlos en un archivo txt
  for (const media of media_paths) {
    const media_id = await uploadMedia(media);
    console.log(media_id);
    const type = getFileType(media);
    saveIdMediaOnTxt(media_id, media, type);

    await delay(3000);
  }
};

main();
