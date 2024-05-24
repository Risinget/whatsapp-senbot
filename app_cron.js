const cron = require("node-cron");

const cronMessagesSender = async () => {
  // Variables para la hora, minuto y segundo
  const hour = 19; // 7 PM
  const minute = 0;
  const second = 0;

  // Definir la función que quieres ejecutar
  const myScheduledFunction = () => {
    console.log("Ejecutando la función programada a las 7 PM", new Date());
  };

  // Crear la expresión cron usando las variables
  const cronExpression = `${second} ${minute} ${hour} * * *`;

  // Programar la tarea para que se ejecute todos los días a la hora especificada
  cron.schedule(cronExpression, myScheduledFunction, {
    scheduled: true,
    timezone: "America/La_Paz", // Ajusta la zona horaria según tu ubicación
  });

  // Mantener el script en ejecución
  console.log(
    `Tarea programada para ejecutarse todos los días a las ${hour}:${minute}:${second}`
  );
};

// Llamar a la función para iniciar la programación
cronMessagesSender();
