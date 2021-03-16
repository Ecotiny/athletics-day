// users hardcoded for simplicity, store in a db for production applications
const users = [{ id: 1, username: 'entry', password: 'aorakiwillwin', firstName: 'Aoraki', lastName: 'Patriot' },
               { id: 2, username: 'admin', password: 'aorakiwilldefinitelywin', firstName: 'Admin', lastName: 'User'}];

module.exports = {
    authenticate,
    getAll,
    users
};

async function authenticate({ username, password }) {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

