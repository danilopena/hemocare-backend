const Joi = require("@hapi/joi");

const stockValidation = data => {
  const schema = {
    initialStock: Joi.number()
      .min(0)
      .positive()
      .required(),
    dosage: Joi.number()
      .min(1)
      .positive()
      .required("Nao achamos a dosagem")
  };
  return Joi.validate(data, schema);
};
const changeStockValidation = data => {
  const schema = {
    quantity: Joi.number()
      .min(1)
      .positive()
  };
  return Joi.validate(data, schema);
};

module.exports.stockValidation = stockValidation;
module.exports.changeStockValidation = changeStockValidation;
