var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const passport = require("passport");
var cookieParser = require("cookie-parser");
router.use(cookieParser("secret_passcode"));
const LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
const client = require("../config/database");

router.use(flash());

router.use(passport.initialize());
router.use(passport.session());

var page_name = 'Fei';
const saltRounds = 10;

router.get('/', function(req, res) {
    res.render('front_page/index', {title: page_name,message_error: req.flash('error'), layout: "front_page/layout"})
});

router.get('/signup',function(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.role === 'admin')
            res.redirect('/administrator/users');
        else
            res.redirect('/presenter/meetings');
    }
    else
        res.render('front_page/signup', { title: 'Sign up', name:page_name, message_error: req.flash('error'), message_success: req.flash('success') })}
);

router.post('/signup', async function (req, res) {
  try{
    let hash = await bcrypt.hash(req.body.password, saltRounds);
      client.query(`SELECT id FROM accounts WHERE email=$1 OR username = $2`, [req.body.email, req.body.username], function(err, result) {
        if(result.rows[0]){
          req.flash('error', "Account is already in use");
          res.redirect('/signup');
        }
        else{
          client.query(`INSERT INTO accounts (username, email, password) VALUES ($1, $2, $3)`, [req.body.username, req.body.email, hash], function(err, result) {
            if(err){console.log(err);}
            else {
              req.flash('success', "User added successfully");
              res.redirect('/login');
            }
          });

        }

      })

  }
  catch(e){throw(e)}
});




router.get('/login', function(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.role === 'admin')
            res.redirect('/administrator/users');
        else
            res.redirect('/presenter/meetings');
    }
    else{
        res.render('front_page/login', { title: 'Log in', name: page_name, message_error: req.flash('error'), message_success: req.flash('success') })
    }
    });

router.post('/login', passport.authenticate('local', {
  failureRedirect:'/login',
  failureFlash: true}),function(req, res) {
        let user = req.user;

        if (user.role === 'admin')
            res.redirect('/administrator/users');
        else
            res.redirect('/presenter/meetings')
    }
);

passport.use('local', new LocalStrategy({passReqToCallback : true},  (req, username, password, done) => {
      try{
           client.query(`SELECT * FROM accounts WHERE email=$1`, [req.body.email], async function(err, result) {
               const row = result.rows[0];

               if(err) {
                   return done(err)
               }
               else if(row === null || row === undefined) {
                   req.flash('error', "User doesn't exist.");
                   return done(null, false);
               }
               else if(username !== row.username){
                   req.flash('error', "Incorrect username");
                   return done(null, false);
               }

               let current = new Date();
               let block = new Date();
               if(row.block_date !== undefined) {
                   block = new Date(row.block_date);
               }
           if (current - block < 0) {
               req.flash('error', "User is blocked");
                return done(null, false);
           }
            else{
              await bcrypt.compare(password, row.password,  function(err, check) {
                if (err){
                  return done();
                }
                else if (check){
                  var user={
                    id: row.id, email:row.email, username: row.username, role: row.role
                  }
                  return done(null,user);
                }
                else{
                  req.flash('error', "Incorrect password");
                  return done(null, false);
                }
              });
            }
          })
        }
      catch(e){throw (e);
      }

    }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    client.query(`SELECT * FROM accounts WHERE ID = $1`, [id], (err, results) => {
        if (err) {
            return done(err);
        }
        return done(null, results.rows[0]);
    });
});
module.exports = router;
