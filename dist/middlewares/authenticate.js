import jwt from "jsonwebtoken";
const authenticate = async (req, res, next) => {
    try {
        const bearerToken = req.headers["authorization"];
        const token = bearerToken.split(" ")[1];
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify || !verify.id || !verify.sk) {
            return res.status(401).json({
                success: false,
                status: 400,
                message: "Please Login.",
            });
        }
        req.params.id = verify.id;
        req.params.sk = verify.sk;
        req.params.token = token;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            status: 400,
            message: "Please Login.",
        });
    }
};
export default authenticate;
//# sourceMappingURL=authenticate.js.map