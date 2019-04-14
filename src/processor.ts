import * as cheerio from 'cheerio'
import { RxHttpRequestResponse } from '@akanass/rx-http-request'

export const htmlProcessor = (
  data: [string, RxHttpRequestResponse],
  index: number
): Record<string, Record<string, number>> => {
  const [hero, z] = data
  const body = z.body
  const $ = cheerio.load(body)
  const sink: Record<string, number> = {}

  $('tbody tr').each((_, e) => {
    if (!$('td', e).hasClass('talent-cell')) {
      const advantage = Number($('td:nth-child(3)', e).attr('data-value'))
      const name = $('td a', e)
        .attr('href')
        .replace('/heroes/', '')
      sink[name] = advantage
    }
  })

  return {
    [hero]: sink,
  }
}
