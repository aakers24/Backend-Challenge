import express, {Request, Response, Router} from "express";
import { DataTypes, Op } from "sequelize";
import axios from "axios";
const { Sequelize } = require('sequelize');



var app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
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
.catch(function (err: Error) {
    console.error("Did not connect to DB.", err, "\nStopping Server.");
    process.exit(1); // Maybe handle more gracefully?
});

// Set up the model for the table
const quotesTable = sequelize.define("Quotes", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    carModel: {
        type: DataTypes.STRING
    },
    YODE: {
        type: DataTypes.INTEGER
    },
    quote: {
        type: DataTypes.DOUBLE
    },
    company: {
        type: DataTypes.STRING
    }
});
// Create the table if it doesn't already exist.
quotesTable.sync({alter: true});

// If authenticating or creating the model for the table didn't work, the program won't work
// At that point the service is effectively down and should terminate and/or someone should be notified
if (!quotesTable) {
    console.log("Database table could not be accessed or created. Stopping Server.");
    process.exit(1); // Maybe handle more gracefully?
}



app.get("/", function(req: Request, res: Response) {

    res.status(200).sendFile(__dirname+"/index.html");

});



app.post("/api/quotes", function(req: Request, res: Response) {

    // Take input and validate it
    var name: String = req.body.name;
    var age: Number = req.body.age;
    var carModel: String = req.body.carModel;
    var YODE: Number = req.body.YODE;

    var regChars = /[^A-Za-z ]/;
    var regChars2 = /[^A-Za-z0-9 ]/;

    if(typeof name !== "string" || typeof carModel !== "string") {
        console.log("\n\nPROBLEMO\n\n");
    } else {
        if(regChars.test(name)) {
            res.status(400).send("Invalid Name.");
            return;
        } else if (regChars2.test(carModel)) {
            res.status(400).send("Invalid Car Model.");
            return;
        } else if (!Number.isInteger(+age)) {
            res.status(400).send("Invalid Age.");
            return;
        } else if (!Number.isInteger(+YODE)) {
            res.status(400).send("Invalid Years of Driving Experience.");
            return;
        }
    }



    // Call to mock API
    axios.get("http://localhost:4000/insuranceCompanies")
    .then((response)=>{
        for(var i = 0; i < response.data.length; i++){
            // myQuote is only being calculated here so the example isn't quite as trivial with the mock API.
            // In reality the external API would be giving a real, personalized quote.
            var myQuote = response.data[i].quote + nameToNum(name);
            // Save quotes to DB
            quotesTable.create({name: name, age: age, carModel: carModel, YODE: YODE, quote: myQuote, company: response.data[i].company});
        }
    })
    .catch(function (err: Error) {
        console.error("Couldn't connect to mock API", err);
    });



    res.status(200).send("Quotes generated and saved for "+name+", "+age+", "+carModel+", "+YODE+" years of driving experience.");

});



app.get("/api/quotes/best-three", async function(req: Request, res: Response) {

    // Take input and validate it
    var name = req.query.name;

    var regChars = /[^A-Za-z ]/;

    if(typeof name !== "string") {

    } else {
        if(regChars.test(name)) {
            res.status(400).send("Invalid Name.");
            return;
        }
    }



    // Pull top 3 quotes from DB
    try {
        const myQuotes = await quotesTable.findAll({
            attributes: ["quote", "company"],
            where: {
                name: {
                    [Op.eq]: name
                }
            },
            order: [
                ['quote', "ASC"]
            ],
            limit: 3
        });

        res.status(200).send(myQuotes);

    } catch (err) {
        console.error("Couldn't fetch best quotes from DB.", err);
        res.send("Couldn't fetch best quotes from DB. Please try again or contact support.");
    }

});



// A function to give some variety to quote values for the sake of the example.
function nameToNum(name: String) {
    var num = 0;
    for(var i = 0; i < name.length; i++) {
        num += name.charCodeAt(i);
    }
    return Math.round(num + Math.random() * 50);
}