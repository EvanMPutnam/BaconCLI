import fs from 'fs'
import csv from 'csv-parser'
import { ActorRepository } from './repository'
import { Connection } from './model'

async function processLine(lines: Connection, repository: ActorRepository) {
    await repository.initialize()
    await repository.addActor(lines.actorName, lines.actorId)
    await repository.addMovie(lines.movieName)
    await repository.addActorMovieConnection(lines.movieName, lines.actorName)
}

export async function loadFiles(path: string, repository: ActorRepository): Promise<boolean> {
    if (!fs.existsSync(path)) {
        return false
    }

    try {        
        const data: Connection[] = []
        await new Promise(function(resolve, reject) {
            fs.createReadStream(path)
              .pipe(csv())
              .on('error', (error: any) => reject(error))
              .on('data', (row: Connection) => data.push(row))
              .on('end', () => {
                resolve(data);
              });
        });
        let count = 0
        let totalSize = data.length
        for (let line of data) {
            await processLine(line, repository)
            if (count % 1000 === 0) {
                console.log(count, "of", totalSize)
            }
            count++
        }
        return true
    } catch (error) {
        console.error(error)
        return false
    }
}