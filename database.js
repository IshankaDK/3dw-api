import { createConnection } from "mysql";

const host = "localhost";
const port = "3306";
const user = "root";
const password = "727800";
const database = "3dw";

const connection = createConnection({
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
});

connection.connect((err) => {
  if(err){
    return console.error("Can't connect to the database. Error: " + err);
  }

  return console.log("MySQL Database connected!");
});

export default connection;