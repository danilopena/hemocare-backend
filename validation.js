// validation
const Joi = require("@hapi/joi");
const registerValidation = data => {
  const schema = {
    name: Joi.string()
      .min(2, 'O nome deve conter no mínimo 2 caracteres.')
      .required('O nome deve ser informado'),
    email: Joi.string()
      .min(6)
      .email('Por gentileza, insira um email válido'),
    password: Joi.string()
      .min(6, 'A senha deve ter no mínimo 6 caracteres')
      .required('É obrigatório fornecer uma senha'),
    pathology: Joi.string().required(),
    agreeToTerms: Joi.boolean().required()
  };
  return Joi.validate(data, schema);
};
const loginValidation = data => {
  const schema = {
    email: Joi.string()
      .min(6)
      .email(),
    password: Joi.string()
      .min(6)
      .required()
  };
  return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
