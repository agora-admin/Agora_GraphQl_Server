const axios = require('axios').default;
module.exports = {
    Query: {
        async ping(res, {}, context) {
            // console.log((context.req.headers.cookie.split('; ')[1]).split('=')[1]);
            // context.response.http.headers.append("Set-Cookie", 'jwt=sedecsecs');
            // console.log();
            return 'pong';
        },
        async serverVersion() {
            return '0.2.5';
        },
        async checkEnv() {
            return process.env.MONGODB !== null &&
                process.env.SECRET_KEY !== null &&
                process.env.ADMIN_SERVER_URL !== null &&
                process.env.HMS_APP_ACCESS_KEY !== null &&
                process.env.HMS_APP_SECRET !== null;
        },

        async checkAS() {
            try {
                var res = await axios.get(`${process.env.ADMIN_SERVER_URL}/ping`, {
                    headers: {
                        Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
                    }
                });
                if (res.status !== 200) { 
                    return 'error from admin server';
                }
                return res.data;
            } catch (err) {
                if (err.code === 'ECONNREFUSED') {
                    throw new Error('admin server offline');
                }
                throw new Error(err.message);
            }
        },

        async checkAdminBalance() {
            try {
                var res = await axios.get(`${process.env.ADMIN_SERVER_URL}/balance`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.ADMIN_SERVER_TOKEN}`
                    }
                });
                if (res.status !== 200) {
                    return 'error from admin server';
                }
                return res.data;
            } catch (err) {
                if (err.code === 'ECONNREFUSED') {
                    throw new Error('admin server offline');
                }
                throw new Error(err.message);
            }
        },

        async getENVState() {
            return process.env.NODE_ENV;
        },

    }
}