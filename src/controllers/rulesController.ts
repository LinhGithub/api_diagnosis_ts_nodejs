import { AppDataSource } from "../data-source";
import { Rules } from "../entity/Rules";
import { Illnesses } from "../entity/Illnesses";
const objectIdInstance = require("mongodb").ObjectID;

module.exports = {
  index: async function (req, res) {
    try {
      var { page, page_size, name } = req.query;

      var conditionObj = {};
      if (page_size && page) {
        page_size = Number(page_size);
        page = Number(page);
        conditionObj = {
          take: page_size,
          skip: (page - 1) * page_size,
        };
      }

      var rules = [];
      var total = 0;
      if (name) {
        let queryObjill = { name: { $regex: name, $options: "i" } };

        let illness_ids = await AppDataSource.manager
          .getMongoRepository(Illnesses)
          .distinct("_id", queryObjill);

        illness_ids = illness_ids.map((item) => String(item));

        let queryObj = {};
        queryObj["$or"] = [
          { illnesses_id: { $in: illness_ids } },
          { symptoms: { $elemMatch: { $in: illness_ids } } },
        ];

        rules = await AppDataSource.getMongoRepository(Rules).find({
          where: queryObj,
          ...conditionObj,
        });
        total = await AppDataSource.manager.count(Rules, queryObj);
      } else {
        rules = await AppDataSource.getMongoRepository(Rules).find({
          where: {},
          ...conditionObj,
        });
        total = await AppDataSource.manager.count(Rules, {});
      }

      res.send({ code: 200, msg: "success", results: rules, total: total });
    } catch {
      (err) => {
        console.log(err);
        res.send({ code: 0, msg: "error", results: [], total: 0 });
      };
    }
  },

  create: async function (req, res) {
    try {
      const { symptoms, illnesses_id } = req.body;
      var filter = {};
      filter["illnesses_id"] = illnesses_id;
      filter["symptoms"] = symptoms;
      const findRule = await AppDataSource.manager.findOne(Rules, filter);
      if (findRule === undefined || findRule === null) {
        const rule = new Rules();
        rule.symptoms = symptoms;
        rule.illnesses_id = illnesses_id;
        rule.created_at = new Date(Date.now());

        const insertNow = await AppDataSource.manager.save(rule);
        res.send({ code: 200, msg: "Thêm mới thành công", id: insertNow._id });
      } else {
        res.send({ code: 0, msg: "Luật đã tồn tại" });
      }
    } catch (err) {
      console.log(err);
      res.send({ code: 0, msg: "error" });
    }
  },

  delete: async function (req, res) {
    try {
      const { id } = req.params;
      await AppDataSource.manager.delete(Rules, {
        _id: objectIdInstance(id),
      });
      res.send({ code: 200, msg: "Xóa thành công", id: id });
    } catch (err) {
      console.log(err);
      res.send({ code: 0, msg: "error" });
    }
  },

  update: async function (req, res) {
    try {
      const { id } = req.params;
      const { symptoms, illnesses_id } = req.body;
      var filter = {};
      filter["_id"] = { $ne: objectIdInstance(id) };
      filter["illnesses_id"] = illnesses_id;
      filter["symptoms"] = symptoms;
      var findrule = await AppDataSource.manager.findOne(Rules, filter);
      if (findrule === undefined || findrule === null) {
        filter = {};
        filter["_id"] = objectIdInstance(id);
        findrule = await AppDataSource.manager.findOne(Rules, filter);
        if (findrule) {
          const data_new = {
            illnesses_id: illnesses_id,
            symptoms: symptoms,
            updated_at: Date.now(),
          };
          await AppDataSource.manager.update(
            Rules,
            {
              _id: objectIdInstance(id),
            },
            data_new
          );
          res.send({ code: 200, msg: "Cập nhật thành công", id: id });
        } else {
          res.send({ code: 0, msg: "Luật không tồn tại" });
        }
      } else {
        res.send({ code: 0, msg: "Luật đã tồn tại" });
      }
    } catch (err) {
      console.log("put rules", err);
      res.send({ code: 0, msg: "error" });
    }
  },
};
