
const fs = require("fs");
const dbFile = "./chat.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const dbWrapper = require("sqlite");
let db;
let crypto = require("crypto");

dbWrapper.open({
    filename: dbFile,
    driver: sqlite3.Database
}).then(async dBase => {
    db = dBase;
    try {
        if (!exists) {
            await db.run(
                `CREATE TABLE user (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    login VARCHAR(40) UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    salt TEXT
                );`
            )
            await db.run(
                `CREATE TABLE message (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content TEXT NOT NULL,
                    author_id INTEGER NOT NULL,
                    FOREIGN KEY(author_id) REFERENCES user(id)
                );`
            )
        } else {
            console.log(await db.all("SELECT * FROM user"));
        }
    } catch (error) {
        console.error(error);
    }
});


module.exports = {
    getMessages: async () => {
        return await db.all(`
            SELECT message.id AS msg_id, author_id, content, login FROM message 
            JOIN user ON message.author_id = user.id
        `)
    },
    addMessage: async (msg, userid) => {
        try {
             await db.run(`INSERT INTO message (content, author_id) VALUES (?, ?)`, [msg, userid]);
        } catch(error) {
            console.log(error);
        }
    },
    isUserExist: async (login) => {
        let person = await db.all(`SELECT * FROM user WHERE login = ?`, [login]);
        return person.length;
    },
    addUser: async (user) => {
        let salt = crypto.randomBytes(16).toString("hex");
        let passCipher = crypto.pbkdf2Sync(user.password, salt, 1000, 100, 'sha512').toString("hex");
        await db.run(
            `INSERT INTO user (login, password, salt) VALUES (?, ?, ?)`,
            [user.login, passCipher, salt]
        )
    },
    getAuthToken: async (user) => {
        let person = await db.all(`SELECT * FROM user WHERE login = ?`, [user.login]);
        if (!person.length) {
            throw "Incorrect login";
        }
        const { id, login, password, salt } = person[0];
        const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 100, 'sha512').toString("hex");
        if (hash != password) {
            throw "Incorrect password";
        }
        return id + "." + login + "." + crypto.randomBytes(20).toString("hex");
    }
}