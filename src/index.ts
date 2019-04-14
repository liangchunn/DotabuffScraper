// tslint:disable:no-console
import * as path from 'path'
import * as fs from 'fs'
import * as progress from 'progress'
import { scrapeData } from './requester'
import { heroes } from './constants/heroes'

function main(): void {
  const progressBar = new progress(':status [:bar] :percent', {
    total: heroes.length + 2,
    width: 20,
    complete: '=',
    incomplete: ' ',
  })
  const sink: Record<string, Record<string, number>>[] = []

  // scrape hero data on the specified version with concurrency 10
  scrapeData(heroes, '7.21', 10).subscribe({
    next: heroData => {
      sink.push(heroData)
      progressBar.tick({
        status: 'Scraping DOTABUFF',
      })
    },
    complete: () => {
      // flatten the results from an array
      progressBar.tick({
        status: 'Flattening results',
      })
      const flattenedResults = sink.reduce((prev, curr) => {
        return {
          ...prev,
          ...curr,
        }
      }, {})

      // save the file to filesystem
      const pathName = path.join(process.cwd(), `result-${Date.now()}.json`)
      progressBar.tick({
        status: `Writing file`,
      })
      fs.writeFileSync(pathName, JSON.stringify(flattenedResults, null, 2))
      console.log(`Matchup data saved to ${pathName}`)
    },
    error: e => {
      console.log(`Fatal error: ${e}`)
      console.log(`Exiting...`)
      process.exit(1)
    },
  })
}

main()
