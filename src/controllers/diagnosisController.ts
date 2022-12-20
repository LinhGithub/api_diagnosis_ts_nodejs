import { AppDataSource } from "../data-source";
import { Rules } from "../entity/Rules";
import { Illnesses } from "../entity/Illnesses";
const { check_assert } = require("../../src/utils/index");

const objectIdInstance = require("mongodb").ObjectID;

// exports.index = async function (req, res) {
//   try {
//     const { symptoms: symptoms_bd } = req.body;
//     console.log(req);
//     var symptoms = [];
//     var query = {};
//     var facts = [];
//     var rules = [];
//     for (var symptom of symptoms_bd) {
//       symptoms.push([symptom, "person"]);
//     }

//     var allRules = await AppDataSource.manager.find(Rules, {});
//     for (var symptom_db of allRules) {
//       var d = [symptom_db.symptoms, symptom_db.illnesses_id];
//       rules.push(d);
//     }

//     var results = check_assert(rules, symptoms);
//     for (var item of results.facts) {
//       var _check = false;
//       for (var s of symptoms) {
//         if (item[0] === s[0]) {
//           _check = true;
//           break;
//         }
//       }
//       if (!_check) {
//         facts.push(item);
//       }
//     }

//     var facts_id = [];
//     for (var fact of facts) {
//       facts_id.push(objectIdInstance(fact[0]));
//     }

//     query = { _id: { $in: facts_id } };

//     const allIllnesses = await AppDataSource.manager.find(Illnesses, query);
//     res.send({ code: 200, msg: "Thành công", results: allIllnesses });
//   } catch (err) {
//     res.send({ code: 0, msg: "error", results: [] });
//   }
// };

module.exports = {
  index: async function (req, res) {
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
  },
};
