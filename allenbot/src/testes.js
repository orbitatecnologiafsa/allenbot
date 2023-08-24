const firebasedb = require('./firebase.js');


let sela = '000651651'
let validationCond = firebasedb.getCondominio(sela);

if (validationCond == true) {
    console.log('deu certo');
} else {
    console.log('kkk deu nada');
}
