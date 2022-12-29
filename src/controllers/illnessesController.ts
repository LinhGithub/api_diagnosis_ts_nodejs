import { AppDataSource } from "../data-source";
import { Illnesses } from "../entity/Illnesses";
import { Rules } from "../entity/Rules";
const objectIdInstance = require("mongodb").ObjectID;

module.exports = {
  index: async function (req, res) {
    try {
      var { type, rule, page, page_size, name } = req.query;

      var queryObj = {};
      if (type && rule) {
        queryObj = { $or: [{ type: type }, { rule: rule }] };
      } else {
        if (type) {
          queryObj["type"] = type;
        }
        if (rule) {
          queryObj["rule"] = rule;
        }
      }

      if (name) {
        queryObj["name"] = { $regex: name, $options: "i" };
      }

      var conditionObj = {};
      if (page_size && page) {
        page_size = Number(page_size);
        page = Number(page);
        conditionObj = {
          take: page_size,
          skip: (page - 1) * page_size,
        };
      }

      const illnesses = await AppDataSource.manager
        .getMongoRepository(Illnesses)
        .find({
          where: queryObj,
          ...conditionObj,
        });

      const total = await AppDataSource.manager.count(Illnesses, queryObj);

      res.send({ code: 200, msg: "success", results: illnesses, total: total });
    } catch {
      (err) => {
        console.log(err);
        res.send({ code: 0, msg: "error", results: [], total: 0 });
      };
    }
  },

  get_by_ids: async (req, res) => {
    try {
      const { list_ids } = req.body;
      var illnesses = [];

      let queryObj = {};
      if (list_ids.length) {
        let queryIll = {};
        queryObj["symptoms"] = { $elemMatch: { $in: list_ids } };
        var rules = await AppDataSource.manager
          .getMongoRepository(Rules)
          .distinct("symptoms", queryObj);

        rules = rules.filter((item) => !list_ids.includes(item));
        let ill_obj = rules.map((item) => objectIdInstance(item));

        queryIll["_id"] = { $in: ill_obj };
        illnesses = await AppDataSource.manager
          .getMongoRepository(Illnesses)
          .find({ where: queryIll });
      } else {
        queryObj = { $or: [{ type: "symptom" }, { rule: "both" }] };
        illnesses = await AppDataSource.manager
          .getMongoRepository(Illnesses)
          .find({ where: queryObj });
      }

      res.status(200).send({ code: 200, msg: "success", results: illnesses });
    } catch {
      res.status(400).send({ code: 0, msg: "Có lỗi xảy ra" });
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
