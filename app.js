let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
const adminArticlesRouter = require('./routes/admin/articles'); // Uncomment if you want to use the articles router
const adminCategoriesRouter = require('./routes/admin/categories'); // Uncomment if you want to use the category router
const adminSettingsRouter = require('./routes/admin/settings'); // Uncomment if you want to use the settings router
const adminUsersRouter = require('./routes/admin/users'); // Uncomment if you want to use the users router

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/admin/articles',adminArticlesRouter); // Uncomment if you want to use the articles router
app.use('/admin/categories', adminCategoriesRouter); // Uncomment if you want to use the categories router
app.use('/admin/settings', adminSettingsRouter); // Uncomment if you want to use the settings router
app.use('/admin/users', adminUsersRouter);

module.exports = app;
