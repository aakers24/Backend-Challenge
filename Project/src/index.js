"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sequelize_1 = require("sequelize");
const axios_1 = __importDefault(require("axios"));
const { Sequelize } = require('sequelize');
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
var sequelize = new Sequelize('postgres://postgres:samplePass@127.0.0.1:5432/utsafedb'); // !!!! SECURITY ISSUE !!!!
const hostname = "127.0.0.1";
const port = 3000;
app.listen(port, hostname, () => {
    console.log("Server running!");
});
// Authenticate with the db
var connectionTest = sequelize.authenticate()
    .then(function () {
    console.log("Connected to DB!");
})
    .catch(function (err) {
    console.error("Did not connect to DB.", err, "\nStopping Server.");
    process.exit(1); // Maybe handle more gracefully?
});
// Set up the model for the table
const quotesTable = sequelize.define("Quotes", {
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false
    },
    carModel: {
        type: sequelize_1.DataTypes.STRING
    },
    YODE: {
        type: sequelize_1.DataTypes.INTEGER
    },
    quote: {
        type: sequelize_1.DataTypes.DOUBLE
    },
    company: {
        type: sequelize_1.DataTypes.STRING
    }
});
// Create the table if it doesn't already exist.
quotesTable.sync({ alter: true });
// If authenticating or creating the model for the table didn't work, the program won't work
// At that point the service is effectively down and should terminate and/or someone should be notified
if (!quotesTable) {
    console.log("Database table could not be accessed or created. Stopping Server.");
    process.exit(1); // Maybe handle more gracefully?
}
app.get("/", function (req, res) {
    res.status(200).sendFile(__dirname + "/index.html");
});
app.post("/api/quotes", function (req, res) {
    // Take input and validate it
    var name = req.body.name;
    var age = req.body.age;
    var carModel = req.body.carModel;
    var YODE = req.body.YODE;
    var regChars = /[^A-Za-z ]/;
    var regChars2 = /[^A-Za-z0-9 ]/;
    if (typeof name !== "string" || typeof carModel !== "string") {
        console.log("\n\nPROBLEMO\n\n");
    }
    else {
        if (regChars.test(name)) {
            res.status(400).send("Invalid Name.");
            return;
        }
        else if (regChars2.test(carModel)) {
            res.status(400).send("Invalid Car Model.");
            return;
        }
        else if (!Number.isInteger(+age)) {
            res.status(400).send("Invalid Age.");
            return;
        }
        else if (!Number.isInteger(+YODE)) {
            res.status(400).send("Invalid Years of Driving Experience.");
            return;
        }
    }
    // Call to mock API
    axios_1.default.get("http://localhost:4000/insuranceCompanies")
        .then((response) => {
        for (var i = 0; i < response.data.length; i++) {
            // myQuote is only being calculated here so the example isn't quite as trivial with the mock API.
            // In reality the external API would be giving a real, personalized quote.
            var myQuote = response.data[i].quote + nameToNum(name);
            // Save quotes to DB
            quotesTable.create({ name: name, age: age, carModel: carModel, YODE: YODE, quote: myQuote, company: response.data[i].company });
        }
    })
        .catch(function (err) {
        console.error("Couldn't connect to mock API", err);
    });
    res.status(200).send("Quotes generated and saved for " + name + ", " + age + ", " + carModel + ", " + YODE + " years of driving experience.");
});
app.get("/api/quotes/best-three", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Take input and validate it
        var name = req.query.name;
        var regChars = /[^A-Za-z ]/;
        if (typeof name !== "string") {
        }
        else {
            if (regChars.test(name)) {
                res.status(400).send("Invalid Name.");
                return;
            }
        }
        // Pull top 3 quotes from DB
        try {
            const myQuotes = yield quotesTable.findAll({
                attributes: ["quote", "company"],
                where: {
                    name: {
                        [sequelize_1.Op.eq]: name
                    }
                },
                order: [
                    ['quote', "ASC"]
                ],
                limit: 3
            });
            res.status(200).send(myQuotes);
        }
        catch (err) {
            console.error("Couldn't fetch best quotes from DB.", err);
            res.send("Couldn't fetch best quotes from DB. Please try again or contact support.");
        }
    });
});
// A function to give some variety to quote values for the sake of the example.
function nameToNum(name) {
    var num = 0;
    for (var i = 0; i < name.length; i++) {
        num += name.charCodeAt(i);
    }
    return Math.round(num + Math.random() * 50);
}
