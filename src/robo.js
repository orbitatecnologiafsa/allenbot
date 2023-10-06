const wppconnect = require('@wppconnect-team/wppconnect');
const firebasedb = require('./firebase.js');
const { sendWppMessage, stages } = require('./stages');
let timeout; // Defina isso no escopo global do seu arquivo

wppconnect.create({
  session: 'whatsbot',
  autoClose: false,
  puppeteerOptions: {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process']
 }
})
  .then((client) => {
    client.onMessage(async (message) => {
      if (timeout) {
        clearTimeout(timeout); // Cancela o temporizador atual se ele existir
      }
      console.log('Mensagem digitada pelo usuário: ' + message.body);
      console.log('Confere1');
      await queryUserByPhone(client, message);
      timeout = setTimeout(() => {
        forceEndConversation(client, message.from);
      }, 120000);
    });
  })
  .catch((error) => console.log(error));


async function queryUserByPhone(client, message) {
  let phone = (message.from).replace(/[^\d]+/g, '');
  let userdata = await firebasedb.queryByPhone(phone);
  if (userdata === null) {
    userdata = await saveUser(message);
  }
  console.log('Usuário corrente: ' + userdata['id']);
  await stages(client, message, userdata);
}

async function saveUser(message) {
  let user = {
    'pushname': (message['sender']['pushname'] != undefined) ? message['sender']['pushname'] : '',
    'whatsapp': (message.from).replace(/[^\d]+/g, ''),
  }
  let newUser = firebasedb.save(user);
  return newUser;
}

async function forceEndConversation(client, recipient) {
  await sendWppMessage(client, recipient, "Você demorou muito para responder. Por favor, comece a conversa novamente.");
  let userdata = await firebasedb.queryByPhone(recipient.replace(/[^\d]+/g, ''));
  if (userdata) {
      await firebasedb.updateUserStage(userdata['id'], null);
  }
}

module.exports = {
  forceEndConversation
};