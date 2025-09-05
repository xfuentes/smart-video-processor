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
import { tmdbLanguages } from '../TMDBLanguages'
import { TMDBClient } from '../../../src/main/domain/clients/TMDBClient'
import { currentSettings } from '../../../src/main/domain/Settings'
import { Languages } from '../../../src/common/LanguageIETF'

const posterUrlRE = /https:\/\/image.tmdb.org\/t\/p\/w1280\/[^.]+\.jpg/

test('Search by IMDB ID', async () => {
  const movies = await TMDBClient.getInstance().searchMovieByImdb('tt0120201')
  expect(movies.length).toBe(1)
  expect(movies[0].id).toBe(563)
  expect(movies[0].title).toBe('Starship Troopers')
  expect(movies[0].year).toBe(1997)
  expect(movies[0].originalTitle).toBe('Starship Troopers')
  expect(movies[0].overview).toBe(
    'Set in the future, the story follows a young soldier named Johnny Rico and his exploits ' +
      "in the Mobile Infantry. Rico's military career progresses from recruit to non-commissioned officer and finally to officer " +
      'against the backdrop of an interstellar war between mankind and an arachnoid species known as "the Bugs."'
  )
  expect(movies[0].posterURL).toMatch(posterUrlRE)
  expect(movies[0].language.code).toBe('en')
})

test('Search by name', async () => {
  currentSettings.favoriteLanguages = ['en']
  const movies = await TMDBClient.getInstance().searchMovieByNameYear('universal soldier', 1992)
  expect(movies.length).toBeGreaterThan(0)
  expect(movies[0].id).toBe(9349)
  expect(movies[0].title).toBe('Universal Soldier')
  expect(movies[0].year).toBe(1992)
  expect(movies[0].originalTitle).toBe('Universal Soldier')
  expect(movies[0].overview).toBe(
    'An American soldier who had been killed during the Vietnam War is revived 25 years later ' +
      'by the military as a semi-android, UniSols, a high-tech soldier of the future. After the failure of the initiative to ' +
      "erase all the soldier's memories, he begins to experience flashbacks that are forcing him to recall his past."
  )
  expect(movies[0].posterURL).toMatch(posterUrlRE)
  expect(movies[0].language.code).toBe('en')
})

test('Search by name and year', async () => {
  const movies = await TMDBClient.getInstance().searchMovieByNameYear('une nuit en enfer', 1996)
  expect(movies.length).toBeGreaterThan(0)
  expect(movies[0].id).toBe(755)
  expect(movies[0].title).toBe('From Dusk Till Dawn')
  expect(movies[0].year).toBe(1996)
  expect(movies[0].originalTitle).toBe('From Dusk Till Dawn')
  expect(movies[0].overview).toBe(
    'After kidnapping a father and his two kids, ' +
      'the Gecko brothers head south to a seedy Mexican bar to hide out in safety, unaware of its notorious vampire clientele.'
  )
  expect(movies[0].posterURL).toMatch(posterUrlRE)
  expect(movies[0].language.code).toBe('en')
})

test('Retrieve movie details', async () => {
  currentSettings.favoriteLanguages = ['en-US']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(11687)
  expect(movie.tmdb).toBe(11687)
  expect(movie.title).toBe('The Visitors')
  expect(movie.year).toBe(1993)
  expect(movie.overview).toBe(
    "After a wizard's spell goes awry, 12th-century Gallic knight Godefroy de Papincourt, " +
      'Count of Montmirail finds himself transported to 1993, along with his dimwitted servant, Jacquouille la Fripouille. ' +
      'Startled and perplexed by modern technology, the duo run amok, destroying cars and causing chaos until they meet Beatrice de Montmirail, an aristocratic descendant of the nobleman, who may be able to help them get back to 1123.'
  )
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('fr')
  expect(movie.countries).toContain('FR')
  expect(movie.imdb).toContain('tt0108500')
})

test('Retrieve movie details issue with nobody has to know', async () => {
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(788933)
  expect(movie.tmdb).toBe(788933)
  expect(movie.title).toBe('Nobody Has to Know')
  expect(movie.year).toBe(2022)
  expect(movie.overview).toBe(
    'After a stroke and no memories from his past, Phil encounters Millie who inhabits a desert part of Isle of Lewis. She will shortly entrust him with his deepest secret : they were in love.'
  )
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('fr')
  expect(movie.countries).toContain('FR')
  expect(movie.imdb).toContain('tt11188010')
  expect(movie.rating).toBe(3.35)
})

test('Rate limiter', async () => {
  TMDBClient.getInstance().rateLimiter.setRate(1)
  let firstExecutedAt: number
  const prom1 = TMDBClient.getInstance()
    .searchMovieByImdb('tt0120201')
    .then((_result) => {
      firstExecutedAt = Date.now()
    })
  let secondExecutedAt: number
  const prom2 = TMDBClient.getInstance()
    .searchMovieByNameYear('universal soldier')
    .then((_result) => {
      secondExecutedAt = Date.now()
    })
  let thirdExecutedAt: number
  const prom3 = TMDBClient.getInstance()
    .searchMovieByNameYear('une nuit en enfer', 1996)
    .then((_result) => {
      thirdExecutedAt = Date.now()
    })

  await Promise.allSettled([prom2, prom3, prom1])

  expect(Math.round((thirdExecutedAt - firstExecutedAt) / 1000)).toBe(2)
  expect(Math.round((secondExecutedAt - firstExecutedAt) / 1000)).toBe(1)
  expect(Math.round((thirdExecutedAt - secondExecutedAt) / 1000)).toBe(1)
})

test('Search pacifist cowboy', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movies = await TMDBClient.getInstance().searchMovieByNameYear('un cowboy pacifiste', 2025)
  expect(movies.length).toBeGreaterThan(0)
  expect(movies[0].id).toBe(1491487)
  expect(movies[0].title).toBe('Terence Hill, un cowboy pacifiste')
  expect(movies[0].year).toBe(2025)
  expect(movies[0].originalTitle).toBe('Terence Hill: Pazifist und Cowboy')
  expect(movies[0].overview).toBe(
    'On l’appelait Trinita, mais son nom était Mario Girotti. Le western-spaghetti est né avec le ' +
      "duo que l'acteur italo-allemand a formé avec Carlo Pedersoli, alias Bud Spencer. Hanté par le bombardement de Dresde, " +
      'qu’il a vécu à 4 ans, il se refusait à glorifier la violence et à se prendre au sérieux. Rencontre avec Terence Hill, ' +
      'qui a vaincu grâce au cinéma sa timidité et ses tourments.'
  )
  expect(movies[0].posterURL).toMatch(posterUrlRE)
  expect(movies[0].language.code).toBe('de')
})

test('Retrieve movie details french', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(11687)
  expect(movie.tmdb).toBe(11687)
  expect(movie.title).toBe('Les Visiteurs')
  expect(movie.year).toBe(1993)
  expect(movie.overview).toBe(
    "Parce qu'il lui a sauvé la vie lors d'une échauffourée avec les Anglais, " +
      'le roi de France Louis VI fait du chevalier Godefroy de Papincourt le nouveau comte de Montmirail et ' +
      "lui accorde en justes noces la riche Frénégonde. Cependant, abusé par le sortilège d'une sorcière, " +
      "Godefroy tue son futur beau-père, qu'il avait pris pour un ours. Soucieux de réparer sa faute, " +
      'il demande à un enchanteur de le ramener dans le passé, juste avant le drame. Mais, après une erreur dans la formule, ' +
      "il se retrouve, toujours flanqué de son fidèle écuyer Jacquouille la Fripouille, en l'an de grâce 1992. Les deux " +
      "hommes se lancent à la découverte du monde moderne. La voiture d'un facteur fait les frais de leur étonnement et de " +
      'leur belliqueuse humeur...'
  )
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('fr')
  expect(movie.countries).toContain('FR')
  expect(movie.imdb).toContain('tt0108500')
})

test('Retrieve movie details no french translations', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(431221)
  expect(movie.tmdb).toBe(431221)
  expect(movie.title).toBe('Amahl and the Night Visitors')
  expect(movie.year).toBe(1955)
  expect(movie.overview).toBe(
    'A destitute, crippled child and his mother are visited late one night ' +
      'by three traveling strangers who claim to be following a star so that they may bring gifts to a newborn king. ' +
      'The yearly live telecasts of Gian Carlo Menotti’s Amahl and the Night Visitors were a cherished Christmas ' +
      'tradition throughout the 1950s. In addition, since its premiere in 1951, Amahl has been performed regularly ' +
      'by community groups and small opera companies throughout the US, making it the single most popular American opera. ' +
      'This production, staged by the composer himself and originally telecast on Christmas Day, 1955, is a ' +
      'testament to the work’s enduring power to move the heart and stir the soul. Starring Rosemary Kuhlmann as ' +
      'the Mother and Bill McIver as Amahl. Members of the Symphony of the Air are under the direction of Thomas Schippers.'
  )
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('en')
  expect(movie.countries).toContain('US')
  expect(movie.imdb).toBeUndefined()
})

test('Retrieve movie details eternam 2', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(994051)
  expect(movie.tmdb).toBe(994051)
  expect(movie.title).toBe('ETERNAM II : La promesse')
  expect(movie.year).toBe(2022)
  expect(movie.overview).toBe(
    'Paradis, Purgatoire, Enfer, Fin des temps, Apocalypse…  ' +
      'Où allons-nous ? Y a-t-il une vie après la mort ? Que devenons-nous ?  Dans ce coffret, ' +
      'les réalisateurs Sabrina et Steven Gunnell ont parcouru toute la France pour nous offrir une série ' +
      'de témoignages émouvants et édifiants. Ils vont à la rencontre de diverses personnes : hommes, femmes, ' +
      'jeunes, philosophes, théologiens, conférenciers, prédicateurs, missionnaires, séminaristes, fiancés, artistes. ' +
      'Ces témoins évoquent la manière dont « la grâce » les a accompagnés dans leur existence (épreuves, choix, changements de ' +
      'vie, discernement, miracles, sentiments d’échecs, engagements, incompréhension à travers la tragédie). ' +
      'Trois documentaires poignants où les récits se croisent et nous laissent un goût d’éternité.'
  )
  expect(movie.posterUrl).toBeDefined()
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('fr')
  expect(movie.countries).toContain('FR')
  expect(movie.imdb).toBeUndefined()
})

test('Retrieve movie details passion of the Christ', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(615)
  expect(movie.tmdb).toBe(615)
  expect(movie.title).toBe('La Passion du Christ')
  expect(movie.year).toBe(2004)
  expect(movie.overview).toBe(
    'Les douze dernières heures de la vie du Christ. Rendu au Mont des Oliviers, ' +
      'Jésus prie après avoir partagé un dernier repas avec ses apôtres. Il résiste maintenant aux tentations de Satan. ' +
      'Trahi par Judas, Jésus est arrêté et emmené à Jérusalem, où les chefs des Pharisiens l’accusent de blasphème et ' +
      'lui font un procès qui a pour issue sa condamnation à mort…'
  )
  expect(movie.posterUrl).toBeDefined()
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('en')
  expect(movie.countries).toContain('US')
  expect(movie.imdb).toBe('tt0335345')
})

test('Retrieve movie details le bon la brute... with duration', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(429)
  expect(movie.tmdb).toBe(429)
  expect(movie.title).toBe('Le Bon, la Brute et le Truand')
  expect(movie.year).toBe(1966)
  expect(movie.overview).toBe(
    'Pendant la guerre de Sécession, ' +
      "Tuco et Joe se lancent à la recherche d'un coffre contenant 200 000 dollars en pièces d'or volés à l'armée sudiste. " +
      "Ayant des indices complémentaires sur la cache, chacun a besoin de l'autre. " +
      'Mais un troisième homme entre dans la course : Sentenza, un tueur qui ne recule devant rien pour parvenir à ses fins.'
  )
  expect(movie.posterUrl).toBeDefined()
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('it')
  expect(movie.countries).toContain('IT')
  expect(movie.imdb).toBe('tt0060196')
  expect(movie.duration).toBe(9660)
})

test('Retrieve movie details ip man 3', async () => {
  currentSettings.favoriteLanguages = ['fr-FR']
  const movie = await TMDBClient.getInstance().retrieveMovieDetails(365222)
  expect(movie.tmdb).toBe(365222)
  expect(movie.title).toBe('Ip Man 3')
  expect(movie.year).toBe(2015)
  expect(movie.overview).toBe(
    "Lorsque qu'une bande de gangsters dirigée par un promoteur " +
      'immobilier corrompu cherche à prendre le contrôle de la ville, Ip reprend du service.'
  )
  expect(movie.posterUrl).toBeDefined()
  expect(movie.posterUrl).toMatch(posterUrlRE)
  expect(movie.language).toBe('cn')
  expect(movie.countries).toContain('CN')
  expect(movie.imdb).toBe('tt2888046')
  expect(movie.duration).toBe(6300)
})

test('check TMDB language id mappable to Language IETF', async () => {
  let pos = 0
  for (const tmdbLanguage of tmdbLanguages) {
    // console.log(Math.round(pos * 100 / tvdbLanguages.length) + "%");
    expect(
      Languages.getLanguageByCode(tmdbLanguage.iso_639_1),
      'Language not found [' + tmdbLanguage.iso_639_1 + ']'
    ).toBeDefined()
    pos++
  }
})
