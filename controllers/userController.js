import connection from "../database.js";
import md5 from "md5";
import ip from "ip";
import jsonwebtoken from "jsonwebtoken";
import { createLog } from "./logController.js";

const SESSION_EXPIRES_WHEN = 480;

export const newUser = (req, res) => {
	let q = `INSERT INTO users (user_name, first_name, last_name, password, created_ip, last_active_ip, email, company) VALUES ?`;
	let ipa = ip.address();
	let values = [
		[
			req.body.user_name,
			req.body.first_name,
			req.body.last_name,
			md5(req.body.password),
			ipa,
			ipa,
			req.body.email,
			req.body.company,
		],
	];

	console.log(values);
	connection.query(q, [values], (err, result) => {
		if (err) {
			res.send({
				error: err,
				inserted: false,
			});
		} else {
			createLog(req.user_id, "REGISTERED : " + req.body.user_name, (err2) => {
				if (err2) {
					res.send({
						error: err2,
						inserted: true,
					});
				} else {
					res.send({
						inserted: true,
					});
				}
			});
		}
	});
};

export const login = (req, res) => {
	let user_name = req.body.user_name;
	let password = req.body.password;

	let q = "SELECT * FROM users WHERE user_name = ?";
	connection.query(q, [user_name], (err, result) => {
		if (err) {
			res.send({
				error: err,
				logged: false,
			});
		} else {
			if (result.length == 1) {
				if (password && result[0].password == md5(password)) {
					const token = jsonwebtoken.sign(
						{
							user_name: user_name,
							user_id: result[0].user_id,
						},
						process.env.JWT_SECRET_KEY,
						{
							expiresIn: "1d",
						}
					);

					q = `UPDATE users SET last_active_ip = ?, 
                    session_expiry_date = DATE_ADD(NOW(), INTERVAL ${SESSION_EXPIRES_WHEN} DAY), 
                    last_login = NOW() WHERE user_name = ?`;

					connection.query(q, [ip.address(), user_name], (err2) => {
						if (err2) {
							res.send({
								logged: false,
								error: err2,
							});
						} else {
							createLog(result[0].user_id, "LOGIN", (err3) => {
								if (err3) {
									res.send({
										logged: false,
										error: err3,
									});
								} else {
									res.send({
										token: token,
										logged: true,
									});
								}
							});
						}
					});
				} else {
					res.send({
						logged: false,
						error: "Wrong password",
					});
				}
			} else {
				res.send({
					logged: false,
					error: "User does not exist",
				});
			}
		}
	});
};

export const stillAlive = (req, res) => {
	let user_name = req.user_name;
	let q = "UPDATE users SET last_active_date = CURRENT_TIMESTAMP WHERE user_name = ?";

	connection.query(q, [user_name], (err) => {
		if (err) {
			res.send({
				updated: false,
				error: err,
			});
		} else {
			res.send({
				updated: true,
			});
		}
	});
};

export const onlineUsers = (req, res) => {
	let timeout = process.env.STILL_ALIVE_TIME;
	let q = "SELECT user_id, user_name FROM users WHERE last_active_date > NOW() - INTERVAL ? SECOND";
	connection.query(q, [parseInt(timeout)], (err, result) => {
		if (!err) {
			res.send({
				length: result.length,
				users: result,
			});
		}
	});
};

export const newUsersSinceLastVisit = (req, res) => {
	let q = `SELECT * FROM users 
    WHERE created_date > (SELECT last_login DAY FROM users WHERE user_name = ?)`;
	connection.query(q, [req.user_name], (err, results) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send({
				length: results.length,
			});
		}
	});
};

export const logout = (req, res) => {
	let q = "UPDATE users SET session_expiry_date = NULL WHERE user_name = ?";
	connection.query(q, [req.user_name], (err) => {
		if (err)
			res.send({
				error: err,
			});
		else {
			createLog(req.user_id, "LOGOFF", (err2) => {
				if (err2) {
					res.send({
						error: err2,
					});
				} else {
					res.send("Done");
				}
			});
		}
	});
};

export const lastVisitors = (req, res) => {
	let q = `SELECT user_id, user_name, status, last_login, created_date FROM users order by last_login desc LIMIT ?`;
	connection.query(q, [req.body.limit || 5], (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

export const lastRegisteredUsers = (req, res) => {
	let q = `SELECT user_id, user_name, status, last_login, created_date FROM users order by created_date desc LIMIT ?`;
	connection.query(q, [req.body.limit || 5], (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

export const deleteInactiveUsers = (req, res) => {
	let q = `DELETE FROM users WHERE NOW() > last_active_date + interval 30 day`;
	connection.query(q, (err) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send("Done");
		}
	});
};

export const usersTable = (req, res) => {
	let q = `SELECT user_id, user_name, status, email, created_date, last_login FROM users`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send(result);
		}
	});
};

export const usersCount = (req, res) => {
	let q = `SELECT COUNT(user_id) AS userCount FROM users`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send(result);
		}
	});
};

export const userData = (req, res) => {
	let q = `SELECT user_id, user_name, first_name, last_name, status, email, created_date, last_login, created_ip, last_active_ip
	FROM users WHERE user_name = ? OR user_id = ?`;
	connection.query(q, [req.params.user_name, req.params.user_id], (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

export const updateUser = (req, res) => {
	let q = `UPDATE users SET user_name = ?,company = ?,first_name = ?,last_name = ?,email = ?`;
	let values = [req.body.user_name, req.body.company, req.body.first_name, req.body.last_name, req.body.email];
	let pw_change = req.body.password != null && req.body.password != "";
	if (pw_change) {
		q += ", password = ?";
		values.push(md5(req.body.password));
	}
	values.push(req.body.of_user_name);
	values.push(req.body.of_user_id);
	q += " WHERE user_name = ? OR user_id = ?";
	connection.query(q, values, (err) => {
		if (err) res.send({ error: err });
		else if (!pw_change) {
			res.send("Done");
		} else {
			createLog(req.body.of_user_id, "PWD_CHANGED BY ADMIN", (err2) => {
				if (err2) {
					res.send({
						error: err2,
					});
				} else {
					res.send("Done");
				}
			});
		}
	});
};

export const usersAwaitingActivation = (req, res) => {
	let q = `SELECT user_id, user_name, email, created_date, created_ip FROM users WHERE status = 'Awaiting'`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

export const activateUser = (req, res) => {
	let users = req.body.user_ids;
	let q = "UPDATE users SET status = 'Registered' WHERE user_id in (?)";

	connection.query(q, [users], (err) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			users.forEach((elm) => {
				connection.query("SELECT user_name FROM users WHERE user_id = ?", [elm], (err2, result) => {
					if (!err2) createLog(req.user_id, "ACTIVATED USER : " + result[0].user_name);
				});
			});
			res.send("Done");
		}
	});
};

export const currentSessions = (req, res) => {
	let q = `SELECT user_name, last_active_ip, last_login,session_expiry_date FROM users WHERE session_expiry_date IS NOT NULL`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.json(result);
		}
	});
};

export const deleteAllSessions = (req, res) => {
	let q = `UPDATE users SET session_expiry_date = NULL`;

	connection.query(q, (err) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			createLog(req.user_id, "DELETED_ALL_SESSIONS", (err2) => {
				if (err2) {
					res.send({
						error: err2,
					});
				} else {
					res.send("Done");
				}
			});
		}
	});
};

export const deleteSessions = (req, res) => {
	let users = req.body.user_names;
	let q = `UPDATE users SET session_expiry_date = NULL WHERE user_name in ?`;

	connection.query(q, [[users]], (err) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send("Done");
		}
	});
};

export const currentGroups = (req, res) => {
	let user = req.body.user_id;
	let q = `SELECT * FROM users u
	left join user_groups ug on (u.user_id = ug.user_id)
	left join group_data gd on (ug.group_id = gd.group_id)
	where u.user_id = ?`;

	connection.query(q, [user], (err, result) => {
		if (err) {
			res.send({ error: err });
		} else {
			let obj = [];
			result.forEach((elm) => {
				obj.push({
					group_id: elm.group_id,
					group_name: elm.group_name,
					group_level: elm.group_level,
				});
			});
			res.json(obj);
		}
	});
};
