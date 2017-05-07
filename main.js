#!/usr/bin/env node

let restify = require('restify'),
    pushover = require('node-pushover');

const config = require('./config');

let server = restify.createServer();

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

let push = new pushover({
    token: config.pushover_token
});

let sendPush = (message) => {

    config.pushover_users.forEach((user) => {
        push.send(user.key, "[Graylog Alerts]", message, (err, res) => {

            if(err)
                console.log(`Error in send push for user ${user.name}`, err, err.stack);
            else
                console.log(`Push sent for user ${user.name}`);

        });
    });

};

server.get('/', (req, res, next) => {
    res.send(200);
    return next();
});

server.post('/errors_rate', (req, res, next) => {

    if(req.body) {

        let facility = req.body.check_result.matching_messages[0].fields.facility;

        let message = `Errors rate increased in facility ${facility}`;

        console.log(message);

        sendPush(message);

        res.send(200);
        return next();

    }

});

server.post('/response_time', (req, res, next) => {

    if(req.body) {

        let facility = req.body.check_result.matching_messages[0].fields.facility;

        let message = `Response time increased in facility ${facility}`;

        console.log(message);

        sendPush(message);

        res.send(200);
        return next();

    }

});

server.listen(8080, () => {
    console.log('%s listening at %s', server.name, server.url);
});