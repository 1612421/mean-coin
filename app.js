const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const expressHbs = require('express-handlebars');
const HandleBars = require('handlebars');
const HandlebarsIntl = require('handlebars-intl');
const logger = require('morgan');
const flash = require('connect-flash')
//const MongoStore = require('connect-mongo')(session);

const homeRoute = require('./routes/home');
const keypairRoute = require('./routes/keypair');

HandlebarsIntl.registerWith(HandleBars);

const app = express();
dotenv.config();

app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    helpers: {
        if_equal : function(a, b, opts) {
            if (a === b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this)
            }
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

// add route
app.use('/', homeRoute);
app.use('/wallet', keypairRoute);


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