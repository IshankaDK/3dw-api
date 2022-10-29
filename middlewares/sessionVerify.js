import con from "../database.js";

export const sessionVerify = (req, res, next) => {
	let q = "SELECT session_expiry_date, (NOW() > session_expiry_date) as 'expired' FROM users WHERE user_name = ?";

	con.query(q, [req.user_name], (err, result) => {
		if (result[0].session_expiry_date == null || result[0].expired == 1) {
			res.send({
				auth: false,
				error: "Session expired",
			});
		} else {
			next();
		}
	});
};
