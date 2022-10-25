import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { Illnesses } from "./entity/Illnesses";
import { Rules } from "./entity/Rules";
const multer = require("multer");
const cors = require("cors");
const { check_assert } = require("../src/utils/index");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const objectIdInstance = require("mongodb").ObjectID;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

app.get("/", async (req, res) => {
  res.send({ code: 200, msg: "Api all ready!" });
});

// ==================  illnesses and symptom
app.get("/illnesses", async (req, res) => {
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
});

app.post("/illnesses", multer().none(), async (req, res) => {
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
});

app.delete("/illnesses/:id", async (req, res) => {
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
});

app.put("/illnesses/:id", multer().none(), async (req, res) => {
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
});

// ===================== rules
app.get("/rules", async (req, res) => {
  try {
    const rules = await AppDataSource.manager.find(Rules);
    const total = await AppDataSource.manager.count(Rules);
    res.send({ code: 200, msg: "success", results: rules, total: total });
  } catch {
    (err) => {
      console.log(err);
      res.send({ code: 0, msg: "error", results: [], total: 0 });
    };
  }
});

app.post("/rules", async (req, res) => {
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
});

app.delete("/rules/:id", async (req, res) => {
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
});

app.put("/rules/:id", multer().none(), async (req, res) => {
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
});

// ============================ diagnosis
app.post("/diagnosis", multer().none(), async (req, res) => {
  try {
    const { symptoms: symptoms_bd } = req.body;
    var symptoms = [];
    var query = {};
    var facts = [];
    var rules = [];
    for (var symptom of symptoms_bd) {
      symptoms.push([symptom, "person"]);
    }

    var allRules = await AppDataSource.manager.find(Rules, {});
    for (var symptom_db of allRules) {
      var d = [symptom_db.symptoms, symptom_db.illnesses_id];
      rules.push(d);
    }

    var results = check_assert(rules, symptoms);
    for (var item of results.facts) {
      var _check = false;
      for (var s of symptoms) {
        if (item[0] === s[0]) {
          _check = true;
          break;
        }
      }
      if (!_check) {
        facts.push(item);
      }
    }

    var facts_id = [];
    for (var fact of facts) {
      facts_id.push(objectIdInstance(fact[0]));
    }

    query = { _id: { $in: facts_id } };

    const allIllnesses = await AppDataSource.manager.find(Illnesses, query);
    res.send({ code: 200, msg: "Thành công", results: allIllnesses });
  } catch (err) {
    res.send({ code: 0, msg: "error", results: [] });
  }
});

app.listen("8000", function () {
  console.log(`server: http://localhost:${"8000"}`);
});
