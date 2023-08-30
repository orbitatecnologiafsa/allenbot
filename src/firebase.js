const firebaseadmin = require('firebase-admin')
const firebaseServiceAccount = require('../allenbot2-firebase-adminsdk-h1t38-1ecc6854fe.json');
const { Whatsapp } = require('@wppconnect-team/wppconnect');
//Coisas do banco de dados
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();

exports.save = async function (user) {
    user['date'] = firebaseadmin.firestore.Timestamp.fromDate(new Date());
    let newRegister = await db.collection('visitante-morador').add(user); // Cria uma nova tabela
    user['id'] = newRegister.id;
    return user;
}

exports.updateUserStage = async function(userId, stage) {
    try {
      const userRef = db.collection('visitante-morador').doc(userId);
      await userRef.update({ stage: stage || null }); // Retorna true quando a atualização é concluída com sucesso
    } catch (error) {
      console.log("Erro ao atualizar o estágio do usuário:", error);
      throw error;
    }
  }

  exports.updateUserStageNull = async function(userId, stage) {
    try {
      const userRef = db.collection('visitante-morador').doc(userId);
      await userRef.update({ stage: null }); // Retorna true quando a atualização é concluída com sucesso
    } catch (error) {
      console.log("Erro ao atualizar o estágio do usuário:", error);
      throw error;
    }
  }

exports.queryByPhone = async function (phone) {
    let userdata = null;
    try {
        const queryRef = await db.collection('visitante-morador')
            .where('whatsapp', '==', phone)
            .get();
        if (!queryRef.empty) {
            queryRef.forEach((user) => {
                userdata = user.data();
                userdata['id'] = user.id;
            });
        }
    } catch (_error) {
        console.log(_error);
    }
    return userdata;
}

//UPDATE


//============================================SELECTS===========================================
exports.getCnpj = async function (cnpj) {
    try {
      const condsRef = db.collection('condominio'); // armazena a tabela que referencia
      const consulta = condsRef.where('cod_Condominio', '==', cnpj).limit(1).get(); // Na tabela, procura o documento onde ta aquel cnpj forncecido

      console.log(consulta);
      const snapshot = await consulta; // Armazena o documento achado na consulta
      let nome; //variavel do nome referente aquele cnpj 
  
      snapshot.forEach(doc => { //Faz um foreach, caso tenha mais de uma empresa com aquele cnpj, percorre
        nome = doc.data().nome_condominio; //Armazena na variavel o nome no documento que tem aquele mesmo cnpj
        console.log("Nome da empresa: " + nome);    
      });
  
      return nome; // Retornar o nome da empresa encontrado
  
    } catch (error) {
      console.log("Erro ao consultar o Firestore:", error);
      throw error; // Lançar o erro novamente para ser tratado externamente, se necessário
    }
  }

  exports.SelectMoradorVisitante = async function (phone) {
    try {
        const moradorRef = db.collection('moradores');
        const consultaMorador = moradorRef.where('whatsapp', '==', phone).limit(1).get();

        const snapshot = await consultaMorador;

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const nome = doc.data().nome;
            const numero = doc.data().whatsapp;
            const cpf = doc.data().cpf;
            console.log("Morador " + nome + " liberou visitante " + numero);
            return nome;
        } else {
            console.log("Nenhum morador encontrado com o número de telefone: " + phone);
            return null;
        }

    } catch (error) {
        console.log("Erro ao consultar o Firestore:", error);
        throw error;
    }
}

//================================ORGANIZA ISSO DEPOIS==================



exports.SelectMoradorVisitante1 = async function (phone) {
    try {
        const moradorRef = db.collection('moradores');
        const consultaMorador = moradorRef.where('whatsapp', '==', phone).limit(1).get();

        const snapshot = await consultaMorador;

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const nome = doc.data().nome;
            const numero = doc.data().whatsapp;
            const cpf = doc.data().cpf;
            const endereco = doc.data().casa;
            console.log("Morador " + nome + " liberou visitante " + numero);
            return cpf;
        } else {
            console.log("Nenhum morador encontrado com o número de telefone: " + phone);
            return null;
        }

    } catch (error) {
        console.log("Erro ao consultar o Firestore:", error);
        throw error;
    }
}

exports.SelectMoradorVisitante2 = async function (phone) {
  try {
      const moradorRef = db.collection('moradores');
      const consultaMorador = moradorRef.where('whatsapp', '==', phone).limit(1).get();

      const snapshot = await consultaMorador;

      if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const nome = doc.data().nome;
          const numero = doc.data().whatsapp;
          const cpf = doc.data().cpf;
          const endereco = doc.data().casa;
          console.log("Morador " + nome + " liberou visitante " + numero);
          return endereco;
      } else {
          console.log("Nenhum morador encontrado com o número de telefone: " + phone);
          return null;
      }

  } catch (error) {
      console.log("Erro ao consultar o Firestore:", error);
      throw error;
  }
}

exports.SelectMoradorVisitanteNumero = async function (phone) {
    try {
        const moradorRef = db.collection('moradores');
        const consultaMorador = moradorRef.where('whatsapp', '==', phone).limit(1).get();
  
        const snapshot = await consultaMorador;
  
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const nome = doc.data().nome;
            const numero = doc.data().whatsapp;
            console.log("Morador " + nome + " liberou visitante " + numero);
            return true;
        } else {
            console.log("Nenhum morador encontrado com o número de telefone: " + phone);
            return false;
        }
  
    } catch (error) {
        console.log("Erro ao consultar o Firestore:", error);
        throw error;
    }
  }

  exports.getCondominio = async function (cond) {
    try {
      const condsRef = db.collection('condominio'); // armazena a tabela que referencia
      const consulta = condsRef.where('cod_Condominio', '==', cond).limit(1).get(); // Na tabela, procura o documento onde ta aquel cnpj forncecido

      console.log(consulta);
      const snapshot = await consulta; // Armazena o documento achado na consulta
      let nome; //variavel do nome referente aquele cnpj 
  
      snapshot.forEach(doc => { //Faz um foreach, caso tenha mais de uma empresa com aquele cnpj, percorre
        nome = doc.data().cod_Condominio; //Armazena na variavel o nome no documento que tem aquele mesmo cnpj
        console.log("Nome da empresa: " + nome);    
      });
  
      return true; // Retornar o nome da empresa encontrado
  
    } catch (error) {
      console.log("Erro ao consultar o Firestore:", error);
      throw error; // Lançar o erro novamente para ser tratado externamente, se necessário
    }
  }

exports.updateDocumentField = async function (codigo) {
    if (!codigo) {
        console.error('Código não fornecido');
        return;
    }

    try {
        // Referência para a coleção onde você quer procurar o documento
        const collectionRef = db.collection('visitante-morador');

        // Procure o documento que possui o campo 'codigo' igual ao fornecido
        const snapshot = await collectionRef.where('codigoGerado', '==', codigo).limit(1).get();

        if (snapshot.empty) {
            console.error('Documento não encontrado');
            return;
        }

        // Pegue o ID do primeiro documento retornado
        const docId = snapshot.docs[0].id;

        // Atualize o campo desejado para "true"
        await collectionRef.doc(docId).delete();

        console.log('Documento atualizado com sucesso');
    } catch (error) {
        console.error('Erro ao atualizar o documento:', error);
    }
}


  