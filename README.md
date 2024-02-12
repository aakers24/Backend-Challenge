# README

### Prerequisites

* Node.js and npm are installed on the system. Typescript is also required if you want to transpile the typescript code, but the transpiled js code is included by default.

* A PostgreSQL server is running on the system on the default port with a user postgres:samplePass and the DB utsafedb.

* JSON-Server running mockAPI.json on port 4000.

---

### Instructions

* Run a PostgreSQL server on the default port with user postgres:samplePass and the DB utsafedb created.

* Run the mock API with `npx json-server --watch mockAPI.json --port 4000` from the Project directory.

* From the Project directory, run `node src/index.js`.

* Open a web browser and navigate to `localhost:3000/`.

* Input desired data into the first 4 fields and submit it with the "Generate Quotes" button. If the inputs are valid, this will fetch the quotes from the mock API and save the information in the database.

* To fetch the best 3 quotes for a name that has been input via the "Generate Quotes" form, input the same name into the second "Name" field and press the "Get Best Quotes" button. If the input is valid, it will fetch the 3 best quotes from the database. If the input is valid but the user does not exist, nothing will be returned.