#!/usr/bin/env node

import chalk, { Chalk } from 'chalk'
import clear from 'clear'
import figlet from 'figlet'
import program from 'commander'
import { loadFiles } from './loader'
import { ActorRepository } from './repository'
import { parseQueryTraceResults, ResultType } from './parse'

const url = process.env['NEO_4J_PATH'] || "bolt://localhost:7687"
const username = process.env['NEO_4J_USERNAME'] || "neo4j"
const password = process.env['NEO_4J_PASSWORD'] || "password"

clear();
console.log(
    chalk.blue(
        figlet.textSync('bacon-cli', { horizontalLayout: 'full' })
    )
)

const bacon = new program.Command();
bacon
    .command('load')
    .argument("<filepath:string>")
    .action((filepath: string) => {
        const actorRepo: ActorRepository = new ActorRepository(url, username, password)
        const promise = loadFiles(filepath, actorRepo)
        promise.catch(() => {
            console.log("Error in writing data to neo4j.")

        })
        promise.finally(() => {
            console.log("Finished writing data to neo4j.")
            process.exit()
        })
    });
bacon 
    .command('trace')
    .argument("<actor1:string>")
    .argument("<actor2:string>")
    .action((actor1: string, actor2: string) => {
            const actorRepo: ActorRepository = new ActorRepository(url, username, password);
            const promise = actorRepo.findConnection(actor1, actor2)
            promise.then((results) => {
                if (results?.records.length == 0) {
                    console.log("No path found")
                    process.exit()
                }
                const path = results?.records[0]["_fields"][0]["segments"]
                const outList = parseQueryTraceResults(path)
                const textOut: string[] = []
                outList.forEach((result)=>{
                    if(result.resultType == ResultType.Actor) {
                        textOut.push(chalk.blue(result.name))
                    } else {
                        textOut.push(chalk.red(result.name))
                    }
                })
                console.log(...textOut)
                process.exit()
            })
    });

bacon.parse()