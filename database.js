const Sequelize = require('sequelize');

// Connection
const db = new Sequelize('poll2', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

// Models
const pollM = db.define('poll', {
    question: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    background: { type: Sequelize.STRING }
});

const answerM = db.define('answer', {
    answer: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    image: { type: Sequelize.STRING }
});

const resultM = db.define('result');

const userM = db.define('user', {
    firstname: { type: Sequelize.STRING },
    lastname: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING },
    password: { type: Sequelize.STRING }
});

// Les relations
pollM.hasMany(answerM);
answerM.belongsTo(pollM);

pollM.hasMany(resultM);
resultM.belongsTo(pollM);

userM.hasMany(pollM);
pollM.belongsTo(userM);

answerM.hasMany(resultM);
resultM.belongsTo(answerM);

db.sync();

// On exporte
module.exports.db = db;
module.exports.Poll = pollM;
module.exports.Answer = answerM;
module.exports.Result = resultM
module.exports.User = userM;
