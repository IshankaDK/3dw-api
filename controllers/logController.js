import connection from "../database.js";
import ip from "ip";

export const allLogs = (req, res) => {
	let q = `SELECT * FROM logs l
    left join users u on (l.user_id = u.user_id)`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			let obj = [];
			result.forEach((elm) => {
				obj.push({
					user_id: elm.user_id,
					user_name: elm.user_name,
					event: elm.event_name,
					date: elm.event_time,
					ip: elm.ip_address,
				});
			});
			res.json(obj);
		}
	});
};

export const logsOf = (req, res) => {
	let q = `SELECT * FROM logs l
    left join users u on (l.user_id = u.user_id)
    WHERE u.user_name = ? OR u.user_id = ?`;

	connection.query(q, [req.body.user_name, req.body.user_id], (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			let obj = [];
			result.forEach((elm) => {
				obj.push({
					user_id: elm.user_id,
					user_name: elm.user_name,
					event: elm.event_name,
					date: elm.event_time,
					ip: elm.ip_address,
				});
			});
			res.json(obj);
		}
	});
};

export const createLog = (user_id, event_name, callback) => {
	let q = `INSERT INTO logs (user_id, event_name, ip_address) VALUE (?, ?, ?)`;

	connection.query(q, [user_id, event_name, ip.address()], (err) => callback(err));
};

export const deleteAllLogs = (req, res) => {
	let q = `DELETE FROM logs`;

	connection.query(q, (err) => res.send(err ? { error: err } : "Done"));
};

export const deleteLogs = (req, res) => {
	let days = req.body.days || 30;
	let q = `DELETE FROM logs WHERE NOW() > event_time + INTERVAL ? DAY`;

	connection.query(q, [days], (err) => res.send(err ? { error: err } : "Done"));
};
