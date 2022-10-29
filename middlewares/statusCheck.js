import connection from "../database.js";

export const statusCheck = (req, res, next) => {
	let q = `SELECT * FROM users WHERE user_name = ?`;
	connection.query(q, [req.user_name], (err, result) => {
		if (err) {
			res.send({
				error: err,
				auth: false,
			});
		} else {
			req.user_status = result[0].status;
			req.email = result[0].email;
			next();
		}
	});
};

export const isAdmin = (req, res, next) => {
	if (req.user_status == "Admin") {
		next();
	} else {
		res.send({
			error: "You don't have permission",
			auth: false,
		});
	}
};
