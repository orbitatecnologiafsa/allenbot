const firebasedb = require("./firebase.js");
const generateCode = require("./gerarNumeros.js");
const { forceEndConversation } = require("./robo.js");

const userStates = new Map();

function getUserState(phone) {
  if (!userStates.has(phone)) {
    userStates.set(phone, {});
  }
  return userStates.get(phone);
}

function updateUserState(phone, data) {
  const currentState = getUserState(phone);
  const newState = { ...currentState, ...data };
  userStates.set(phone, newState);
}

async function sendDelayedMessage(client, recipient, message, delay) {
  return new Promise((resolve) => {
    setTimeout(() => {
      sendWppMessage(client, recipient, message);
      resolve();
    }, delay);
  });
}

async function sendWppMessage(client, sendTo, text) {
  await client.sendText(sendTo, text);
}

async function stages(client, message, userdata) {
  const phone = message.from.replace(/[^\d]+/g, "");
  const userState = getUserState(phone);

  if (!userdata["stage"]) {
    await sendDelayedMessage(
      client,
      message.from,
      "🏢 Bem-vindo ao AllenBot! 🏢\n\n\n📅 Por que usar o AllenBot? \n\n- Faça a liberação de visitas há qualquer momento, de onde estiver.\n- Receba confirmações instantâneas.\n- Informe detalhes da sua visita, tornando tudo mais transparente e seguro.\n\n💡 Dicas rápidas:\n*1*. Ao realizar o agendamento, forneça informações corretas e detalhadas.\n*2*. Confira sempre a data e o horário marcados.\n*3*. Caso necessite cancelar ou alterar, faça isso com antecedência para manter a organização.",
      1000
    );
    await sendDelayedMessage(
      client,
      message.from,
      "🏢 Menu de Ações do AllenBot 🏢\n\nPor favor, selecione a opção desejada digitando o *número correspondente*:\n\n*1. Liberar Visita* 🚶‍♂️\n  - Permita a entrada de um visitante individualmente.\n\n*2. Liberar Visitas em Grupo* 🚶‍♂️🚶‍♀️\n  - Autorize a entrada de um conjunto de visitantes ao mesmo tempo.\n\n*3. Cancelar Liberação* ❌\n  - Caso tenha mudado de ideia ou cometido um erro, cancele a liberação do(s) um visitante específico.\n\n*4. Encerrar Atendimento* 🔚\n  - Finalize sua interação com o AllenBot.\n\nDigite o número da ação desejada para prosseguir. Se precisar de mais ajuda, estamos à disposição!",
      1003
    );
    console.log(message.body);
    userdata["stage"] = "option";
  } else if (userdata["stage"] === "option") {
    let validation = await firebasedb.SelectMoradorVisitanteNumero(
      message.from.replace(/[^\d]+/g, "")
    );
    if (validation) {
      if (message.body === "1") {
        userState.TipoLiberacao = "Individual";
        await sendDelayedMessage(
          client,
          message.from,
          "Digite o *NOME* do visitante:",
          1000
        );
        userdata["stage"] = "nome";
      } else if (message.body === "2") {
        userState.TipoLiberacao = "Grupo";
        console.log(message.body);
        console.log(message.body);
        userdata["stage"] = "ask_grupo_qtd";
      } else if (message.body === "3") {
        await sendDelayedMessage(
          client,
          message.from,
          "Qual codigo você deseja cancelar liberação ?:",
          1000
        );
        userdata["stage"] = "conclusaoCancelamento";
      } else if (message.body === "4") {
        await sendDelayedMessage(
          client,
          message.from,
          "Certo, liberação encerrada, quando precisar estarei a disposição",
          1000
        );
        userdata["stage"] = null; // encerra
      } else {
        await sendDelayedMessage(
          client,
          message.from,
          "Opção inválida. Por favor, escolha uma opção válida.",
          1000
        );
      }
    } else {
      await sendWppMessage(client, message.from, "Você não é cadastrado");
      userdata["stage"] = null;
    }
  } else if (userdata["stage"] === "conclusaoCancelamento") {
    console.log("tou aqui " + userdata["stage"]);
    let codRef = message.body;
    await firebasedb.updateDocumentField(codRef, false);
    const validationCancel = await firebasedb.updateDocumentField(codRef, false);
    if (validationCancel) {
      await sendDelayedMessage(
        client,
        message.from,
        "Liberação cancelada com sucesso",
        1000
      );
      await sendDelayedMessage(
        client,
        message.from,
        "🏢 Menu de Ações do AllenBot 🏢\n\nPor favor, selecione a opção desejada digitando o *número correspondente*:\n\n*1. Liberar Visita* 🚶‍♂️\n  - Permita a entrada de um visitante individualmente.\n\n*2. Liberar Visitas em Grupo* 🚶‍♂️🚶‍♀️\n  - Autorize a entrada de um conjunto de visitantes ao mesmo tempo.\n\n*3. Cancelar Liberação* ❌\n  - Caso tenha mudado de ideia ou cometido um erro, cancele a liberação do(s) um visitante específico.\n\n*4. Encerrar Atendimento* 🔚\n  - Finalize sua interação com o AllenBot.\n\nDigite o número da ação desejada para prosseguir. Se precisar de mais ajuda, estamos à disposição!",
        1003
      );
      console.log(message.body);
      userdata["stage"] = "option";
    } else {
      await sendDelayedMessage(
        client,
        message.from,
        "Falha no cancelamento, digite o codigo de liberação corretamente por favor",
        1000
      );
      userdata["stage"] = "conclusaoCancelamento";
    }
  } else if (userdata["stage"] === "nome") {

  /*===============================Começo do Fluxo======================*/
    console.log(userdata["stage"]);
    userState.VisitanteNome = message.body; // Salvar o nome do visitante
    await sendDelayedMessage(
      client,
      message.from,
      "Digite seu *CPF* sem pontos e traços:",
      1500
    );
    userdata["stage"] = "cpf";
  } else if (userdata["stage"] === "cpf") {
    console.log(userdata["stage"]);
    const cpf = message.body;
    
    let validationCPF = await firebasedb.SelectMoradorVisitante1(
      message.from.replace(/[^\d]+/g, "")
    );
    
    if (validationCPF == cpf) {
      if (cpf.length == 11) {
        userState.VisitanteCpf = message.body.replace(/[^\d]+/g, ""); // Salvar o CPF
        await sendDelayedMessage(
          client,
          message.from,
          "Digite o código do seu *condomínio*:",
          1500
        );
        userdata["stage"] = "cod_Condominio";
      } else {
        sendWppMessage(
          client,
          message.from,
          "CPF digitado incorretamente, digite apenas os 11 números sem pontos e traços"
        );
        userdata["stage"] = "cpf";
      }
    } else {
      sendWppMessage(
        client,
        message.from,
        "CPF Não cadastrado, entre em contato com o sindico para mais informações"
      );
      
      userdata["stage"] = "cpf";
    } 
  } else if (userdata["stage"] === "cod_Condominio") {
    console.log(userdata["stage"]);
    userState.cod_condominio1 = message.body; // Salvar o código do condomínio
    const cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    if (condominio == undefined) {
      sendWppMessage(
        client,
        message.from,
        "Codigo de condominio invalido, verifique o codigo corretamente\nDigite o codigo novamente"
      );
      userdata["stage"] = "cod_Condominio";
    } else {
      userState.condominio_visitado = condominio; // Salvar o nome do condomínio
      sendWppMessage(
        client,
        message.from,
        "Obrigado, você é do condomínio " + condominio
      );
      //===========================================================================================
      //===========================================================================================
      let dadosMorador = await firebasedb.SelectMoradorVisitante(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.moradorLiberou = dadosMorador; // Salvar os dados do morador que liberou
      const codigoGerado = await generateCode(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.codigoGerado = codigoGerado; // Salvar o código de liberação do visitante
      var StatusCode = true;
      userState.CodigoStatus = StatusCode;
      //===========================================================================================
      let dadosCasaMorador = await firebasedb.SelectMoradorVisitante2(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.casaMorador = dadosCasaMorador;

      var Liberado = false;
      userState.Liberado = Liberado;
      await sendDelayedMessage(
        client,
        message.from,
        "O código de liberação do visitante é: " + codigoGerado,
        1000
      );
      userdata["stage"] = null;
    }
  }

  if (userdata["stage"] === null) {
    await firebasedb.save(userState); // Salvar todos os dados juntos no banco de dados
  }

  //======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
  //======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
  //======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
  //======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
  else if (userdata["stage"] === "ask_grupo_qtd") {
    await sendDelayedMessage(
      client,
      message.from,
      "Quantos visitantes você deseja liberar?",
      1000
    );
    userdata["stage"] = "grupo_qtd";
  } else if (userdata["stage"] === "grupo_qtd") {
    const NVisitantes = message.body.replace(/[\s-]+/g, "");
    userState.qtdVisitantes = Number(NVisitantes);
    await sendDelayedMessage(
      client,
      message.from,
      "Digite o *NOME* do primeiro visitante:",
      1000
    );
    userState.visitantes = []; // Lista para armazenar nomes dos visitantes
    userdata["stage"] = "grupo_nome";
  } else if (userdata["stage"] === "grupo_nome") {
    userState.visitantes.push(message.body); // Armazene o nome na lista
    if (userState.visitantes.length < userState.qtdVisitantes) {
      await sendDelayedMessage(
        client,
        message.from,
        "Digite o *NOME* do próximo visitante:",
        1000
      );
    } else {
      await sendDelayedMessage(client, message.from, "Digite seu *CPF*:", 1000);
      userdata["stage"] = "grupo_cpf";
    }
  } else if (userdata["stage"] === "grupo_cpf") {
    let cpfGrupo = message.body;
    if (cpfGrupo.length == 11) {
      userState.cpf = message.body.replace(/[^\d]+/g, "");
      await sendDelayedMessage(
        client,
        message.from,
        "Digite o código do seu *condomínio*:",
        1000
      );
      userdata["stage"] = "grupo_codigo";
    } else {
      sendWppMessage(
        client,
        message.from,
        "CPF digitado incorretamente, digite apenas os 11 números sem pontos e traços"
      );
      userdata["stage"] = "grupo_cpf";
    }
  } else if (userdata["stage"] === "grupo_codigo") {
    console.log(userdata["stage"]);
    userState.codigoCondominio = message.body;
    const cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    if (condominio == undefined) {
      sendWppMessage(
        client,
        message.from,
        "Codigo de condominio invalido, verifique o codigo corretamente\nDigite o codigo novamente"
      );
      userdata["stage"] = "cod_Condominio";
    } else {
      //===========================================================================================
      userState.condominio_visitado = condominio; // Salvar o nome do condomínio
      sendWppMessage(
        client,
        message.from,
        "Obrigado, você é do condomínio " + condominio
      );
      //===========================================================================================
      let dadosMorador = await firebasedb.SelectMoradorVisitante(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.moradorLiberou = dadosMorador; // Salvar os dados do morador que liberou
      const codigoGerado = await generateCode(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.codigoGerado = codigoGerado; // Salvar o código de liberação do visitante
      var CodigoStatus1 = true;
      userState.CodigoStatus = CodigoStatus1;
      //===========================================================================================
      let dadosCasaMorador = await firebasedb.SelectMoradorVisitante2(
        message.from.replace(/[^\d]+/g, "")
      );
      userState.casaMorador = dadosCasaMorador;
      var Liberado = false;
      userState.Liberado = Liberado;
      await sendDelayedMessage(
        client,
        message.from,
        "O código de liberação do visitante é: " + codigoGerado,
        1000
      );
      userdata["stage"] = null;
    }
    for (let nome of userState.visitantes) {
      let visitanteData = {
        VisitanteNome: nome,
        VisitanteCpf: userState.cpf,
        codigoCondominio: userState.codigoCondominio,
        TipoLiberacao: "Grupo",
        condominio_visitado: userState.condominio_visitado,
        moradorLiberou: userState.moradorLiberou,
        codigoGerado: userState.codigoGerado,
        casaMorador: userState.casaMorador,
        Liberado: userState.Liberado,
        CodigoStatus: userState.CodigoStatus,
      };
      await firebasedb.save(visitanteData); // Salvar cada visitante individualmente com os mesmos CPF e código de condomínio
    }

    userdata["stage"] = null; // encerra
  }

  await firebasedb.updateUserStage(userdata["id"], userdata["stage"]); // Atualizar o estágio do usuário no Firestore
}
module.exports = {
  sendWppMessage: sendWppMessage,
  stages: stages,
  // ... e assim por diante para todas as outras funções e variáveis que você deseja exportar.
};
