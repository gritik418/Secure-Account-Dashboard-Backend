import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearerToken = req.headers["authorization"];
    const token = bearerToken.split(" ")[1];

    const verify: JwtPayload = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as JwtPayload;

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
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      status: 400,
      message: "Please Login.",
    });
  }
};

export default authenticate;
