var express = require('express');
var router = express.Router();
var cookieParser = require("cookie-parser");
router.use(cookieParser("secret_passcode"));
var flash = require('connect-flash');
router.use(flash());
var meeting = require('../modules/meeting_db');
const client = require("../config/database");
const jwt = require("jsonwebtoken");
var io = null;
var prvi_id = null;
var idevi = [];

router.get('/:code/presenter', function presenterValid(req, res, next){

        if(req.isAuthenticated()) {
            if (req.user.role === "presenter")
                next();
            else
                res.redirect('/');
        }
        else
            res.redirect('/');


    },function(req,res,next) {
        let code = req.params.code;
        client.query(`SELECT * FROM rooms WHERE code = $1`, [code], function (err, result) {
            if (err)
                return res.send(err);
            req.body.rooms = result.rows[0];
            next();
        });
    },
    function (req,res,next) {
        client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, m.type as type, r.id AS room_id FROM messages m
                INNER JOIN rooms r ON m.room_id = r.id
                WHERE r.code = $1 ORDER BY m.id DESC`, [req.params.code], function (err, result) {
            if (err)
                return res.send(err);
            req.body.messages = result.rows;
            next();

        });
    },
    function(req,res,next) {
        client.query(`SELECT word FROM forbidden_words;`, [], function (err, result) {
            if (err)
                return res.send(err);
            req.body.words = result.rows;
            next();
        });
    },
    function (req,res,next) {
        let rooms = req.body.rooms;
        let room_id = (rooms.id).toString();

        idevi.push({username: req.params.code});
        let messages =req.body.messages;
        io = require('socket.io')(req.connection.server);
        io.sockets.on('connection', function (c) {
            room_id = (rooms.id).toString()

            idevi[idevi.length-1].id = c.id;
            c.join(room_id);
            if (!prvi_id) {
                prvi_id = c.id;
            }
            io.sockets.in(room_id).emit('sve_poruke', messages);

            c.on('delete_message',function (id){
                client.query('DELETE FROM messages WHERE id = $1', [id], function (err, result) {
                    if (err)
                        console.log(err);
                });
                client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, m.type as type, r.id AS room_id FROM messages m
                INNER JOIN rooms r ON m.room_id = r.id
                WHERE r.code = $1 ORDER BY m.id DESC`, [req.params.code], function (err, result) {
                    if (err)
                        return res.send(err);
                    messages = result.rows;
                    io.sockets.in(room_id).emit('sve_poruke', result.rows);
                });
            });
            c.on('answer_message',function (id){
                client.query(`UPDATE messages SET type = 'Answered' WHERE id = $1`, [id], function (err, result) {
                    if (err)
                        console.log(err);
                });
                client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, m.type as type, r.id AS room_id FROM messages m
                INNER JOIN rooms r ON m.room_id = r.id
                WHERE r.code = $1 ORDER BY m.id DESC`, [req.params.code], function (err, result) {
                    if (err)
                        return res.send(err);
                    messages = result.rows;
                    io.sockets.in(room_id).emit('sve_poruke', result.rows);
                });
            });
            c.on('disconnect', function () {
                c.leave(room_id);
                console.log('disconnected event');
            });

        });
        res.render('meeting_page/presenter_meeting',{profile:req.user.username, code:req.params.code, messages:messages, id:room_id, layout: "meeting_page/layoutPresenter"});

    });


router.get('/:code', function(req,res,next) {
    let code = req.params.code;
    client.query(`SELECT * FROM rooms WHERE code = $1`, [code], function (err, result) {
        if (err)
            return res.send(err);

        req.body.rooms = result.rows[0];
        next();
    });
},
    function (req,res,next) {
        client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, m.type as type, r.id AS room_id FROM messages m
                INNER JOIN rooms r ON m.room_id = r.id
                WHERE r.code = $1 ORDER BY m.id DESC`, [req.params.code], function (err, result) {
            if (err)
                return res.send(err);
            req.body.messages = result.rows;
            next();
        });
    },
function(req,res,next) {
    client.query(`SELECT word FROM forbidden_words;`, [], function (err, result) {
        if (err)
            return res.send(err);
        req.body.words = result.rows;
        next();
    });
},
    function (req,res,next) {
    let rooms = req.body.rooms;
    let room_id = (rooms.id).toString();

    idevi.push({username: req.params.code});
    let messages =req.body.messages;

    io = require('socket.io')(req.connection.server);
    io.sockets.on('connection', function (c) {
        room_id = (rooms.id).toString()

        idevi[idevi.length-1].id = c.id;
            c.join(room_id);

            io.sockets.in(room_id).emit('sve_poruke', messages);

        c.on('disconnect', function () {
            c.leave(room_id);

            console.log('disconnected event');
        });
        c.on('like', function (id) {
            client.query('UPDATE messages SET likes = likes + 1 WHERE id = $1', [id], function (err, result) {
                if (err)
                    console.log(err);
            });
            io.emit('update_like', id);

        });
        c.on('klijent_salje_poruku', function (d) {
            let message = d.toString();
            let type = "Unanswered";
            for(let i = 0; i < req.body.words.length; i++) {
                if (message.includes(req.body.words[i].word)) {
                    type = "Forbidden";
                    break;
                }
            }

            client.query('INSERT INTO messages(content, room_id,type) VALUES($1,$2,$3)', [message, room_id, type], function (err, result) {
                if (err)
                    console.log(err);
            });

            if(type !== "Forbidden") {
                client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, m.type as type, r.id AS room_id FROM messages m
                INNER JOIN rooms r ON m.room_id = r.id
                WHERE r.code = $1 ORDER BY m.id DESC`, [req.params.code], function (err, result) {
                    if (err)
                        return res.send(err);
                    messages = result.rows;
                    io.sockets.in(room_id).emit('sve_poruke', result.rows);
                });
            }
        });
    });
    if(rooms === []) {
        res.render('meeting_page/meeting', {title: "Meeting", messages: messages, layout: "meeting_page/layout"});
    }
    else
        res.render('meeting_page/meeting', {title: "Meeting",rooms:rooms,messages:messages, layout: "meeting_page/layout"});

});

router.post('/redirect', meeting.validCode);

module.exports = router;
