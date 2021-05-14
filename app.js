require('dotenv').config();
require('./blockchain/blockchain-store');

const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const expressHbs = require('express-handlebars');
const HandleBars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');
const logger = require('morgan');
const flash = require('connect-flash')
const dateFormat = require('dateformat');
const moment = require('moment');
//const MongoStore = require('connect-mongo')(session);

const homeRoute = require('./routes/home');
const walletRoute = require('./routes/wallet');
const detailRoute = require('./routes/detail');

require('./common/mining-schedule').startMineBlockSchedule();

HandlebarsIntl.registerWith(HandleBars);
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    helpers: {
        if_equal: function (a, b, opts) {
            if (a === b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this)
            }
        },
        prettifyDate: function (timestamp) {
            return dateFormat(timestamp, 'mm-dd-yyyy H:MM:ss');
        },
        moment: function (timestamp) {
            return moment(+timestamp).fromNow(false);
        }
    }
}));
app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    secret: 'fit-hcmus',
    resave: false,
    saveUninitialized: false,
    //store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 180 * 60 * 1000} // Phút * giây * mili giây
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use((req, res, next) => {
    if (req.session.wallet) {
      res.locals.isLoggedIn = true;
    } else {
      res.locals.isLoggedIn = false;
    }
    
    next();
  });

// add route
app.use('/', homeRoute);
app.use('/wallet', walletRoute);
app.use(detailRoute);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.json({
        code: res.statusCode,
        messages: err.message
    });
});
  
  module.exports = app; 