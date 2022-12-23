# BaconCLI
BaconCLI is a command line tool that searched for relations between actors in films using NEO4J as a backing database.  This was done as a simple exercise to test the capabilities of NEO4J.

## Setup
### NEO4J Config
The first step is to deploy a neo4j server and configure a user that has read/write permissions.
Then create environment variables for the following parameters:

- NEO_4J_PATH: for example `bolt://localhost:7687`
- NEO_4J_USERNAME
- NEO_4J_PASSWORD

### Loading a File
Next load a file into your NEO 4J instance.  This can be done with the `load` command:

`npm run start load <filename>`

A sample dataset is provided in the correct format in the `combined.csv` file present in the data zip folder.

### Run a Trace
Now you can run a comparison using the `trace` command:

`npm run start trace <actor1> <actor2>`
