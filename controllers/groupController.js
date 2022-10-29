import connection from "../database.js";

export const createGroup = (req, res) => {
	let q = `INSERT INTO group_data (group_name, group_level) VALUE (?)`;

	connection.query(q, [[req.body.group_name, req.body.group_level]], (err) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			res.send("Done");
		}
	});
};

export const groupData = (req, res) => {
	let q = `SELECT * FROM group_data gd
    left join user_groups ug on (gd.group_id = ug.group_id)
    left join users u on (ug.user_id = u.user_id)`;

	connection.query(q, (err, result) => {
		if (err) {
			res.send({
				error: err,
			});
		} else {
			let obj = {};
			result.forEach((elm) => {
				let uo = {
					user_id: elm.user_id,
					user_name: elm.user_name,
				};
				if (!(elm.group_id in obj)) {
					obj[elm.group_id] = {
						group_id: elm.group_id,
						group_name: elm.group_name,
						group_level: elm.group_level,
						members: [uo],
					};
				} else {
					obj[elm.group_id].members.push(uo);
				}
			});
			let ret = [];
			for (let x in obj) {
				ret.push(obj[x]);

				if (req.body.group_id && x == req.body.group_id) {
					return res.send(obj[x]);
				}
			}

			res.json(ret);
		}
	});
};

export const deleteGroup = (req, res) => {
	let group_id = req.body.group_id;
	let q = `DELETE FROM group_data WHERE group_id = ?`;

	connection.query(q, [group_id], (err) => {
		if (err) {
			res.send({ error: err });
		} else {
			res.send("Done");
		}
	});
};

export const addUser = (req, res) => {
	let user = req.body.user_id;
	let group = req.body.group_id;

	let q = `INSERT INTO user_groups (user_id, group_id) VALUE (?, ?)`;
	connection.query(q, [user, group], (err) => res.send(err ? { error: err } : "Done"));
};

export const deleteUser = (req, res) => {
    let user = req.body.user_id;
	let group = req.body.group_id;

    let q = `DELETE FROM user_groups WHERE user_id = ? AND group_id = ?`;
    connection.query(q, [user, group], (err) => res.send(err ? { error: err } : "Done"));
}