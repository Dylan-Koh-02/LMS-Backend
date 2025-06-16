let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const adminAuth = require("./middlewares/admin-auth");
require("dotenv").config();
let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");
const adminArticlesRouter = require("./routes/admin/articles"); // Uncomment if you want to use the articles router
const adminCategoriesRouter = require("./routes/admin/categories"); // Uncomment if you want to use the category router
const adminSettingsRouter = require("./routes/admin/settings"); // Uncomment if you want to use the settings router
const adminUsersRouter = require("./routes/admin/users"); // Uncomment if you want to use the users router
const adminCoursesRouter = require("./routes/admin/courses");
const adminChaptersRouter = require("./routes/admin/chapters");
const adminChartsRouter = require("./routes/admin/charts");
const adminAuthRouter = require("./routes/admin/auth");

let app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use('/admin/articles', adminAuth, adminArticlesRouter);
app.use('/admin/categories', adminAuth, adminCategoriesRouter);
app.use('/admin/settings', adminAuth, adminSettingsRouter);
app.use('/admin/users', adminAuth, adminUsersRouter);
app.use('/admin/courses', adminAuth, adminCoursesRouter);
app.use('/admin/chapters', adminAuth, adminChaptersRouter);
app.use('/admin/charts', adminAuth, adminChartsRouter);
app.use('/admin/auth', adminAuthRouter);


module.exports = app;
