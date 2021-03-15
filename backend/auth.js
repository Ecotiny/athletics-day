module.exports = {
  basicAuth,
  getAll,
  authenticate
};

// users hardcoded for simplicity
const users = [
  { id: 1, username: 'test', password: 'test', firstName: 'Test', lastName: 'User' }
];

async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) { // remove password before sending it off
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

async function getAll() {
    return users.map(u => { // strip users of passwords before sending them off
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function basicAuth(req, res, next) { // middleware function
    // make some path public
    const public_paths = ['/api/auth', '/api/points/', '/', '/api/house'];
    if (public_paths.indexOf(req.path) > -1) {
        return next();
    }
    if (req.path.includes("/api/points/")) {
    	return next();
    }

    // check for basic auth header
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    // verify auth credentials
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const user = await authenticate({ username, password });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }

    // attach user to request object
    req.user = user

    next();
}
