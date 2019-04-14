import { from, Observable } from 'rxjs'
import { mergeMap, map, retry } from 'rxjs/operators'
import { htmlProcessor } from './processor'
import { RxHR, RxHttpRequestResponse } from '@akanass/rx-http-request'

const constructUrl = (hero: string, patchVersion: string): [string, string] => [
  hero,
  `https://www.dotabuff.com/heroes/${hero}/counters?date=patch_${patchVersion}`,
]

const requestHeroWithRetry = (
  hero: string,
  url: string
): Observable<[string, RxHttpRequestResponse<any>]> =>
  RxHR.get(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.13 (KHTML, like Gecko) Chrome/0.A.B.C Safari/525.13',
    },
  }).pipe(
    retry(5),
    map(resp => [hero, resp])
  )

export const scrapeData = (
  heroes: string[],
  version: string,
  concurrency: number
): Observable<Record<string, Record<string, number>>> =>
  from(heroes).pipe(
    map(hero => constructUrl(hero, version)),
    mergeMap(([hero, url]) => requestHeroWithRetry(hero, url), concurrency),
    map(htmlProcessor)
  )
