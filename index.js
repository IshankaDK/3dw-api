import express from "express";
import { config } from "dotenv";
import users from "./routes/users.js";
import groups from "./routes/groups.js";
import logs from "./routes/logs.js";
import bodyParser from "body-parser";
import cors from 'cors'


config();
const app = express();
app.use(cors({
	// origin: 'http://192:168:1:104:3000'
	origin:'*'
  }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use("/user", users);
app.use("/group", groups);
app.use("/log", logs);

app.listen(5000, () => {
	console.log("Server started!");
});
