const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./database');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const formidable = require('formidable');
const bcrypt = require('bcrypt');

//Strategie d'authentification
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const COOKIE_SECRET = 'cookie secret';

passport.use(new LocalStrategy((email, password, done) => {
  db.User
    .findOne({ where: { email, password } })
    .then(function (user) {
        // User found
        return done(null, user);
    })
    // If an error occured, report it
    .catch(done);
    }));

//identification de l'utilisateur
passport.serializeUser((user, cb) => {
    // Save the user's email in the cookie
    cb(null, user.email);
});
passport.deserializeUser((email, cb) => {
    // Get a user from a cookie's content: his email
    db.User
        .findOne({ where: { email } })
        .then((user) => {
            cb(null, user);
        })
        .catch(cb);
});

// Use Pug to render views
app.set('view engine', 'pug');

app.use(cookieParser(COOKIE_SECRET));

app.use(bodyParser.urlencoded({ extended: true }));
// Serve assets from the public folder
app.use(express.static('public'));

app.use(session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    db.Poll.findAll({ include: [db.User] }).then((data) => {
        res.render('homepage', {
            user: req.user,
            polls: data
        });
    });
});

app.get('/poll/:id(\\d+)/', (req, res) => {
    let id = req.params.id;

    db.Poll.findOne({
        where: {id: id},
        include: [{ all: true }] }).then((data) => {
        if(!data) {
            res.redirect('/');
        } else {
            res.render('poll', {
                user: req.user,
                poll: data
            });
        }
    });
});

app.get('/create', (req, res) => {
    res.render('createPoll');
});

app.post('/create', (req, res) => {
    const question = req.body.question;
    const description = req.body.description;
    const answer1 = req.body.answer1;
    const answer2 = req.body.answer2;

    db.Poll
        .create({
          question: question,
          description: description,
          answer1: answer1,
          answer2: answer2,
         })
        .then(() => {
          res.redirect('createSucess');
      });
    });

app.get('/login', (req,res) => {
      res.render('login', { user: req.user });
});

app.get('/createSucess', (req,res) => {
  db.Poll.findOne({ include: [db.User] }).then((data) => {
      res.render('createSucess', { user: req.user,
      poll: data });
    });
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.post('/login', passport.authenticate('local', { successRedirect: '/',
                                                    failureRedirect: '/login' }));

app.post('/register', (req, res) => {
  const userFirstname = req.body.firstname;
  const userLastname = req.body.lastname;
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  db.User.create({
      firstname: userFirstname,
      lastname: userLastname,
      email: userEmail,
      password: userPassword
  }).then((result) => {
      req.login(user,() => {
        res.redirect('/login?newUser');
      });
  });
});

app.get('/api/createSucess', (req, res) => {
  db.Poll
    .then(() => {
      return db.Poll.findOne({ include: [db.User],
        where: { id:  req.params.pollId }});
    })
    .then((poll) => {
      res.render('createSucess', {
        poll: data,
        question,
        description,
        user: req.user
      });
    });
});

app.get('/register', (req,res) => {
      res.render('register', { user: req.user });
});



  app.listen(3000);
