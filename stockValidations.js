const Joi = require("@hapi/joi");

const stockValidation = data => {
  const schema = {
    initialStock: Joi.number()
      .min(0)
      .positive()
      .required('A informação de estoque deve ser informada.').error(() => {
          return {
            message: 'Erro ao definir estoque inicial.',
          };
        }),
    dosage: Joi.number()
      .min(1)
      .positive()
      .required('A informação de estoque deve ser informada.').error(() => {
          return {
            message: 'Erro ao definir dosagem inicial.',
          };
        }),
  };
  return Joi.validate(data, schema);
};
const changeStockValidation = data => {
  const schema = {
    quantity: Joi.number()
      .min(1)
      .positive('O valor informado deve ser maior que zero.').error(() => {
          return {
            message: 'Erro ao definir alterar estoque.',
          };
        }),
  };
  return Joi.validate(data, schema);
};

module.exports.stockValidation = stockValidation;
module.exports.changeStockValidation = changeStockValidation;
