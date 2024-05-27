const mysql = require("mysql2");
const dotenv = require('dotenv')
const axios = require('axios')
const fs = require("fs");
const FormData = require("form-data");
const cron = require("node-cron");

// Dev data
const { numbers } = require("./data.js");
const delay = require('./helpers.js')

dotenv.config()
const MYSQL_DB_HOST = process.env.MYSQL_DB_HOST;
const MYSQL_DB_USER = process.env.MYSQL_DB_USER;
const MYSQL_DB_PASSWORD = process.env.MYSQL_DB_PASSWORD;
const MYSQL_DB_NAME = process.env.MYSQL_DB_NAME;
const MYSQL_DB_PORT = process.env.MYSQL_DB_PORT;

const TOKEN = process.env.TOKEN;
const NUMBER_ID = process.env.NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const URL_BASE = `https://graph.facebook.com/v19.0/${NUMBER_ID}`;

const conn = mysql.createConnection({
  host: MYSQL_DB_HOST,
  user: MYSQL_DB_USER,
  password: MYSQL_DB_PASSWORD,
  database: MYSQL_DB_NAME,
  port: MYSQL_DB_PORT,
});

const getNumbers = async () => {

    const [rows] = await conn.promise().query('SELECT * FROM numbers')

    return rows
}

const saveNumber = async (number) => {

    if (!number) {
        throw new Error('No se ha proporcionado un número')
    }
    await conn.promise().query('INSERT INTO numbers (number) VALUES (?)', [number])
    return true
}

const sendMessageTo = async (number, message) => {
  const data = {
    messaging_product: "whatsapp",
    to: number,
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

  return response.data;
};

const main = async () => {

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
    for(const number of numbers){
      const ctx = await sendMessageTo(number, message_with_image);
      console.log('Mensaje enviado a', number, ctx);
      await delay(3000); // Espera 3 segundos
    }
}


const cronMessagesSender = async () => {
  // Variables para la hora, minuto y segundo
  const hour = 20; // 7 PM
  const minute = 46;
  const second = 0;

  // Crear la expresión cron usando las variables
  const cronExpression = `${second} ${minute} ${hour} * * *`;

  // Programar la tarea para que se ejecute todos los días a la hora especificada
  cron.schedule(cronExpression, main, {
    scheduled: true,
    timezone: "America/La_Paz", // Ajusta la zona horaria según tu ubicación
  });

  // Mantener el script en ejecución
  console.log(
    `Tarea programada para ejecutarse todos los días a las ${hour}:${minute}:${second}`
  );
};
// main()
cronMessagesSender();