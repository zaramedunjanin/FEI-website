const client = require("../config/database");

function getMessages(req, res,next){
    let id = req.params.id;
    client.query(`SELECT m.id AS msg_id, m.content AS content, m.likes AS likes, r.name AS room_name, r.id AS room_id FROM messages m
                    INNER JOIN rooms r ON m.room_id = r.id
                    WHERE r.id = $1`, [id], function (err, result) {
        if (err)
            return res.send(err);

        req.body.messages = result.rows;

        next();

    });
}
function getMeeting(req,res,next) {
    let id = req.params.id;
    client.query(`SELECT * FROM rooms WHERE id = $1`, [id], function (err, result) {
        if (err)
            return res.send(err);
        req.body.rooms = result.rows;
        next();
    });
}

function addMeessages(req,res,next){
    let id =
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
function validCode (req,res,next){
    let code = req.body.code;
    client.query(`SELECT * FROM rooms WHERE code = $1`, [code], function (err, result) {
        let current_date = new Date().toLocaleDateString();

        if (err) {
            req.flash('error', "Meeting doesn't exist");
            res.redirect('/');
        } else if (result.rows[0] === undefined) {
            req.flash('error', "Meeting doesn't exist");
            res.redirect('/');
        }else if(result.rows[0].time.toLocaleDateString() < current_date){
            req.flash('error', "Meeting has expired");
            res.redirect('/');
        }
        else {
            res.redirect('/meeting/'+result.rows[0].code);
        }
    });
}

module.exports = {addMeessages, getMeeting,validCode, getMessages};