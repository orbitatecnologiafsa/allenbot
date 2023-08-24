const firebasedb = require('./firebase.js');
const generateCode = require('./gerarNumeros.js');

async function sendDelayedMessage(client, recipient, message, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      sendWppMessage(client, recipient, message);
      resolve();
    }, delay);
  });
}

async function sendWppMessage(client, sendTo, text) {
  await client.sendText(sendTo, text);
}

let data = {}; // Objeto para armazenar todas as informações coletadas
let dataGroup = {};

async function stages(client, message, userdata) {
  if (!userdata['stage']) {
    await sendDelayedMessage(client, message.from, 'Bem vindo ao allenbot\n1- Liberar visitante\n2- Liberação em grupo\n3- sair', 1000);
    console.log(message.body);
    userdata['stage'] = 'option';
  } else if (userdata['stage'] === 'option') {
    let validation = await firebasedb.SelectMoradorVisitanteNumero(message.from.replace(/[^\d]+/g, ''));
    if (validation) {
      if (message.body === '1') {
        data['TipoLiberacao'] = 'Individual';
        await sendDelayedMessage(client, message.from, 'Digite o *NOME* do visitante:', 1000);
        userdata['stage'] = 'nome';
      } 
      else if (message.body === '2') {
        data['TipoLiberacao'] = 'Grupo';
        console.log(message.body);
        
        console.log(message.body);
        userdata['stage'] = 'ask_grupo_qtd';
      } else if (message.body === '3') {
        userdata['stage'] = null; // encerra
      } else {
        await sendDelayedMessage(client, message.from, 'Opção inválida. Por favor, escolha uma opção válida.', 1000);
      }
    } else {
      await sendWppMessage(client, message.from, 'Você não é cadastrado');
      userdata['stage'] = null;
    }
  } else if (userdata['stage'] === 'nome') {
    console.log(userdata['stage']);
    data['VisitanteNome'] = message.body; // Salvar o nome do visitante
    await sendDelayedMessage(client, message.from, 'Digite seu *CPF* sem pontos e traços:', 1500);
    userdata['stage'] = 'cpf';
  }
  else if (userdata['stage'] === 'cpf') {
    console.log(userdata['stage']);
    let cpf = message.body
    if (cpf.length == 11) {
      data['VisitanteCpf'] = message.body.replace(/[^\d]+/g, ''); // Salvar o CPF
      await sendDelayedMessage(client, message.from, 'Digite o código do seu *condomínio*:', 1500);
      userdata['stage'] = 'cod_Condominio';
      
    } else {
      sendWppMessage(client, message.from, 'CPF digitado incorretamente, digite apenas os 11 números sem pontos e traços');
      userdata['stage'] = 'cpf'
    }
  } 
  else if (userdata['stage'] === 'cod_Condominio') {
    console.log(userdata['stage']);
    data['cod_condominio1'] = message.body; // Salvar o código do condomínio
    var cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    if (condominio == undefined) {
      sendWppMessage(client, message.from, 'Codigo de condominio invalido, verifique o codigo corretamente\nDigite o codigo novamente');
      userdata['stage'] = 'cod_Condominio';  
    } else {
      data['condominio_visitado'] = condominio; // Salvar o nome do condomínio
      sendWppMessage(client, message.from, 'Obrigado, você é do condomínio ' + condominio);
      //===========================================================================================
      //===========================================================================================
      let dadosMorador = await firebasedb.SelectMoradorVisitante(message.from.replace(/[^\d]+/g, ''));
      data['moradorLiberou'] = dadosMorador; // Salvar os dados do morador que liberou
      const codigoGerado = await generateCode(message.from.replace(/[^\d]+/g, ''));
      data['codigoGerado'] = codigoGerado; // Salvar o código de liberação do visitante
      var StatusCode = true;
      data['CodigoStatus'] = StatusCode;
      //===========================================================================================
      let dadosCasaMorador = await firebasedb.SelectMoradorVisitante2(message.from.replace(/[^\d]+/g, ''));
      data['casaMorador'] = dadosCasaMorador;
  
      var Liberado = false;
      data['Liberado'] = Liberado; 
      await sendDelayedMessage(client, message.from, 'O código de liberação do visitante é: ' + codigoGerado, 1000);
      userdata['stage'] = null;
    }
    
  }
  
  
  if (userdata['stage'] === null) {
    await firebasedb.save(data); // Salvar todos os dados juntos no banco de dados
  }
  
  
//======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
//======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
//======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
//======================================================FLUXO DE LIBERAÇÃO EM GRUPO===============================================================//
else if (userdata['stage'] === 'ask_grupo_qtd') {
  await sendDelayedMessage(client, message.from, 'Quantos visitantes você deseja liberar?', 1000);
  userdata['stage'] = 'grupo_qtd';
}
else if (userdata['stage'] === 'grupo_qtd') {
  const NVisitantes = message.body.replace(/[\s-]+/g, "");
  dataGroup['qtdVisitantes'] = Number(NVisitantes);
  await sendDelayedMessage(client, message.from, 'Digite o *NOME* do primeiro visitante:', 1000);
  dataGroup['visitantes'] = [];  // Lista para armazenar nomes dos visitantes
  console.log(dataGroup['qtdVisitantes']);
  console.log(dataGroup['visitantes']);
  userdata['stage'] = 'grupo_nome';
}
else if (userdata['stage'] === 'grupo_nome') {
  dataGroup['visitantes'].push(message.body);  // Armazene o nome na lista
  console.log(dataGroup['qtdVisitantes']);
  if (dataGroup['visitantes'].length < dataGroup['qtdVisitantes']) {
    console.log(dataGroup['qtdVisitantes']);
      await sendDelayedMessage(client, message.from, 'Digite o *NOME* do próximo visitante:', 1000);
  } else {
      await sendDelayedMessage(client, message.from, 'Digite seu *CPF*:', 1000);
      console.log(dataGroup['visitantes'].length);
      userdata['stage'] = 'grupo_cpf';
  }
}
else if (userdata['stage'] === 'grupo_cpf') {
  dataGroup['cpf'] = message.body.replace(/[^\d]+/g, '');
  await sendDelayedMessage(client, message.from, 'Digite o código do seu *condomínio*:', 1000);
  userdata['stage'] = 'grupo_codigo';
}
else if (userdata['stage'] === 'grupo_codigo') {
  console.log(userdata['stage']);
    dataGroup['codigoCondominio'] = message.body;
    var cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    if (condominio == undefined) {
      sendWppMessage(client, message.from, 'Codigo de condominio invalido, verifique o codigo corretamente\nDigite o codigo novamente');
      userdata['stage'] = 'cod_Condominio'; 
    } else {
      //===========================================================================================
      dataGroup['condominio_visitado'] = condominio; // Salvar o nome do condomínio
      sendWppMessage(client, message.from, 'Obrigado, você é do condomínio ' + condominio);
      //===========================================================================================
      let dadosMorador = await firebasedb.SelectMoradorVisitante(message.from.replace(/[^\d]+/g, ''));
      dataGroup['moradorLiberou'] = dadosMorador; // Salvar os dados do morador que liberou
      const codigoGerado = await generateCode(message.from.replace(/[^\d]+/g, ''));
      dataGroup['codigoGerado'] = codigoGerado; // Salvar o código de liberação do visitante
      var CodigoStatus1 = true;
      dataGroup['CodigoStatus'] = CodigoStatus1;
      //===========================================================================================
      let dadosCasaMorador = await firebasedb.SelectMoradorVisitante2(message.from.replace(/[^\d]+/g, ''));
      dataGroup['casaMorador'] = dadosCasaMorador;
      var Liberado = false;
      dataGroup['Liberado'] = Liberado; 
      await sendDelayedMessage(client, message.from, 'O código de liberação do visitante é: ' + codigoGerado, 1000);
      userdata['stage'] = null;
      
    }
  for (let nome of dataGroup['visitantes']) {
      let visitanteData = {
          VisitanteNome: nome,
          VisitanteCpf: dataGroup['cpf'],
          codigoCondominio: dataGroup['codigoCondominio'],
          TipoLiberacao: 'Grupo',
          condominio_visitado: dataGroup['condominio_visitado'],
          moradorLiberou: dataGroup['moradorLiberou'],
          codigoGerado: dataGroup['codigoGerado'],
          casaMorador: dataGroup['casaMorador'],
          Liberado: dataGroup['Liberado'],
          CodigoStatus: dataGroup['CodigoStatus']
      };
      await firebasedb.save(visitanteData);  // Salvar cada visitante individualmente com os mesmos CPF e código de condomínio
  }

  userdata['stage'] = null;  // encerra
}

  await firebasedb.updateUserStage(userdata['id'], userdata['stage']); // Atualizar o estágio do usuário no Firestore
}

module.exports = stages;
