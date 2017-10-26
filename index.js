const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID
const bodyParser = require('body-parser');
const express = require("express");
const app = express();
const routerREST = express.Router();
const url = 'mongodb://localhost:27017/textbook';
const port = process.env.PORT || 3000;
let collection;
MongoClient.connect(url, (err, db) => {
    if (err) {
        console.log('Произошла ошибка: ', err);
    }
    else {
        collection = db.collection('users');
    }
});

app.use(bodyParser.urlencoded({
    extended: true
}));

routerREST.get("/contacts", (req, result) => {
    let filter = {};
    if(req.query.name) {
        filter.name = {$regex: '.*' + req.query.name.toLowerCase() + '.*'}
    }
    if(req.query.lastname) {
        filter.lastname = {$regex: '.*' + req.query.lastname.toLowerCase() + '.*'}
    }
    if(req.query.phone) {
        filter.phone = (req.query.phone) ? {$regex: '.*' + req.query.phone.toLowerCase() + '.*'} : null;
    }

    let options = {};
    options.limit = parseInt(req.query.limit) || null;
    options.skip = parseInt(req.query.skip) || null;
    options.sort = req.query.sort || null;

    collection.find(filter, options).toArray((err, res) => {
        if (err) {
            result.json({
                success: false,
                error: err
            });
        }
        else {
            result.json(res);
        }
    });
});

routerREST.get("/contacts/:id", (req, result) => {
    collection.findOne({_id: ObjectID(req.params.id)}, (err, res) => {
        if (err) {
            result.json({
                success: false,
                error: err
            });
        }
        else {
            result.json(res);
        }
    });
});

routerREST.post("/contacts", (req, result) => {
    collection.insert({
        name: req.body.name,
        lastname: req.body.lastname,
        phone: req.body.phone
    }, (err, res) => {
        if (err) {
            result.json({
                success: false,
                error: err
            });
        }
        else {
            result.json({
                success: true,
                _id: res.ops[0]._id
            });
        }
    });
});

routerREST.put("/contacts/:id", (req, result) => {
    collection.updateOne(
        {_id: ObjectID(req.params.id)},
        {
            $set: {
                name: req.body.name,
                lastname: req.body.lastname,
                phone: req.body.phone
            }
        },
        {},
        (err, res) => {
            if (err) {
                result.json({
                    success: false,
                    error: err
                });
            }
            else {
                result.json({
                    success: true
                });
            }
        });
});

routerREST.delete("/contacts/:id", (req, result) => {
    const id = req.params.id;
    collection.remove({_id: ObjectID(id)}, {}, (err, res) => {
        if (err) {
            result.json({
                success: false,
                error: err
            });
        }
        else {
            result.json({
                success: true
            });
        }
    });
});

routerREST.delete("/contacts", (req, result) => {
    collection.remove({}, {}, (err, res) => {
        if (err) {
            result.json({
                success: false,
                error: err
            });
        }
        else {
            result.json({
                success: true
            });
        }
    });
});

app.use("/api/v1", routerREST);

app.use((req, res) => {
    res.status(404).send('Not found!');
});

app.listen(port);