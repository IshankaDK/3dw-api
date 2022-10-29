import jsonwebtoken from "jsonwebtoken";

export const jwtVerify = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (token) {
        jsonwebtoken.verify(
            token,
            process.env.JWT_SECRET_KEY,
            (err, decoded) => {
                if (err) {
                    res.send({
                        auth: false,
                        error: "Failed to aunthenticate",
                    });
                } else {
                    req.user_name = decoded.user_name;
                    req.user_id = decoded.user_id;
                    next();
                }
            }
        );
    } else {
        res.send({
            error: "No token available",
            auth: false,
        });
    }
};
