const client = require("../config/database");
const jwt = require("jsonwebtoken");

function adminValid(req, res, next){

    if(req.isAuthenticated()) {
        if (req.user.role === "admin")
            next();
        else res.redirect('/');
    }
    else
        res.redirect('/');


}

function editUser(req, res){

    let id = req.params.id;
    client.query('SELECT id, username, email FROM accounts WHERE id = $1;', [id], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_edit_user', {message_error: req.flash('error'),user: result.rows[0], profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}

function updateUser (req, res, next){
    let username = req.body.username;
    let email = req.body.email;
    let id = req.params.id;
    let block = req.body.block;
    if(block === 'blockUser15'){

        client.query(`UPDATE accounts SET username = $1, email = $2, block_date = current_date + interval '15 days' WHERE id = $3;`, [username, email, id], function (err, result) {

            if (err) {
                req.flash('error',"We couldn't save your changes!");
                res.redirect('/administrator/users/'+id+'/edit');
            } else {
                next();
            }

        });
    }
    if(block === 'blockUser30'){

        client.query(`UPDATE accounts SET username = $1, email = $2, block_date = current_date + interval '30 days' WHERE id = $3;`, [username, email, id], function (err, result) {

            if (err) {
                req.flash('error',"We couldn't save your changes!");
                res.redirect('/administrator/users/'+id+'/edit');
            } else {
                next();
            }

        });
    }
    else{
        client.query('UPDATE accounts SET username = $1, email = $2, block_date=null WHERE id = $3;', [username, email,id], function (err, result) {

            if (err) {
                req.flash('error',"We couldn't save your changes!");
                res.redirect('/administrator/users/'+id+'/edit');
            } else {
                next();
            }

        });}

}
function getUsers(req, res){

    client.query(`SELECT id, username, email FROM accounts WHERE role = 'presenter' ORDER BY id;`, [], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_users', { users: result.rows, profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}

function addUser(req, res, next) {

    let username = req.body.username;
    let email = req.body.email;
    let role = 'presenter';
    client.query(`INSERT INTO accounts(username,email,role) VALUES($1,$2,$3)`, [username, email, role], function (err) {

        if (err) {
            return res.send(err);
        }else{
            next();
        }

    });
}
function deleteUser(req, res, next) {
    let id = req.params.id;
    client.query(`DELETE FROM messages WHERE id IN (SELECT messages.id FROM messages INNER JOIN rooms ON messages.room_id = rooms.id WHERE rooms.presenter_id = $1);`, [id], function (err) {

        if (err) {
            return res.send(`Error  deleting user by ID: ${err.message}`);
        }
    });
    client.query(`DELETE FROM rooms WHERE presenter_id = $1`, [id], function (err) {

        if (err) {
            return res.send(`Error  deleting user by ID: ${err.message}`);
        }
    });
    client.query(`DELETE FROM accounts WHERE id = $1`, [id], function (err) {

        if (err) {
            return res.send(`Error  deleting user by ID: ${err.message}`);
        }
        next();
    });

}
function getMeetings(req, res){

    client.query('SELECT *  FROM rooms ORDER BY id;', [], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_meetings', { meetings: result.rows, profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}
function editMeeting (req, res){

    let id = req.params.id;

    client.query('SELECT * FROM rooms WHERE id = $1;', [id], function (err, result) {
        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_edit_meeting', {id:id, meeting: result.rows[0], profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}

function addMeeting(req, res, next) {

    client.query(`INSERT INTO rooms(code, time, repeat, name, cover, presenter_id) VALUES($1,$2, $3,$4,$5,$6)`, [req.body.code,req.body.date,req.body.repeat,req.body.name,req.body.cover, req.body.id], function (err) {
        if (err) {
            return res.send(err);
        }else{
            return res.send({valid:true});
        }

    });
}
function updateMeeting (req, res, next){
    if(req.body.cover === null){
        client.query(`UPDATE rooms SET name = $1, code = $2, time = $3, repeat = $4, presenter_id = $5 WHERE id = $6;`, [req.body.name, req.body.code, req.body.date, req.body.repeat,req.body.presenter_id, req.body.id], function (err) {
            if (err) {
                return res.send(err);
            } else {
                return res.send({
                    valid: true
                });
            }

        });
    }
    else {
        client.query(`UPDATE rooms SET name = $1, code = $2, time = $3, repeat = $4,cover =$5, presenter_id = $6 WHERE id = $7;`, [req.body.name, req.body.code, req.body.date, req.body.repeat, req.body.cover, req.body.presenter_id, req.body.id], function (err) {
            if (err) {
                return res.send(err);
            } else {
                return res.send({
                    valid: true
                });
            }

        });
    }
}
function deleteMeeting(req, res, next) {
    let id = req.params.id;
    client.query(`DELETE FROM messages WHERE room_id=$1`, [id], function (err) {

        if (err) {
            return res.send(`Error deleting meeting by ID: ${err.message}`);
        }

    });
    client.query(`DELETE FROM rooms WHERE id=$1`, [id], function (err) {

        if (err) {
            return res.send(`Error deleting meeting by ID: ${err.message}`);
        }else{
            next();
        }

    });
}
function getMessages (req, res){
    client.query('SELECT * FROM messages;', [], function (err, result) {

        if (err) {
            return res.send(err);
        } else {
            res.render('admin_page/admin_messages', {messages: result.rows, profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}


function deleteMessage(req, res, next) {
    let id = req.params.id;
    client.query(`DELETE FROM messages WHERE id = $1`, [id], function (err) {

        if (err) {
            return res.send(`Error  deleting user by ID: ${err.message}`);
        }else{
            next();
        }
    });
}

function editMessage (req, res){

    let id = req.params.id;

    client.query('SELECT * FROM messages WHERE id = $1;', [id], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_edit_message', { message_error: req.flash('error'),message: result.rows[0], profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}
function updateMessage(req, res, next) {
    let content = req.body.content;
    let type = req.body.type;
    let room_id = req.body.room_id;
    let id = req.params.id;
    client.query(`UPDATE messages SET content = $1, room_id = $2, type= $3 WHERE id = $4;`, [content, room_id, type, id], function (err) {
        if (err) {
            req.flash('error',"We couldn't save your changes!");
            res.redirect('/administrator/messages/'+id+'/edit');
        } else {
            next();
        }

    });
}
function getWords (req, res){
    client.query('SELECT * FROM forbidden_words;', [], function (err, result) {

        if (err) {
            return res.send(err);
        } else {
            res.render('admin_page/admin_words', {words: result.rows, profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}
function addWord(req, res, next) {

    let word = req.body.word;

    client.query(`INSERT INTO forbidden_words(word) VALUES($1)`, [word], function (err) {

        if (err) {
            return res.send(err);
        }else{
            next();
        }

    });
}

function deleteWord(req, res, next) {
    let id = req.params.id;
    client.query(`DELETE FROM forbidden_words WHERE id = $1`, [id], function (err) {

        if (err) {
            return res.send(`Error  deleting user by ID: ${err.message}`);
        }else{
            next();
        }
    });
}

function updateWord(req, res, next) {
    let word = req.body.word;
    let id = req.params.id;
    client.query(`UPDATE forbidden_words SET word = $1 WHERE id = $2;`, [word, id], function (err) {
        if (err) {
            req.flash('error',"We couldn't save your changes!");
            res.redirect('/administrator/words/'+id+'/edit');
        } else {
            next();
        }

    });
}
function editWord (req, res){

    let id = req.params.id;

    client.query('SELECT id, word FROM forbidden_words WHERE id = $1;', [id], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('admin_page/admin_edit_word', {message_error: req.flash('error'), forbidden: result.rows[0], profile: req.user.username, layout: "admin_page/layout"});
        }

    });
}
module.exports ={updateMessage, editMessage,deleteMessage, getMessages,adminValid, deleteMeeting, getWords, addWord, deleteWord,updateWord, editWord, editUser,updateUser,getUsers, addUser, deleteUser, getMeetings, editMeeting,addMeeting,updateMeeting}