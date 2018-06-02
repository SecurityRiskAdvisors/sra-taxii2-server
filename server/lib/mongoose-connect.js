const mongoose = require('mongoose');

const mongooseConnect = (connectionString, databaseName, timeoutMs) => {
    try {
        mongoose.connect(connectionString + databaseName, {
            reconnectTries: 30,
            reconnectInterval: 500, // Reconnect every half second
        });
    } catch(err) {
        console.log("!!! NEED TO RETRY CONNECTION. DOES THIS WORK. !!!")
        if (err.message && err.message.match(/failed to connect to server .* on first connect/)) {
            console.log("Retrying first mongo connection... ");
            setTimeout(mongooseConnect, timeoutMs);
        }
    }
}

module.exports = mongooseConnect;