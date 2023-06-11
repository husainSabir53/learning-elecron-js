const {Notification} = require('electron')


const dbConnectNotification = new Notification({
  title: 'CONNECTED TO DB',
  body: 'Successfully connected to database!',
});

const dbDisonnectedNotification = new Notification({
  title: 'UNABLE TO CONNECT TO DB',
  body: 'Failed connecting to database. Please try reloading application',
});


module.exports = {
  dbConnectNotification,
  dbDisonnectedNotification
}