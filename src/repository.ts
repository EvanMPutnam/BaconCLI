import { read } from 'fs';
import neo4j, {AuthToken, Session, Driver, auth, Result, QueryResult} from 'neo4j-driver'
import { type } from 'os';

type NullableString = string | null
type NullableAuthToken = AuthToken | null

/**
 * Simple repository class that allows interaction with neo4j.
 */
export class ActorRepository {

    private readonly driver: Driver;
    public ready: boolean = false;

    constructor(uri: string, username: NullableString = null, password: NullableString = null,
         authorization: NullableAuthToken = null) {
        if (username != null && password != null) {
            const loginAuth = auth.basic(username, password)
            this.driver = neo4j.driver(uri, loginAuth)
        } else if (authorization != null) {
            this.driver = neo4j.driver(uri, authorization)
        } else {
            throw new Error("Must provide (username, password, realm) or AuthToken object")
        }
    }

    public async initialize(): Promise<void> {
        const session = this.driver.session()
        if (this.ready) {
            return
        }
        try {
            await session.run(
                'CREATE CONSTRAINT ON (movie:Movie) ASSERT movie.movieName IS UNIQUE'
            )
            await session.run(
                'CREATE CONSTRAINT ON (actor:Person) ASSERT actor.name IS UNIQUE'
            )
        } catch(error) {
             session.close()
        } finally {
            this.ready = true
            session.close()
        }
    }

    async addActor(actor: string, actorID: string): Promise<QueryResult | null> {
        const session = this.driver.session()
        try {
            const results = await session.run(
                'CREATE (a:Person {actorID: $id, name: $name}) RETURN a',
                {id: actorID, name: actor}
            )
            session.close()
            return results
        } catch(error) {
            session.close()
            return null
        }
    }

    async addMovie(movieName: string): Promise<QueryResult | null> {
        const session = this.driver.session()
        try {
            const results = await session.run(
                'CREATE (a:Movie {movieName: $id}) RETURN a',
                {id: movieName}
            )  
            session.close()
            return results 
        } catch(error) {
            session.close()
            return null
        }
    }

    async addActorMovieConnection(movieName: string, actorName: string): Promise<QueryResult | null> {
        const session = this.driver.session()
        try {
            const results = await session.run(
                " \
                MATCH (a:Movie), (b:Person) WHERE a.movieName = $movieName AND b.name = $actorName  \
                CREATE (a)-[r: STARRED]->(b) \
                RETURN a,b  \
                ", 
                {movieName: movieName, actorName: actorName}
            )
            session.close()
            return results
        } catch(error) {
            session.close()
            return null
        }
    }

    async findConnection(actor1: string, actor2: string): Promise<QueryResult | null> {
        const session = this.driver.session()
        try {
            const results = await session.run("\
                MATCH p=shortestPath( \
                (p1:Person {name: $actor1 })<-[*]->(p2:Person {name: $actor2}) \
                ) \
                RETURN p \
                ", {actor1: actor1, actor2: actor2}
            )
            session.close()
            return results
        } catch(error) {
            session.close()
            return null
        }
    }
}