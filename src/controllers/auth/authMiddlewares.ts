import { AppDataSource } from "../../data-source";
import { Accounts } from "../../entity/Accounts";
const authMethods = require("../../controllers/auth/authorMethods");

exports.isAuth = async (req, res, next) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(401).send("Không tìm thấy access token!");
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const verified = await authMethods.verifyToken(
    accessTokenFromHeader,
    accessTokenSecret
  );
  if (!verified) {
    return res.send({
      code: 401,
      auto: "yes",
      msg: "Bạn không có quyền truy cập vào tính năng này!",
    });
  }

  let filter: any = {
    username: verified.payload.username,
  };

  const user = await AppDataSource.manager.findOne(Accounts, filter);
  req.user = user;

  // console.log(req);

  return next();
};
