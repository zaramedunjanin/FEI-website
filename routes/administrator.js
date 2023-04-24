var express = require('express');
var router = express.Router();
const passport = require("passport");
var cookieParser = require("cookie-parser");
router.use(cookieParser("secret_passcode"));
const admin = require('../modules/admin_db');
const jwt = require("jsonwebtoken");
const presenter = require("../modules/presenter_db");

router.use(passport.initialize());
router.use(passport.session());

router.get('/',
    function (req, res) {
        res.redirect('/')
    }
);

router.get('/users',
    admin.adminValid,
    admin.getUsers
);
router.get('/users/add',
    admin.adminValid,
    function (req, res) {
     res.render('admin_page/admin_add_user', {profile: req.user.username, layout: "admin_page/layout"})
    }
);
router.post('/users/add',
    admin.adminValid,

    admin.addUser,
    function (req, res) {
        res.redirect('/administrator/users')
    }
);
router.get('/users/:id/delete',
    admin.adminValid,
    admin.deleteUser,
    function (req, res) {
        res.redirect('/administrator/users')
    }
);
router.get('/users/:id/edit',
    admin.adminValid,
    admin.editUser
);
router.post('/users/:id/update',
    admin.adminValid,
    admin.updateUser,
    function (req, res) {
        res.redirect('/administrator/users')
    }
);

router.get('/meetings',
    admin.adminValid,
    admin.getMeetings
);

router.get('/meetings/add',
    admin.adminValid,
    function (req, res) {
        res.render('admin_page/admin_add_meeting', {profile: req.user.username, layout: "admin_page/layout"})
    }
);

router.post('/meetings/add',
    admin.adminValid,
    admin.addMeeting,
    function (req, res) {
        res.redirect('/administrator/meetings')
    }
);
router.get('/meetings/:id/edit',
    admin.adminValid,
    admin.editMeeting

);
router.post('/meetings/update',
    admin.adminValid,
    admin.updateMeeting
);

router.get('/meetings/:id/delete',
    admin.adminValid,
    admin.deleteMeeting,
    function (req, res) {
        res.redirect('/administrator/meetings')
    }
);

router.get('/messages',
    admin.adminValid,
    admin.getMessages
);

router.get('/messages/add',
    admin.adminValid,
    function (req, res) {
        res.render('admin_page/admin_add_word', {profile: req.user.username, layout: "admin_page/layout"})
    }
);

router.post('/messages/add',
    admin.adminValid,
    admin.addWord,
    function (req, res) {
        res.redirect('/administrator/words')
    }
);

router.get('/messages/:id/edit',
    admin.adminValid,
    admin.editMessage
);

router.post('/messages/:id/update',
    admin.adminValid,
    admin.updateMessage,
    function (req, res) {
        res.redirect('/administrator/messages')
    }
);

router.get('/messages/:id/delete',
    admin.adminValid,
    admin.deleteMessage,
    function (req, res) {
        res.redirect('/administrator/messages')
    }
);

router.get('/words',
    admin.adminValid,
    admin.getWords
);

router.get('/words/add',
    admin.adminValid,
    function (req, res) {
        res.render('admin_page/admin_add_word', {profile: req.user.username, layout: "admin_page/layout"})
    }
);

router.post('/words/add',
    admin.adminValid,
    admin.addWord,
    function (req, res) {
        res.redirect('/administrator/words')
    }
);

router.get('/words/:id/edit',
    admin.adminValid,
    admin.editWord

);
router.post('/words/:id/update',
    admin.adminValid,
    admin.updateWord,
    function (req, res) {
        res.redirect('/administrator/words')
    }
);

router.get('/words/:id/delete',
    admin.adminValid,
    admin.deleteWord,
    function (req, res) {
        res.redirect('/administrator/words')
    }
);


module.exports = router;
