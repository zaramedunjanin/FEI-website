const jwt = require("jsonwebtoken");
const client = require("../config/database");

function presenterValid(req, res, next){

    if(req.isAuthenticated()) {
        if (req.user.role === "presenter")
            next();
        else
            res.redirect('/');
    }
    else
        res.redirect('/');


}

function getMeetings (req, res){
    let id = req.user.id;
    if(req.query.sort === "oldest"){

        client.query('SELECT * FROM rooms WHERE presenter_id = $1 ORDER BY time DESC', [id], function (err, result) {
            if (err) {
                return res.send(err);
            }else{
                res.render('presenter_page/presenter_meetings', { meetings: result.rows, profile: req.user.username, layout: "presenter_page/layout"});
            }

        });
    }
    else if(req.query.sort === "newest"){

        client.query('SELECT * FROM rooms WHERE presenter_id = $1 ORDER BY time', [id], function (err, result) {
            if (err) {
                return res.send(err);
            }else{
                res.render('presenter_page/presenter_meetings', { meetings: result.rows, profile: req.user.username, layout: "presenter_page/layout"});
            }

        });
    }
    else {
        client.query('SELECT * FROM rooms WHERE presenter_id = $1 ORDER BY id', [id], function (err, result) {
            if (err) {
                return res.send(err);
            } else {
                res.render('presenter_page/presenter_meetings', {
                    meetings: result.rows,
                    profile: req.user.username,
                    layout: "presenter_page/layout"
                });
            }

        });
    }
}


function getStatistics (req, res){
    let id = req.user.id;
    client.query('SELECT id, name, unanswered_questions, answered_questions FROM rooms WHERE presenter_id = $1;', [id], function (err, result) {
        if (err) {
            return res.send(err);
        }else{
            res.render('presenter_page/presenter_statistics', { meetings: result.rows, profile: req.user.username, layout: "presenter_page/layout"});
        }

    });
}

function addMeeting(req, res, next) {
    let id = req.user.id;
    client.query(`INSERT INTO rooms(code, time, repeat, name, cover, presenter_id) VALUES($1,$2, $3,$4,$5,$6)`, [req.body.code,req.body.date,req.body.repeat,req.body.name,req.body.cover, id], function (err) {

        if (err) {
            return res.send(err);
        }else{
            return res.send({
                valid:true
            });
        }

    });
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

function updateMeeting (req, res, next){
    if(req.body.cover === null){
        client.query(`UPDATE rooms SET name = $1, code = $2, time = $3, repeat = $4 WHERE id = $6;`, [req.body.name, req.body.code,req.body.date,req.body.repeat, req.body.id], function (err) {
            if (err) {
                return res.send(err);
            } else {
                return res.send({
                    valid:true
                });
            }

        });
    }
    else {
        client.query(`UPDATE rooms SET name = $1, code = $2, time = $3, repeat = $4,cover =$5 WHERE id = $6;`, [req.body.name, req.body.code, req.body.date, req.body.repeat, req.body.cover, req.body.id], function (err) {
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
function editMeeting (req, res){
    let id = req.params.id;
    req.body.meeting_id = id;
    client.query('SELECT * FROM rooms WHERE id = $1;', [id], function (err, result) {

        if (err) {
            return res.send(err);
        }else{
            res.render('presenter_page/presenter_edit_meeting', { id: id,meeting: result.rows[0], profile: req.user.username, layout: "presenter_page/layout"});
        }

    });
}
function getMeeting(req,res,next){
    var code = req.params.code;
    let id = req.query.id;

    client.query(`SELECT content, type, likes FROM messages WHERE room_id=$1`, [id], function (err, result) {
        if (err)
            return res.send(err);
        else {
            req.body.meeting ={code: code};
            res.render('presenter_page/presenter_meeting',{profile:req.user.username, code:code, messages:result.rows, id:id, layout: "presenter_page/layout"});

        }
    });
}
function getMeeting2(req,res,next){
    let id = req.params.id;

    client.query(`SELECT name, code FROM rooms WHERE id=$1`, [id], function (err, result) {
        if (err)
            return res.send(err);
        else {
            req.body.meeting ={name:result.rows[0].name,code: result.rows[0].code};
            next();
        }
    });
}
function inviteParticipants(req,res,next){
    var code = req.params.code;
    let id = req.query.id;

    client.query(`SELECT id, content, type, likes FROM messages WHERE room_id=$1`, [id], function (err, result) {
        if (err)
            return res.send(err);
        else {
            res.render('presenter_page/presenter_meeting',{profile:req.user.username, code:code, messages:result.rows, id:id, layout: "presenter_page/layout"});

        }
    });
}

function deleteMessage(req, res, next) {
    let id = req.params.id;
    client.query(`DELETE FROM messages WHERE id=$1`, [id], function (err) {
        if (err) {
            return res.send(`Error deleting message by ID: ${err.message}`);
        }
        else{
            next();
        }
    });

}

module.exports = {getMeeting2, deleteMessage, inviteParticipants, presenterValid, getMeeting, updateMeeting, editMeeting, deleteMeeting, addMeeting, getStatistics, getMeetings}