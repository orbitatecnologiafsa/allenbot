const firebasedb = require('./firebase.js')
const http = require('http');

// http.createServer((req, res) => {
//     res.write('Salve')
//     res.end()
// }).listen(8080)

/*async function stages(client, message, userdata) {
  let data = {
    nome: userdata['nome'] || '',
    cpf: userdata['cpf'] || '',
    cod_condominio: userdata['cod_condominio'] || '',
    moradorLiberou: userdata['moradorLiberou'] || ''
  };
  console.log(data);
  if (userdata['stage'] === null) {
    console.log(userdata['stage']);
    await sendDelayedMessage(client, message.from, 'Bem vindo ao allenbot\n1- Liberar visitante\n2- Sair', 1000);
    userdata['stage'] = 'option';
    console.log(userdata['stage']);
  } else if (userdata['stage'] === 'option') {
    console.log(userdata['stage']);
    if (message.body === '1') {
      await sendDelayedMessage(client, message.from, 'Digite o *NOME* do visitante:', 1000);
      userdata['stage'] = 'nome';
    } else if (message.body === '2') {
      userdata['stage'] = 'fim';
    } else {
      await sendDelayedMessage(client, message.from, 'Opção inválida. Por favor, escolha uma opção válida.', 1000);
      return;
    }
  } else if (userdata['stage'] === 'nome') {
    console.log(userdata['stage']);
    data['nome'] = message.body; // Salvar o nome do visitante
    console.log(data.nome);
    console.log(data['nome']);
    await sendDelayedMessage(client, message.from, 'Digite seu *CPF*:', 1500);
    userdata['stage'] = 'cpf';
  } else if (userdata['stage'] === 'cpf') {
    console.log(userdata['stage']);
    data['cpf'] = message.body.replace(/[^\d]+/g, ''); // Salvar o CPF
    console.log(data.cpf);
    console.log(data['cpf']);
    sendWppMessage(client, message.from, 'Obrigada por informar seu CPF: ' + message.body);
    await sendDelayedMessage(client, message.from, 'Digite o código do seu *condomínio*:', 1500);
    userdata['stage'] = 'cod_Condominio';
  } else if (userdata['stage'] === 'cod_Condominio') {
    console.log(userdata['stage']);
    data['cod_condominio'] = message.body; // Salvar o código do condomínio
    var cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    sendWppMessage(client, message.from, 'Obrigado, você é do condomínio ' + condominio);
    let dadosMorador = await firebasedb.SelectMoradorVisitante(message.from.replace(/[^\d]+/g, ''));
    data['moradorLiberou'] = dadosMorador; // Salvar os dados do morador que liberou
    const codigoGerado = await generateCode(message.from.replace(/[^\d]+/g, ''));
    await sendDelayedMessage(client, message.from, 'O código de liberação do visitante é: ' + codigoGerado, 1000);
    userdata['stage'] = null;
  }
  
  if (userdata['stage'] === null) {
    await firebasedb.save(data); // Salvar todos os dados juntos em um único registro no Firestore
  }

  await firebasedb.updateUserStage(userdata['id'], userdata['stage']); // Atualizar o estágio do usuário no Firestore
}*/






/*async function stages(client, message, userdata) {
  let resetStage = false;
  
  if (userdata['stage'] === null) {
    console.log(userdata['stage']);
    await sendDelayedMessage(client, message.from, 'Bem vindo ao allenbot\n1- Liberar visitante\n2- Liberação em grupo\n3- sair', 1000);
    userdata['stage'] = 'option';
    console.log(userdata['stage']);
  } else if (userdata['stage'] === 'option') {
    console.log(userdata['stage']);
    if (message.body === '1') {
      await sendDelayedMessage(client, message.from, 'Digite o *NOME* do visitante:', 1000);
      userdata['stage'] = 'nome';
    } else if (message.body === '2') {
      await sendDelayedMessage(client, message.from, 'Digite os *NOMES* dos visitantes(digite todos numa mensagem só):', 1000);
      userdata['stage'] = 'nome';
    } else if (message.body === '3') {
      userdata['stage'] = 'fim';
    } else {
      await sendDelayedMessage(client, message.from, 'Opção inválida. Por favor, escolha uma opção válida.', 1000);
      return;
    }
  } else if (userdata['stage'] === 'nome') {
    console.log(userdata['stage']);
    userdata['visitante_nome'] = message.body;
    await sendDelayedMessage(client, message.from, 'Digite seu *CPF*:', 1500);
    userdata['stage'] = 'cpf';
  } else if (userdata['stage'] === 'cpf') {
    console.log(userdata['stage']);
    userdata['cpf'] = message.body.replace(/[^\d]+/g, '');
    sendWppMessage(client, message.from, 'Obrigada por informar seu CPF: ' + message.body);
    await sendDelayedMessage(client, message.from, 'Digite o código do seu *condomínio*:', 1500);
    userdata['stage'] = 'cod_Condominio';
  } else if (userdata['stage'] === 'cod_Condominio') {
    console.log(userdata['stage']);
    userdata['cod_Condominio'] = message.body;
    var cnpj = message.body;
    const condominio = await firebasedb.getCnpj(cnpj);
    sendWppMessage(client, message.from, 'Obrigado, você é do condomínio ' + condominio);
    let dadosMorador = await firebasedb.SelectMoradorVisitante(message.from.replace(/[^\d]+/g, ''));
    userdata['moradorLiberou'] = dadosMorador;
    const codigoGerado = await generateCode(message.from.replace(/[^\d]+/g, ''));
    await sendDelayedMessage(client, message.from, 'O código de liberação do visitante é: ' + codigoGerado, 1000);
    resetStage = true;
  }

  if (resetStage) {
    userdata['stage'] = null;
    await firebasedb.updateUserStageNull(userdata['id'], userdata['stage']);
  } else {
    await firebasedb.updateUserStage(userdata['id'], userdata['stage']);
  }

  await firebasedb.save(userdata); // Salvar todos os dados juntos no banco de dados
}*/
    
    
    
    
/*     var cnpj = '159753';
    
    async function x(cnpj) {
    let dadosMorador = await firebasedb.SelectMoradorVisitante('557592147675');
    let dadosMorador1 = await firebasedb.SelectMoradorVisitante1('557592147675');
    console.log(dadosMorador);
    console.log(dadosMorador1);
    const condominio =  await firebasedb.getCnpj(cnpj)
    console.log(condominio);
}
    
x(cnpj); */

// const data = {};

// function xxsave(nomeVisitante, cpfVisitante, codCondominio, obj) {
//   obj.nome = nomeVisitante;
//   obj.cpf = cpfVisitante;
//   obj.cod = codCondominio;
// }

// const seila1 = 'Vania';
// const seila2 = '1651651';
// const seila3 = '123456';

// xxsave(seila1, seila2, seila3, data);
 
// firebasedb.save(data);
// console.log(data);



// function extrairNomes(mensagem) {
//   const regex = /(?:^|\be\s|,)\s*([^,]+)/g;
//   const nomes = [];
//   let match;

//   while ((match = regex.exec(mensagem)) !== null) {
//     nomes.push(match[1].trim());
//   }

//   return nomes;
// }

// var mensagem = "João, Carlos    ,Fernando,Alvaro,";
// var nomes = extrairNomes(mensagem);
// var qtdNomes = nomes.length



// console.log(nomes); // Output: ["João", "Carlos", "Fernando"]
// console.log(qtdNomes);

// for (let i = 0; i < nomes.length; i++) {
//    'Ao clicar no botão liberar no painel'
//    qtdNomes--//contador do codigo -1 e atualiza no banco
//    //No Painel o dado do banco ele teria uma query pra pegar ele, e esse for faz o update dele no banco
//    console.log(qtdNomes);
  
// }



// var listaTeste = teste.split(',')
// console.log(listaTeste);

