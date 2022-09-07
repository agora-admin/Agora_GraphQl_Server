const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const {
    validateRegisterInput,
    validateLoginInput,
    validateEmail
} = require('../../utils/validator.js');
const User = require('../../models/User.js');
const UserData = require('../../models/UserData.js');

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
    },
        process.env.SECRET_KEY,
        { expiresIn: '1d' }
    );
}

module.exports = {
    Mutation: {
        async login(_, { username, password }) {
            const { errors, valid } = validateLoginInput(username, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });

            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            user.lastLogin = new Date().toISOString();
            user.save();

            const token = generateToken(user);


            context.res.set('Set-Cookie', [
                `jwt=${token}; Max-Age=86400 ${process.env.NODE_ENV === 'development' ? '' : '; Domain=.agorasquare.xyz'};`,
            ])


            return {
                ...user._doc,
                id: user._id,
                token,
            };
        },

        async register(_, { registerInput }) {
            let username = registerInput.username;
            let email = registerInput.email;
            let password = registerInput.password;
            // Validate user data
            const { errors, valid } = validateRegisterInput(username, email, password);

            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            let user = await User.findOne({ username });
            if (user) {
                errors.username = 'Username is already taken';
                throw new UserInputError('Username is already taken', { errors });
            }

            user = await User.findOne({ email });

            if (user) {
                errors.email = 'Account with this email already exists';
                throw new UserInputError('Duplicate Email ', { errors });
            }

            // Hash password
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
            });

            const res = await newUser.save();

            // Demo User Data
            let name = registerInput.name;
            let bio = '';
            let img_url = '';
            let web_url = '';
            let cover_img_url = '';
            let emailVerified = false;
            let walletAddress = '';
            let walletConnected = false;
            let followers = [];
            let following = [];

            const newData = new UserData({
                name,
                email,
                bio,
                img_url,
                web_url,
                cover_img_url,
                emailVerified,
                walletAddress,
                walletConnected,
                followers,
                following,

                user: res.id,
                username: res.username,
                updatedAt: new Date().toISOString(),
            });

            const userData = await newData.save();

            const token = generateToken(res);

            context.res.set('Set-Cookie', [
                `jwt=${token}; Max-Age=86400 ${process.env.NODE_ENV === 'development' ? '' : '; Domain=.agorasquare.xyz'};`,
            ])

            return {
                ...res._doc,
                id: res._id,
                token,
            };
        },
    },

    Query: {
        findUserName: async (_, { username }) => {
            const user = await User.findOne({ username });
            const userData = await UserData.findOne({ username });
            if (!user && !userData) {
                return {
                    username,
                    available: true,
                    message: "Username is available",
                };
            }
            return {
                username,
                available: false,
                message: "Username is already taken",
            };
        },

        findEmail: async (_, { email }) => {

            const { errors, valid } = validateEmail(email);

            if (!valid) {
                throw new UserInputError('Invalid Email Address', { errors });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return {
                    email,
                    available: true,
                    message: "Email is available",
                };
            }
            return {
                email,
                available: false,
                message: "Email is already taken",
            };
        },

    }
};