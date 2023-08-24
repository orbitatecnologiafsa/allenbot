const wppconnect = require('@wppconnect-team/wppconnect');
const firebasedb = require('./firebase.js');
const stages = require('./stages');

wppconnect.create({
  session: 'whatsbot',
  autoClose: false,
  puppeteerOptions: { args: ['--no-sandbox'] }
})
  .then((client) => {
    client.onMessage(async (message) => {
      console.log('Mensagem digitada pelo usuário: ' + message.body);
      console.log('Confere1');
      await queryUserByPhone(client, message);
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











