# 📚 Backend Learning Management System (LMS)

A complete LMS (Learning Management System) built with **Node.js**, **Express**, **MySQL**, and **Sequelize ORM**. This project provides essential features like user authentication, course management, and admin control—ideal for e-learning platforms.

## ⚙️ Features

- 🔐 RESTful API with authentication & authorization  
- 👥 Role-based access (Admin & User)  
- 📘 Course and category management  
- 🧱 Database migrations and seeders  
- 🐳 Dockerized MySQL support  

## 🚀 Getting Started

### 1️⃣ Configure Environment Variables

Copy the example environment file and update the configuration:

```txt
PORT=3000
SECRET=<YOUR KEY>
```

### 2️⃣ Generate a Secret Key

Run the following in the command line:

```shell
node
```

Then, in the interactive mode:

```shell
const crypto = require('crypto');
console.log(crypto.randomBytes(32).toString('hex'));
```

Copy the generated secret key and paste it into the SECRET field of your .env file.
> Tip: Press `Ctrl + C` to exit interactive mode.


### 3️⃣ Set Up the Database

The project uses Docker to run a MySQL database container. After installing Docker, you can start the MySQL container with:

```shell
docker-compose up -d
```

If prefer to use your own MySQL installation, update the username and password fields in config/config.json:

```json
{
  "development": {
    "username": "your_database_username",
    "password": "your_database_password"
  }
}
```

### 4️⃣ Install & Run the Project

```shell
# Install dependencies
npm i

# Create the database (you can also create it manually if this fails)
npx sequelize-cli db:create --charset utf8mb4 --collate utf8mb4_general_ci

# Run migrations to create tables
npx sequelize-cli db:migrate

# Run seeders to populate initial data
npx sequelize-cli db:seed:all

# Start the server
npm start
```

Once the server is running, visit:
👉 http://localhost:3000

Check the API documentation for detailed usage.

## 🔐 Default Admin Credentials

```txt
login：admin
password: 123123
```
