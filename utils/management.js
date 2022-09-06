var jwt = require('jsonwebtoken');
var uuid4 = require('uuid4');

const getManagementToken = () => {
    return new Promise((resolve, reject) => {
        jwt.sign({
            access_key: process.env.HMS_APP_ACCESS_KEY,
            type: 'management',
            version: 2,
            iat: Math.floor(Date.now() / 1000),
            nbf: Math.floor(Date.now() / 1000)
        },
            process.env.HMS_APP_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '1h',
                jwtid: uuid4()
            },
            function (err, token) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(token);
                }
            }
        )
    })
}

const getMeetToken = (data) => {
    var payload = {
        access_key: process.env.HMS_APP_ACCESS_KEY,
        room_id: data.room_id,
        user_id: data.user_id,
        role: data.role,
        type: 'app',
        version: 2,
        iat: Math.floor(Date.now() / 1000),
        nbf: Math.floor(Date.now() / 1000)
    };

    return new Promise((resolve, reject) => {
        jwt.sign(
            payload,
            process.env.HMS_APP_SECRET,
            {
                algorithm: 'HS256',
                expiresIn: '24h',
                jwtid: uuid4()
            },
            function (err, token) {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(token);
                }
            }
        );
    })
}

const getMToken = async () => {
    var token = await getManagementToken();
    return token;
}

const getUToken = async (data) => {
    var token = await getMeetToken(data);
    return token;
}

module.exports = {
    getMToken,
    getUToken
}