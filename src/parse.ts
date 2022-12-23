export enum ResultType {
    Movie,
    Actor
}

export type QueryResult = {
    name: string,
    resultType: ResultType
}

function lastIndexOfType(resultList: QueryResult[], propertyType: ResultType): boolean {
    if (resultList.length == 0) {
        return false
    }
    let lastIndex = resultList.length - 1
    return resultList[lastIndex].resultType == propertyType
}

export function parseQueryTraceResults(tracedPath: any): QueryResult[] {
    let resultList: QueryResult[] = []
    tracedPath.forEach((element: any) => {
        const start = element['start']
        const end = element['end']

        if (start["labels"].includes("Person") && 
            !lastIndexOfType(resultList, ResultType.Actor)) {
            resultList.push({name: start["properties"]["name"], resultType: ResultType.Actor})
        } else if (start["labels"].includes("Movie")) {
            resultList.push({name: start["properties"]["movieName"], resultType: ResultType.Movie})
        }

        if (end["labels"].includes("Person")) {
            resultList.push({name: end["properties"]["name"], resultType: ResultType.Actor})
        }

    });
    return resultList
}