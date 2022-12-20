import { AppDataSource } from "../data-source";
import { Illnesses } from "../entity/Illnesses";
import { Rules } from "../entity/Rules";
const objectIdInstance = require("mongodb").ObjectID;

module.exports = {
  index: async function (req, res) {
    try {
      const { type, rule } = req.query;
      var filter = {};
      if (type) {
        filter["type"] = type;
      }
      if (rule) {
        filter["rule"] = rule;
      }
      if (type && rule) {
        filter = { $or: [{ type: type }, { rule: rule }] };
      }

      const illnesses = await AppDataSource.manager.find(Illnesses, filter);
      const total = await AppDataSource.manager.count(Illnesses, filter);

      res.send({ code: 200, msg: "success", results: illnesses, total: total });
    } catch {
      (err) => {
        console.log(err);
        res.send({ code: 0, msg: "error", results: [], total: 0 });
      };
    }
  },

  create: async function (req, res) {
    try {
      const { name, type, rule } = req.body;
      var filter = {};
      filter["name"] = name;
      const findIllnesses = await AppDataSource.manager.findOne(
        Illnesses,
        filter
      );
      if (findIllnesses === undefined || findIllnesses === null) {
        const illness = new Illnesses();
        illness.name = name;
        illness.type = type;
        illness.rule = rule;
        illness.created_at = new Date(Date.now());

        const insertNow = await AppDataSource.manager.save(illness);
        res.send({ code: 200, msg: "Thêm mới thành công", id: insertNow._id });
      } else {
        if (findIllnesses.type === "illness") {
          res.send({ code: 0, msg: "Tên bệnh đã tồn tại" });
        } else {
          res.send({ code: 0, msg: "Tên triệu chứng đã tồn tại" });
        }
      }
    } catch (err) {
      res.send({ code: 0, msg: "Có lỗi xảy ra" });
    }
  },

  delete: async function (req, res) {
    try {
      const { id } = req.params;
      var filter = {};
      filter["illnesses_id"] = id;
      var filter_1 = {};
      filter_1["symptoms"] = id;
      var count_doc = await AppDataSource.manager.count(Rules, filter);
      var count_doc1 = await AppDataSource.manager.count(Rules, filter_1);
      if (count_doc + count_doc1 === 0) {
        await AppDataSource.manager.delete(Illnesses, {
          _id: objectIdInstance(id),
        });
        res.send({ code: 200, msg: "Xóa thành công" });
      } else {
        res.send({
          code: 0,
          msg: "Không thể xóa, nó đã được gắn kết với luật",
        });
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 0, msg: "Xóa thất bại" });
    }
  },

  update: async function (req, res) {
    try {
      const { id } = req.params;
      const { name, rule } = req.body;
      var filter = {};
      filter["_id"] = { $ne: objectIdInstance(id) };
      filter["name"] = name;

      var findIllnesse = await AppDataSource.manager.findOne(Illnesses, filter);
      if (findIllnesse === undefined || findIllnesse === null) {
        const data_new = {
          name: name,
          rule: rule,
          updated_at: new Date(Date.now()),
        };

        await AppDataSource.manager.update(
          Illnesses,
          {
            _id: objectIdInstance(id),
          },
          data_new
        );
        res.send({ code: 200, msg: "Cập nhật thành công", id: id });
      } else {
        if (findIllnesse.type === "illness") {
          res.send({ code: 0, msg: "Tên bệnh đã tồn tại" });
        } else {
          res.send({ code: 0, msg: "Tên triệu chứng đã tồn tại" });
        }
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 0, msg: "Có lỗi xảy ra" });
    }
  },
};
