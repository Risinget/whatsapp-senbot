const dotenv = require("dotenv");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { mainModule } = require("process");
const delay = require("./helpers.js");
const path = require("path");
dotenv.config();
const PATH_BASE = __dirname
const TOKEN = process.env.TOKEN;
const NUMBER_ID = process.env.NUMBER_ID;
const URL_BASE = `https://graph.facebook.com/v19.0/${NUMBER_ID}`;

// Funcion para subir la imagen a la API de WhatsApp
async function uploadImage(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("messaging_product", "whatsapp");

  const headers = {
    ...form.getHeaders(),
    Authorization: `Bearer ${TOKEN}`,
  };

  try {
    const response = await axios.post(`${URL_BASE}/media`, form, { headers });
    return response.data.id; // Devuelve el ID de la imagen
  } catch (error) {
    console.log(error);
  }
}

// Funcion para guardar el ID de la imagen en un archivo txt
function saveIdImageOnTxt(id, image_original) {
  let text = `IMAGE ID: ${id} IMAGE_ORIGINAL: ${image_original}\n`;
  fs.appendFileSync(
    "images_ids.txt",
    text
  );
  console.log('Saved',text);
}


const main = async () => {
  // Aqui las rutas de las imagenes de las cuales quieres obtener su ID
  const images_paths = [
    `${__dirname}/images/image_1.png`,
    `${__dirname}/images/txt_test.txt`,
    // "/images/image_2.png",
    // "/images/image_3.png",
  ];

  // Iterarmos sobre las imagenes para subirla a la API de WhatsApp y las guardara en un archivo txt
  for (const image of images_paths) {
    const image_id = await uploadImage(image);
    console.log(image_id);
    saveIdImageOnTxt(image_id, image);

    await delay(3000);
    //
  }
}

main()
