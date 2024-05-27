const dotenv = require("dotenv");
dotenv.config();
const { createClient } = require("@libsql/client/web");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const saveNumber = async (number) => {

  if(!number){
    return 0;
  }
  const rowNumber = await client.execute({
    sql: "SELECT * FROM numbers WHERE number = :number",
    args: {number: number},
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
      return -1
    } else {
      console.error("Error:", error);
    }
  }
  return 1;
};

const getNumbers = async () => {
  const numbers = await client.execute("SELECT * FROM numbers");
  return numbers.rows;
}

const main = async () => {

  console.log("----------");
  const numbers = await getNumbers();
  console.log(numbers);
  console.log("----------");

  for(const number of numbers){
    console.log(number.number);
    console.log("----------");
    
  }
  const isSaved = await saveNumber(76623148);
  console.log(isSaved);


  if (isSaved === 1) {
    console.log("Number saved successfully.");
  } else if (isSaved === -1) {
    console.log("Number already exists.");
  } else if (isSaved === 0) {
    console.log("No number to save.");
  } else {
    console.log("Error saving number.");
  }


};

main();
