/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@hotmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { expect, test } from 'vitest'
import { tvdbLanguages } from '../TVDBLanguages'
import { currentSettings } from '../../../src/main/domain/Settings'
import { TVDBClient } from '../../../src/main/domain/clients/TVDBClient'
import { Languages } from '../../../src/common/LanguageIETF'

test('Search Series', async () => {
  currentSettings.favoriteLanguages = ['en']
  const series = await TVDBClient.getInstance().searchSeries('Friends', 1994)
  expect(series.length).toBeGreaterThan(0)
  expect(series[0].id).toBe(79168)
  expect(series[0].title).toBe('Friends')
  expect(series[0].year).toBe(1994)
  expect(series[0].originalTitle).toBe('Friends')
  expect(series[0].overview).toContain('Chandler Bing')
  expect(series[0].posterURL).toBe('https://artworks.thetvdb.com/banners/posters/79168-27.jpg')
  expect(series[0].language.code).toBe('en')
  expect(series[0].countries.length).toBe(1)
  expect(series[0].countries[0].alpha3).toBe('USA')
  expect(series[0].imdb).toContain('tt0108778')
})

test('Retrieve Series Details', async () => {
  currentSettings.favoriteLanguages = ['en']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(79168, 'official', 10, undefined, 2)
  expect(episode.episodeData.episodeNumber).toBe(10)
  expect(episode.episodeData.seasonNumber).toBe(2)
  expect(episode.episodeData.title).toBe('The One with Russ')
  expect(episode.episodeData.posterURL).toBe('https://artworks.thetvdb.com/banners/episodes/79168/303854.jpg')
  expect(episode.episodeData.absoluteNumber).toBe(34)
  expect(episode.episodeData.overview).toContain('Fun Bobby')
  expect(episode.seriesData.posterURL).toBe('https://artworks.thetvdb.com/banners/posters/79168-27.jpg')
  expect(episode.seriesData.title).toBe('Friends')
  expect(episode.seriesData.id).toBe(79168)
  expect(episode.seriesData.overview).toContain('Chandler Bing')
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha3).toBe('USA')
  expect(episode.seriesData.language.code).toBe('en-US')
  expect(episode.seriesData.originalTitle).toBe('Friends')
})

test('Retrieve Series Captain Marleau', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(316274, 'official', 1, undefined, 4)
  expect(episode.episodeData.episodeNumber).toBe(1)
  expect(episode.episodeData.seasonNumber).toBe(4)
  expect(episode.episodeData.title).toBe('La cité des âmes en peine')
  expect(episode.episodeData.posterURL).toBe(
    'https://artworks.thetvdb.com/banners/v4/episode/8141218/screencap/606fff72bc7a6.jpg'
  )
  expect(episode.episodeData.absoluteNumber).toBe(23)
  expect(episode.episodeData.overview).toContain(
    "Une vieille connaissance de Marleau est accusée de meurtre. La victime ? Le patron d’une pêcherie de Royan. La capitaine doit composer avec Alex Weller, un flic renommé que le procureur a co-saisi, et qui semble enquêter à charge. Entre trafic de cigarettes, précarité et revanche sociale, les mobiles fleurissent autour des habitants d'un quartier menacé de destruction. Mais les soupçons de Marleau se portent bientôt sur Weller : pourquoi a-t-il tenu à être chargé de l’enquête ? Y aurait-il un lien avec sa fille, autrefois retrouvée morte alors qu’elle était en vacances dans la région ?"
  )
  expect(episode.seriesData.posterURL).toBe(
    'https://artworks.thetvdb.com/banners/v4/series/316274/posters/648dd5cec300d.jpg'
  )
  expect(episode.seriesData.title).toBe('Capitaine Marleau')
  expect(episode.seriesData.id).toBe(316274)
  expect(episode.seriesData.overview).toContain(
    "Elément atypique de la gendarmerie nationale, la capitaine Marleau détonne par son franc-parler, sa gouaille et son accent ch'ti. Sarcastique, déconcertante, coiffée d'une improbable chapka, elle promène sa silhouette filiforme et son flegme sur les lieux de crime divers."
  )
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha2).toBe('FR')
  expect(episode.seriesData.language.code).toBe('fr-FR')
  expect(episode.seriesData.originalTitle).toBe('Capitaine Marleau')
})

test('Retrieve Series Details in French', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(79168, 'official', 10, undefined, 2)
  expect(episode.episodeData.episodeNumber).toBe(10)
  expect(episode.episodeData.seasonNumber).toBe(2)
  expect(episode.episodeData.title).toBe('Celui qui se dédouble')
  expect(episode.episodeData.posterURL).toBe('https://artworks.thetvdb.com/banners/episodes/79168/303854.jpg')
  expect(episode.episodeData.absoluteNumber).toBe(34)
  expect(episode.episodeData.overview).toContain('Rachel sort avec un garçon')
  expect(episode.seriesData.posterURL).toBe('https://artworks.thetvdb.com/banners/posters/79168-27.jpg')
  expect(episode.seriesData.title).toBe('Friends')
  expect(episode.seriesData.id).toBe(79168)
  expect(episode.seriesData.overview).toContain('6 jeunes New-Yorkais')
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha3).toBe('USA')
  expect(episode.seriesData.language.code).toBe('en-US')
  expect(episode.seriesData.originalTitle).toBe('Friends')
  expect(episode.seriesData.note).toBe(undefined)
})

test('Rate limiter', async () => {
  TVDBClient.getInstance().rateLimiter.setRate(1)
  let firstExecutedAt: number
  const prom1 = TVDBClient.getInstance()
    .retrieveSeriesDetails(79168, 'official', 10, undefined, 2)
    .then((_result) => {
      firstExecutedAt = Math.round(Date.now() / 1000)
    })
  let secondExecutedAt: number
  const prom2 = TVDBClient.getInstance()
    .retrieveSeriesDetails(79168, 'official', 5, undefined, 2)
    .then((_result) => {
      secondExecutedAt = Math.round(Date.now() / 1000)
    })
  let thirdExecutedAt: number
  const prom3 = TVDBClient.getInstance()
    .retrieveSeriesDetails(79168, 'official', 4, undefined, 2)
    .then((_result) => {
      thirdExecutedAt = Math.round(Date.now() / 1000)
    })

  await Promise.allSettled([prom1, prom2, prom3])

  expect(secondExecutedAt - firstExecutedAt).toBe(1)
  expect(thirdExecutedAt - secondExecutedAt).toBe(1)
  expect(thirdExecutedAt - firstExecutedAt).toBe(2)
})

test('check TVDB language id mappable to Language IETF', async () => {
  let pos = 0
  for (const tvdbLangCode of tvdbLanguages) {
    // console.log(Math.round(pos * 100 / tvdbLanguages.length) + "%");
    expect(Languages.getLanguageByCode(tvdbLangCode.id), 'Language not found [' + tvdbLangCode.id + ']').toBeDefined()
    pos++
  }
})

test('check TVDB country id mappable to Language IETF', async () => {
  let pos = 0
  for (const tvdbLangCode of tvdbLanguages) {
    // console.log(Math.round(pos * 100 / tvdbLanguages.length) + "%");
    expect(Languages.getLanguageByCode(tvdbLangCode.id), 'Language not found [' + tvdbLangCode.id + ']').toBeDefined()
    pos++
  }
})

test('Search Street Hawk', async () => {
  const series = await TVDBClient.getInstance().searchSeries('Street Hawk')
  expect(series.length).toBeGreaterThan(0)
  expect(series[0].id).toBe(73877)
  expect(series[0].title).toBe('Tonnerre mécanique')
  expect(series[0].year).toBe(1985)
  expect(series[0].originalTitle).toBe('Street Hawk')
  expect(series[0].overview).toContain(
    "Jesse Mach, motard au sein de la police, est blessé au cours d'une opération. " +
      "Recruté par les services secrets américains, il pilote le Tonnerre mécanique, moto révolutionnaire équipée d'armes " +
      'perfectionnées et capable de dépasser les 500 km/h.'
  )
  expect(series[0].posterURL).toBe('https://artworks.thetvdb.com/banners/posters/73877-2.jpg')
  expect(series[0].language.code).toBe('en')
  expect(series[0].countries.length).toBe(1)
  expect(series[0].countries[0].alpha2).toBe('US')
  expect(series[0].imdb).toContain('tt0088618')
})

test('Retrieve Walking Dead Dead City Details in French', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(417549, 'official', 7, undefined, 2)
  expect(episode.episodeData.episodeNumber).toBe(7)
  expect(episode.episodeData.seasonNumber).toBe(2)
  expect(episode.episodeData.title).toBe('Novi dan, novi pocetak')
  expect(episode.episodeData.posterURL).toBe(
    'https://artworks.thetvdb.com/banners/v4/episode/10803215/screencap/684e9572af0f5.jpg'
  )
  expect(episode.episodeData.absoluteNumber).toBe(13)
  expect(episode.episodeData.overview).toContain(
    "Negan et Maggie s'embarquent dans des missions éprouvantes et font face à des épreuves inattendues, autant physiques qu'émotionnelles."
  )
  expect(episode.seriesData.posterURL).toBe(
    'https://artworks.thetvdb.com/banners/v4/series/417549/posters/64d0c1764319a.jpg'
  )
  expect(episode.seriesData.title).toBe('The Walking Dead: Dead City')
  expect(episode.seriesData.id).toBe(417549)
  expect(episode.seriesData.overview).toContain('Negan')
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha3).toBe('USA')
  expect(episode.seriesData.language.code).toBe('en-US')
  expect(episode.seriesData.originalTitle).toBe('The Walking Dead: Dead City')
  expect(episode.seriesData.note).toBe(undefined)
})

test('Retrieve Vic le Viking Details in French DVD order', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(272521, 'dvd', 1, undefined, 1)
  expect(episode.episodeData.episodeNumber).toBe(1)
  expect(episode.episodeData.seasonNumber).toBe(1)
  expect(episode.episodeData.title).toBe("La presqu'île au trésor")
  expect(episode.episodeData.posterURL).toBe('https://artworks.thetvdb.com/banners/episodes/272521/4640991.jpg')
  expect(episode.episodeData.absoluteNumber).toBe(0)
  expect(episode.episodeData.overview).toContain(
    "Nos vikings sont tombés dans un piège : un groupe de pirates leur a fait croire à l'existence d'un trésor fabuleux. " +
      "En fait, ces brigands cherchent plutôt à s'emparer des richesses des navigateurs. Mais Vic et Ulme n'ont pas dit leur dernier mot!"
  )
  expect(episode.seriesData.posterURL).toBe('https://artworks.thetvdb.com/banners/posters/272521-2.jpg')
  expect(episode.seriesData.title).toBe('Vic le viking')
  expect(episode.seriesData.id).toBe(272521)
  expect(episode.seriesData.overview).toBe(
    'Vic, le fils du chef Viking Halvar accompagne régulièrement son père et son équipage' +
      ' dans leurs péripéties ! Pas toujours perspicaces, les Vikings, confrontés au danger, cherchent spontanément à régler leurs' +
      ' différends par la force…\r\n' +
      '\r\n' +
      'Heureusement Vic est là ! Haut comme trois pommes et pas bien costaud, il compense ces lacunes par sa débrouillardise,' +
      ' son esprit d’équipe et son ingéniosité. Pour sortir ses amis d’un mauvais pas, il affronte et triomphe des dangers de' +
      ' toutes sortes : avec Vic, l’humour, l’amitié, l’inventivité et l’entraide seront toujours au rendez-vous.'
  )
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha3).toBe('AUS')
  expect(episode.seriesData.language.code).toBe('en-AU')
  expect(episode.seriesData.originalTitle).toBe('Vic the Viking')
  expect(episode.seriesData.note).toBe(undefined)
})

test('Shameless US Cleanup', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const episode = await TVDBClient.getInstance().retrieveSeriesDetails(161511, 'official', 1, undefined, 1)
  expect(episode.episodeData.episodeNumber).toBe(1)
  expect(episode.episodeData.seasonNumber).toBe(1)
  expect(episode.episodeData.title).toBe('Les Gallagher')
  expect(episode.episodeData.posterURL).toBe('https://artworks.thetvdb.com/banners/episodes/161511/2861921.jpg')
  expect(episode.episodeData.absoluteNumber).toBe(1)
  expect(episode.episodeData.overview).toContain(
    'Depuis que leur mère, Monica, a quitté la maison, les enfants Gallagher se débrouillent ' +
      "comme ils peuvent. Leur père, Frank, un chômeur paumé doublé d'un ivrogne patenté, dilapide en boisson l'argent des allocations " +
      'familiales. Un jour, Fiona, 20 ans, se fait voler son sac à main dans une discothèque. Un jeune homme, Steve, lui vient en aide, ' +
      "en vain. Néanmoins, Fiona, touchée par ce geste, l'invite à dîner à la maison. Pendant ce temps, Lip, un des frères de Fiona, " +
      "se demande si Ian, le plus jeune, n'est pas gay. Il décide de s'en assurer en lui concoctant un rendez-vous avec Karen Jackson, " +
      'une fille facile...'
  )
  expect(episode.seriesData.posterURL).toBe('https://artworks.thetvdb.com/banners/posters/161511-1.jpg')
  expect(episode.seriesData.title).toBe('Shameless')
  expect(episode.seriesData.id).toBe(161511)
  expect(episode.seriesData.overview).toBe(
    "Frank Gallagher est le père d'une famille dysfonctionnelle vivant dans un quartier défavorisé. " +
      'Alcoolique, égoïste, il laisse la tâche difficile à sa fille Fiona, de gérer ses autres enfants tout en vivant sa propre vie.'
  )
  expect(episode.seriesData.imdb).toBe(undefined)
  expect(episode.seriesData.countries.length).toBe(1)
  expect(episode.seriesData.countries[0].alpha3).toBe('USA')
  expect(episode.seriesData.language.code).toBe('en-US')
  expect(episode.seriesData.originalTitle).toBe('Shameless')
  expect(episode.seriesData.note).toBe(undefined)
})
