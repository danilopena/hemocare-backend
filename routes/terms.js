const express = require('express')
const router = express.Router()

router.get('/useTerms', (req, res)=> {
    return res.status(200).json({"texto": "Isenção de responsabilidade médica do aplicativo\n" +
            "Isenção de responsabilidade médica\n" +
            "Revisado 10/11/2019\n" +
            "\n" +
            "Nenhum conselho\n" +
            "Este aplicativo (\"App)\" fornece apenas informações, não é um conselho médico ou de tratamento e não pode ser tratado como tal pelo usuário. \n" +
            " \n" +
            "Como tal, este App não pode ser invocado para fins de diagnóstico médico ou como uma recomendação para atendimento médico ou tratamento. As informações sobre este App não é um substituto para aconselhamento médico profissional, diagnóstico ou tratamento. \n" +
            "Todo o conteúdo, incluindo texto, gráficos, imagens e informações, contidos ou disponíveis através deste aplicativo é apenas para fins de informação geral\n" +
            "\n" +
            "Assessoria e Assistência Médica Profissional\n" +
            "É altamente recomendável que você confirme qualquer informação obtida  através deste App com seu médico ou outro profissional de saúde e revise todas as informações referentes a qualquer condição médica ou tratamento com seu médico ou outro profissional de saúde.\n" +
            "\n" +
            "Sem confiança\n" +
            "Você nunca deve confiar em qualquer informação obtida usando este aplicativo para qualquer diagnóstico ou recomendação para tratamento médico. VOCÊ NUNCA DEVE CONFIAR NAS INFORMAÇÕES RECEBIDAS DESTE APLICATIVO COMO ALTERNATIVO AO CONSELHO MÉDICO DE SEU MÉDICO OU OUTRO PROFISSIONAL DE SAÚDE.\n" +
            "\n" +
            "Você nunca deve dispensar aconselhamento médico profissional ou demora procurando tratamento médico como resultado de qualquer informação que você tenha visto ou acessado através deste aplicativo. SE VOCÊ TIVER ALGUMAS QUESTÕES ESPECÍFICAS SOBRE QUALQUER ASSUNTO MÉDICO, VOCÊ DEVE CONSULTAR SEU MÉDICO OU OUTRO PROFISSIONAL DE SAÚDE. Se você acha que pode estar sofrendo de qualquer condição médica, você deve procurar atenção médica imediata.\n" +
            "\n" +
            "Sem garantia\n" +
            "As informações fornecidas por este aplicativo são fornecidas \"como estão\", sem quaisquer representações ou garantias, expressas ou implícitas. O Hemocare não faz representações ou garantias em relação ao médico ou outras informações contidas neste App.\n" +
            "\n" +
            "O Hemocare não garante que:\n" +
            "- As informações fornecidas por este aplicativo estarão constantemente disponíveis ou disponíveis a todos;\n" +
            "ou\n" +
            "- As informações fornecidas por este aplicativo são completas, verdadeiras, precisas, atualizadas ou não enganosas.\n" +
            "\n" +
            "O Hemocare NÃO SE RESPONSABILIZA POR QUALQUER RECOMENDAÇÃO, CURSO DE TRATAMENTO, DIAGNÓSTICO OU QUALQUER OUTRA INFORMAÇÃO, SERVIÇOS OU PRODUTOS QUE OBTER ATRAVÉS DO USO DESTE APLICATIVO.\n" +
            "\n" +
            "Ao usar o aplicativo e marcar a caixa de seleção, você reconheceu que:\n" +
            "- VOCÊ LEU O ENTENDER ESTA ISENÇÃO MÉDICA.\n" +
            "- VOCÊ CONCORDA COM ESTA ISENÇÃO MÉDICA.\n" +
            "- VOCÊ CONCORDA EM SER LEGALMENTE INCORPORADO POR ESTA ISENÇÃO MÉDICA, QUE TERÁ EFEITO IMEDIATAMENTE AO CLICAR NO CHECKBOX ABAIXO.\n" +
            "\n" +
            "SE VOCÊ NÃO CONCORDAR EM SER LEGALMENTE INCORPORADO POR ESSA ISENÇÃO MÉDICA, VOCÊ NÃO PODE ACESSAR O APLICATIVO, REGISTRAR O APLICATIVO SOB O SEU NOME OU USAR O APLICATIVO."})
})

module.exports = router
