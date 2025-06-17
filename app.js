const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

require("dotenv").config();

/*-------------------------------------------------------------------------*/

// Import FRONTEND Routers
const userAuth = require("./middlewares/user-auth");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const categoriesRouter = require("./routes/categories");
const coursesRouter = require("./routes/courses");
const chaptersRouter = require("./routes/chapters");
const articlesRouter = require("./routes/articles");
const settingsRouter = require("./routes/settings");
const searchRouter = require("./routes/search");
const authRouter = require("./routes/auth");
const likesRouter = require("./routes/likes");

//Import BACKEND Routers
const adminAuth = require("./middlewares/admin-auth");
const adminArticlesRouter = require("./routes/admin/articles"); // Uncomment if you want to use the articles router
const adminCategoriesRouter = require("./routes/admin/categories"); // Uncomment if you want to use the category router
const adminSettingsRouter = require("./routes/admin/settings"); // Uncomment if you want to use the settings router
const adminUsersRouter = require("./routes/admin/users"); // Uncomment if you want to use the users router
const adminCoursesRouter = require("./routes/admin/courses");
const adminChaptersRouter = require("./routes/admin/chapters");
const adminChartsRouter = require("./routes/admin/charts");
const adminAuthRouter = require("./routes/admin/auth");

/*-------------------------------------------------------------------------*/

const app = express();
// CORS 跨域配置
const corsOptions = {
  origin: ["https://dylan.cn", "http://localhost:5500"],
};

// Enable middlewares
app.use(cors(corsOptions));
app.use(logger("dev")); // Logs concise request info to the console every time server handles a request.
app.use(express.json()); // Automatically converts JSON request bodies into JavaScript objects.
app.use(express.urlencoded({ extended: false })); //Parses the URL-encoded data (like name=zi&age=25) from the body of a POST request and Makes the parsed data available as a JavaScript object on req.body.
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); //serve static files from a directory(public).

// Add FRONTEND Routes
app.use("/", indexRouter);
app.use("/users", userAuth, usersRouter);
app.use("/categories", categoriesRouter);
app.use("/courses", coursesRouter);
app.use("/chapters", chaptersRouter);
app.use("/articles", articlesRouter);
app.use("/settings", settingsRouter);
app.use("/search", searchRouter);
app.use("/auth", authRouter);
app.use("/likes", userAuth, likesRouter);

// Add BACKEND Routes
app.use("/admin/articles", adminAuth, adminArticlesRouter); // Articles Router
app.use("/admin/categories", adminAuth, adminCategoriesRouter); // Categories Router
app.use("/admin/settings", adminAuth, adminSettingsRouter); // Settings Router
app.use("/admin/users", adminAuth, adminUsersRouter); // Users Router
app.use("/admin/courses", adminAuth, adminCoursesRouter); // Courses Router
app.use("/admin/chapters", adminAuth, adminChaptersRouter); // Chapters Router
app.use("/admin/charts", adminAuth, adminChartsRouter); // Charts Router
app.use("/admin/auth", adminAuthRouter); // No need to add adminAuth middleware here as this is for login(authentication)

module.exports = app;
