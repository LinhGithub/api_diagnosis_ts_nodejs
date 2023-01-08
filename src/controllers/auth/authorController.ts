const bcrypt = require("bcrypt");
import { AppDataSource } from "../../data-source";
import { Accounts } from "../../entity/Accounts";
const authMethods = require("../../controllers/auth/authorMethods");
const randToken = require("rand-token");
const objectIdInstance = require("mongodb").ObjectID;

exports.login = async (req, res) => {
  try {
    const user = req.body;
    if (user) {
      const username = user.username;

      let filter: any = {
        username: username,
      };

      const find_acc = await AppDataSource.manager.findOne(Accounts, filter);
      if (!find_acc) {
        return res.send({
          code: 401,
          msg: "Tên đăng nhập không tồn tại.",
        });
      }

      const isValidPass = bcrypt.compareSync(user.password, find_acc.password);

      if (!isValidPass) {
        return res.send({
          code: 401,
          msg: "Mật khẩu không chính xác.",
          token: "token",
        });
      }

      const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

      const dataForAccessToken = {
        username: user.username,
      };

      const accessToken = await authMethods.generateToken(
        dataForAccessToken,
        accessTokenSecret,
        accessTokenLife
      );

      if (!accessToken) {
        return res.send({
          code: 401,
          msg: "Đăng nhập không thành công, vui lòng thử lại.",
        });
      }

      let refreshToken = randToken.generate(process.env.TOKEN_SIZE); // tạo 1 refresh token ngẫu nhiên
      if (!find_acc.refreshToken) {
        const data_new = {
          refreshToken,
        };

        await AppDataSource.manager.update(
          Accounts,
          {
            _id: objectIdInstance(find_acc._id),
          },
          data_new
        );
      } else {
        refreshToken = find_acc.refreshToken;
      }

      return res.send({
        code: 200,
        accessToken,
        refreshToken,
        role: find_acc.role,
        msg: "Thành công.",
      });
    } else {
      return res.send({
        code: 0,
        msg: "Không tìm thấy thông tin đăng nhập.",
      });
    }
  } catch {
    return res.send({
      code: 0,
      msg: "Có lỗi xảy ra.",
    });
  }
};

exports.refreshToken = async (req, res) => {
  // Lấy access token từ header
  const accessTokenFromHeader = req.headers.x_authorization;
  if (!accessTokenFromHeader) {
    return res.status(400).send("Không tìm thấy access token.");
  }

  // Lấy refresh token từ body
  const refreshTokenFromBody = req.body.refreshToken;
  if (!refreshTokenFromBody) {
    return res.status(400).send("Không tìm thấy refresh token.");
  }

  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenLife = process.env.ACCESS_TOKEN_LIFE;

  // Decode access token đó
  const decoded = await authMethods.decodeToken(
    accessTokenFromHeader,
    accessTokenSecret
  );

  if (!decoded) {
    return res.status(400).send("Access token không hợp lệ.");
  }

  const username = decoded.payload.username; // Lấy username từ payload

  let filter: any = {
    username: username,
  };
  const user = await AppDataSource.manager.findOne(Accounts, filter);
  if (!user) {
    return res.status(401).send("User không tồn tại.");
  }

  if (refreshTokenFromBody !== user.refreshToken) {
    return res.status(400).send("Refresh token không hợp lệ.");
  }

  // Tạo access token mới
  const dataForAccessToken = {
    username,
  };

  const accessToken = await authMethods.generateToken(
    dataForAccessToken,
    accessTokenSecret,
    accessTokenLife
  );
  if (!accessToken) {
    return res
      .status(400)
      .send("Tạo access token không thành công, vui lòng thử lại.");
  }

  return res.json({
    accessToken,
  });
};
