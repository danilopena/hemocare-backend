// validation
const Joi = require("@hapi/joi");
const registerValidation = data => {
  const schema = {
    name: Joi.string()
      .min(2)
      .required('O nome deve ser informado').error(() => {
          return {
            message: 'Nome deve conter no mínimo duas letras.',
          };
        }),
    email: Joi.string()
      .min(6)
      .email().error(() => {
          return {
            message: 'Insira um email válido, por gentileza.',
          };
        }),
    password: Joi.string()
      .min(6)
      .required().error(() => {
          return {
            message: 'Sua senha deve conter no mínimo 6 caracteres',
          };
        }),
    pathology: Joi.string().required().error(() => {
      return {
        message: 'Por gentileza, informe seu tipo de coagulopatia',
      };
    }),
    agreeToTerms: Joi.boolean().required().error(() => {
      return {
        message: 'Para prosseguir, os termos de uso devem ser aceitos. '
      };
    }),
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
