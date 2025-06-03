var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const adminArticlesRouter = require('./routes/admin/articles'); // 1. must include the route for admin articles
const adminCategoryRouter = require('./routes/admin/categories'); // Uncomment if you want to use the category router
const adminSettingsRouter = require('./routes/admin/settings'); // Uncomment if you want to use the settings router

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/admin/articles',adminArticlesRouter); //2. use the admin articles router
app.use('/admin/categories', adminCategoryRouter); // Uncomment if you want to use the category router
app.use('/admin/settings', adminSettingsRouter); // Uncomment if you want to use the settings router

module.exports = app;
