const { createBot, createProvider, createFlow, addKeyword, EVENTS} = require('@bot-whatsapp/bot')
const dotenv = require('dotenv') 
const MetaProvider = require('@bot-whatsapp/provider/meta')
const MySQLAdapter = require('@bot-whatsapp/database/mysql')
const mysql = require("mysql2");
const axios = require("axios");
const cron = require("node-cron");
const delay = require("./helpers.js");
const { createClient } = require("@libsql/client/web");

dotenv.config()
/**
 * Declaramos las conexiones de MySQL
 */
const TOKEN = process.env.TOKEN;
const NUMBER_ID = process.env.NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const URL_BASE = `https://graph.facebook.com/v19.0/${NUMBER_ID}`;

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const saveNumber = async (number) => {
  if (!number) {
    return 0;
  }
  const rowNumber = await client.execute({
    sql: "SELECT * FROM numbers WHERE number = :number",
    args: { number: number },
  });

  if (rowNumber.rows.length > 0) {
    return -1;
  }
  try {
    const isSaved = await client.execute({
      sql: "INSERT INTO numbers VALUES (:id_number, :number)",
      args: { id_number: null, number: number },
    });
    console.log("Number saved successfully.");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT") {
      return -1;
    } else {
      console.error("Error:", error);
    }
  }
  return 1;
};

const getNumbers = async () => {
  const numbers = await client.execute("SELECT * FROM numbers");
  return numbers.rows;
};


const sendMessageTo = async (number, message) => {
  const data = {
    messaging_product: "whatsapp",
    to: `591${number}`,
    type: "image",
    image: {
      id: message.image_id,
      caption: message.message,
    },
  };
  const Headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };

  if (!number) {
    throw new Error("No se ha proporcionado un número");
  }

  if (!message) {
    throw new Error("No se ha proporcionado un mensaje");
  }

  const response = await axios.post(`${URL_BASE}/messages `, data, {
    headers: Headers,
  });
  console.log(response.data);
  return response.data;
};


const sendMessages = async () => {


    const numbers = await getNumbers();

    const messages = [
        {
        image_id: "781952837249770",
        message: "Message random 1",
        },
        {
        image_id: "740110291531552",
        message: "Message random 2",
        },
        {
        image_id: "7809338669131725",
        message: "Message random 3",
        },
    ];

    function getRandomMessage(messages) {
        const randomIndex = Math.floor(Math.random() * messages.length);
        return messages[randomIndex];
    }

    const message_with_image = getRandomMessage(messages);
    for (const rowNumber of numbers) {
        const number = rowNumber.number;
        const ctx = await sendMessageTo(number, message_with_image);
        console.log("Mensaje enviado a", number, ctx);
        await delay(3000); // Espera 3 segundos
    }

}


const cronMessagesSender = async (h,m,s) => {
  // Variables para la hora, minuto y segundo
  const hour = h; // 7 PM
  const minute = m;
  const second = s;

  // Crear la expresión cron usando las variables
  const cronExpression = `${second} ${minute} ${hour} * * *`;

  // Programar la tarea para que se ejecute todos los días a la hora especificada
  cron.schedule(
    cronExpression,
    async () => {
      console.log("Ejecutando tarea programada...");
      await sendMessages();
    },
    {
      scheduled: true,
      timezone: "America/La_Paz", // Ajusta la zona horaria según tu ubicación
    }
  );

  // Mantener el script en ejecución
  console.log(
    `Tarea programada para ejecutarse todos los días a las ${hour}:${minute}:${second}`
  );
};

function extractEightDigitPhoneNumber(message) {
  // Expresión regular para buscar exactamente 8 dígitos seguidos
  const phoneRegex = /\b\d{8}\b/;

  // Buscar el número de teléfono en el mensaje
  const match = message.match(phoneRegex);

  // Si se encuentra un número, retornarlo; de lo contrario, retornar null
  return match ? match[0] : null;
}


const flowPrincipal = addKeyword(EVENTS.WELCOME).addAction(
  async (ctx, { flowDynamic }) => {
    // guardar la BD

    let phoneNumber = extractEightDigitPhoneNumber(ctx.body)
    const isSaved = await saveNumber(phoneNumber);
    // 1 = exito, -1 = ya existe, 0 = no es valido, null = no se ha proporcionado un numero
    if (isSaved == 1) {
      return flowDynamic(`Su número ha sido registrado: ${phoneNumber}`);
    } else if (isSaved == -1) {
      return flowDynamic(`El número ya ha sido registrado: ${phoneNumber}`);
    } else if (isSaved == 0) {
      return flowDynamic("No hay un número válido, escriba un número de 8 dígitos.");
    } else if (isSaved == null) {
      return flowDynamic("No se ha proporcionado un número.");
    } else {
      return flowDynamic("Ha ocurrido un error.");
    }

  }
);

const main = async () => {

    const adapterDB = new MySQLAdapter({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        database: MYSQL_DB_NAME,
        password: MYSQL_DB_PASSWORD,
        port: MYSQL_DB_PORT,
    })
    const adapterFlow = createFlow([flowPrincipal])

    const adapterProvider = createProvider(MetaProvider, {
      jwtToken: TOKEN,
      numberId: NUMBER_ID,
      verifyToken: VERIFY_TOKEN,
      version: "v16.0",
    });

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })


}

main()
cronMessagesSender(21, 1, 10);
