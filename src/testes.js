const firebasedb = require('./firebase.js');




function contagem(i) {
    console.log(i);
}

for (let i = 0; i < 1000; i++) {
    setTimeout(contagem(i), 1000);

    if (i>= 1000) {
        continue
    } else{
        clearTimeout()
    }
}