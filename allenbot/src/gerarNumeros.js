const firebasedb = require('./firebase.js');

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // Função para obter os três dígitos do CPF a partir de um valor fornecido
  function getCPFDigits(cpf) {
    return [
      parseInt(cpf.charAt(0)),
      parseInt(cpf.charAt(1)),
      parseInt(cpf.charAt(2))
    ];
  }
  
  // Função para gerar o código hexadecimal
  async function generateCode(phone) {
    const cpf = await firebasedb.SelectMoradorVisitante1(phone); // Substitua pelo CPF obtido do banco
    const cpfDigits = getCPFDigits(cpf);
    
    const currentDate = new Date();
    
    const day = currentDate.getDate();
    
    const randomNumbers = [
      getRandomNumber(0, 9),
      getRandomNumber(0, 9),
      getRandomNumber(0, 9),
      day,
      ...cpfDigits
    ];
    
    const code = randomNumbers.reduce((result, number) => {
      return result + number;
    }, '');
    
    const hexCode = parseInt(code).toString(16);
    
    return hexCode;
  }
  
  // Função para salvar o código gerado no Firestore
  
  
  // Gerar o código, convertê-lo em hexadecimal e salvar no Firestore
  const generatedCode = generateCode();
  console.log(generatedCode);


  module.exports = generateCode;