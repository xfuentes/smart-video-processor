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
import { currentSettings } from '../../src/main/domain/Settings'
import { SearchResult } from '../../src/main/domain/SearchResult'

const inDarknessResults = [
  {
    id: 417643,
    title: 'La part obscure',
    year: 2018,
    originalTitle: 'In Darkness',
    overview:
      "Une musicienne aveugle est témoin d'un meurtre commis dans l'appartement au-dessus de chez elle. Forcée de fuir, elle se retrouve alors plongée dans les bas-fonds de Londres.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/A4gJEE1zpImXE8MYkeq4sB69mfZ.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 454286,
    title: "Dieu n'est pas mort 3",
    year: 2018,
    originalTitle: "God's Not Dead: A Light in Darkness",
    overview:
      "Après l’incendie meurtrier de l'église St. James, la direction de l'université Hadleigh voudrait profiter de la tragédie pour déplacer ce lieu de culte hors du campus. Pour défendre ses droits, le pasteur Dave fait appel à son frère avocat avec lequel il n’a plus de relations depuis des années. La bataille judiciaire qui s’engage vient menacer dangereusement l’ordre public sur le campus.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/cfFX9buomYeqnPxkyxF4RJaVGuu.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 705969,
    title: 'Life in Darkness',
    year: 2018,
    originalTitle: 'Life in Darkness',
    overview:
      'Laith, a 22 year old male wakes up on his birthday in Mosul, Iraq, only to have problems with his boyfriend, Mohanad a 27 year old male. Mohanad believes that Laith is cheating on him with a girl and a fight erupts as Mohanad storms out of the apartment only to rush back as he sees ISIS have taken over the city and raid the apartment block.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/dA0JOyxgl1JAxMDA3zFYuXW4S1v.jpg',
    language: { code: 'ar', label: 'Arabic', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 529717,
    title: 'A Kiss In The Darkness',
    year: 2018,
    originalTitle: 'A Kiss In The Darkness',
    overview: 'Just voices in the night or sage advice from the other side?',
    posterURL: 'https://image.tmdb.org/t/p/w1280/jSJUkFjda3WhJ3faJHtMz9tCny.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 635327,
    title: 'I Want to Be with You in the Darkness',
    year: 2018,
    originalTitle: 'I Want to Be with You in the Darkness',
    overview: 'One relationship. One love. One life. Two angles.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/atICXT4d1kDYr7QQD8hOBEd2yrO.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 1209897,
    title: 'Light in the Darkness: The Impact of Night of The Living Dead',
    year: 2018,
    originalTitle: 'Light in the Darkness: The Impact of Night of The Living Dead',
    overview:
      "In this brand new featurette, directors Guillermo del Toro (The Devil's Backbone), Robert Rodriguez (From Dusk Till Dawn), and Frank Darabont (The Shawshank Redemption) explain what makes Night of the Living Dead a very special film and discuss its lasting impact on the horror genre. The featurette was produced exclusively for Criterion in 2017.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/8duNOuF08El8KseFnGMuFNWgAi0.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 772784,
    title: 'In the Darkness',
    year: 2018,
    originalTitle: 'Во мраке',
    overview:
      'A group of friends goes to the forest. The guys are led there by curiosity: one of them received a strange message indicating the coordinates. Arriving at the scene, they decide that it was a prank. But as the sun sets, the heroes understand that the hunt has begun on them.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/fJPf24sb3WBob5nUuhenSlypBOY.jpg',
    language: { code: 'ru', label: 'Russian', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 566810,
    title: 'Reign of Fire',
    year: 2018,
    originalTitle: 'Dragon Kingdom',
    overview:
      'Pour sauver leur royaume et déjouer les plans insidieux de la puissante armée des Dark Lords et leurs dragons, la Princesse Elizabeth, future Reine, accompagnée d’un groupe de valeureux guerriers sont contraints de traverser les terres interdites. Pour qu’elle puisse rejoindre son père le Roi et lui succéder sur le trône, ils vont devoir combattre les redoutables et dangereuses créatures mythiques du royaume des ténèbres.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/9lQN1Fs7d8kdtEE7orBdjZwPH6a.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 275229,
    title: 'The Darkness',
    year: 2016,
    originalTitle: 'Las tinieblas',
    overview:
      'A family lives in a cabin in the middle of a submerged forest in the mist and shrouded in perpetual twilight after an undefined global catastrophe. The father keeps his children locked in the basement into believing that a wild beast roams outside.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/x58BdDUnPzz8nWZu54SBh7lpwzU.jpg',
    language: {
      code: 'es',
      label: 'Spanish',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 374856,
    title: 'Détective Conan : Le Pire cauchemar',
    year: 2016,
    originalTitle: '名探偵コナン 純黒の悪夢（ナイトメア）',
    overview:
      "Un espion vole des dossiers secrets provenant de divers services de renseignements comme le MI6, la BND ou la CIA à la police japonaise. Durant sa fuite, il subit un accident de voiture provoqué un tir de carabine de Shuichi Akai. Le lendemain, une jolie jeune femme blessée et seule est trouvé par Conan et ses amis à un aquarium à Tokyo. Ces derniers décident alors de l'aider à retrouver sa mémoire. La scène est observée par Vermouth",
    posterURL: 'https://image.tmdb.org/t/p/w1280/fMnvzHOtVm7NySGkqfWC9VyBDLG.jpg',
    language: { code: 'ja', label: 'Japanese', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 499782,
    title: 'Dark Buildings (A Crack in the Wall)',
    year: 2018,
    originalTitle: 'Las grietas de Jara',
    overview: `When the beautiful Leonor arrives at the architecture studio Borla y Asociados looking for Nelson Jara, both Mario Borla and his partner Marta Hovart and Pablo Simó, the building's oldest architect, claim to ignore that name completely. But they all lie. The truth begins to unravel through the memories of Pablo Simó. Pablo should carry out the unpleasant job of dealing with Nelson Jara, an indignant owner of the building adjoining a work of the studio, damaged by a crack in the wall of his living room caused by an error in the construction. But the fear and nervousness that provokes in the three involved the arrival of Leonor and her question "what happened to Nelson Jara?" Show something much darker and more suspicious. (FILMAFFINITY)`,
    posterURL: 'https://image.tmdb.org/t/p/w1280/q2eCSXDYFFiUtZEja4ToRPukJxO.jpg',
    language: {
      code: 'es',
      label: 'Spanish',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 420293,
    title: "It's Darker Before Dawn",
    year: 2018,
    originalTitle: 'Fica Mais Escuro Antes do Amanhecer',
    overview:
      'After the tragic loss of their child, a couple must prepare to witness their last day of light before the world fades into ever winter and darkness.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/74olinOF2Fb7IjPXZ0PIJWS3or.jpg',
    language: {
      code: 'pt',
      label: 'Portuguese',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 25961,
    title: "Pokémon : L'ascension de Darkrai",
    year: 2007,
    originalTitle: '劇場版ポケットモンスター ダイヤモンド&パール ディアルガVSパルキアVSダークライ',
    overview:
      "Sacha et Pikachu s'apprêtent à vivre le plus grand combat Pokémon de tous les temps. Palkia et Dialga s'affrontent, créant de terribles dégâts et le mystérieux Darkrai rode.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/2oTBSVVxy9vYQtR0JCoPLuvxdgu.jpg',
    language: { code: 'ja', label: 'Japanese', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 85369,
    title: "Hercule l'invincible",
    year: 1964,
    originalTitle: "Ercole l'invincibile",
    overview:
      'Hercule, fils de Zeus, sauve des griffes d’un lion, Teica, la fille du roi Tedaeo. Tombé amoureux d’elle, il désire l’épouser. Le roi lui demande alors de terrasser un dragon qui ravage la région. Hercule accomplit son exploit, mais trouve à son retour le village dévasté. Les Demulus, menés par leur chef Kabaol, ont mis son peuple en esclavage. Le héros part les libérer, et devra affronter mille préipéties.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/SjmVT8aUF8uJyp680lXAG6PGie.jpg',
    language: {
      code: 'it',
      label: 'Italian',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 366170,
    title: 'Yu-Gi-Oh! : The Dark Side of Dimensions',
    year: 2016,
    originalTitle: '遊☆戯☆王 THE DARK SIDE OF DIMENSIONS',
    overview:
      'Le film se déroule une année après la fin de Yu-Gi-Oh! Duel Monsters. Yugi et Kaiba acceptent de coopérer en pariant leurs fiertés dans un duel.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/ti0CRprP9iSg9IDadTZ3TFnuczS.jpg',
    language: { code: 'ja', label: 'Japanese', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 544627,
    title: 'Dark Figure of Crime',
    year: 2018,
    originalTitle: '암수살인',
    overview:
      'Une violente confrontation psychologique se produit entre un détective et un meurtrier qui a avoué plusieurs meurtres.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/uWislqbyIFvR02uN4n20zjDnAm2.jpg',
    language: { code: 'ko', label: 'Korean', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 539825,
    title: 'Le Déserteur',
    year: 2019,
    originalTitle: 'La grande noirceur',
    overview:
      "Quelque part dans le monde, une guerre fait rage. Terrifié à l’idée d’être mobilisé, Philippe a fui Montréal pour se réfugier dans un Ouest américain aussi sauvage qu’hypnotisant. Il vit tant bien que mal de concours d'imitation de Charlie Chaplin. Mais la cruauté de l’humanité ne se limite pas aux champs de bataille, et Philippe ne va pas tarder à découvrir la face obscure du rêve américain.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/xVz1dASnIIQdJhYKe9ZcHEuQY9z.jpg',
    language: {
      code: 'fr',
      label: 'French',
      altCodes: [Array],
      matchNames: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 30901,
    title: 'Toutes les couleurs du vice',
    year: 1972,
    originalTitle: 'Tutti i colori del buio',
    overview:
      "Traumatisée par le meurtre de sa mère dont elle a été témoin dans son enfance, ainsi que par une fausse couche, Jane est à deux doigts de la folie. Aidée par un psychiatre et par sa nouvelle voisine, elle cherche à se libérer de ses peurs mais son cauchemar vient juste de commencer. Persécutée et menacée par un mystérieux homme au regard perçant, elle plonge dans un abîme d'horreur où personne n'est celui qu'il semble être.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/xSTqMiKtcCUJRvjpfCHWiolyidX.jpg',
    language: {
      code: 'it',
      label: 'Italian',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 559763,
    title: 'Dark Suns',
    year: 2019,
    originalTitle: 'Soleils noirs',
    overview:
      "synopsis\r Un mal insaisissable s'est emparé du Mexique.\r Il y a vingt ans, des cris de jeunes femmes résonnaient au nord du pays, victimes d’une fureur misogyne sans précédent. Derrière les volcans de la capitale, des centaines d'autres ont subi le même sort au cours des récentes années. Ailleurs, des paysans, des étudiants comme de simples voyageurs disparaissent sur les routes alors que plusieurs journalistes tombent sous les balles. Le climat d'impunité ouvre la porte à toutes les dérives et la terreur gagne le pays tout entier.\r Certains élèvent la voix, dénoncent et enquêtent alors que d'autres, armés de pelles et bravant les guet-apens, s’aventurent à la recherche des disparus.\r À force de témoigner et de fouiller, la vérité émerge peu à peu.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/fGfgCbvW1VbQIyxWEVQlrOVFuZf.jpg',
    language: {
      code: 'es',
      label: 'Spanish',
      altCodes: [Array],
      isRegionImportant: true
    },
    countries: [],
    imdb: undefined,
    note: undefined
  },
  {
    id: 548221,
    title: 'The Dark Room',
    year: 2018,
    originalTitle: 'اتاق تاریک',
    overview:
      'Farhad and Aalah have begun their new season, and this is the beginning of some other changes that will put them in the face of new issues ....',
    posterURL: 'https://image.tmdb.org/t/p/w1280/1OibdAvoonD16sRp4vTLcT7xcIx.jpg',
    language: { code: 'fa', label: 'Persian', altCodes: [Array] },
    countries: [],
    imdb: undefined,
    note: undefined
  }
] as unknown as SearchResult[]

test('Best match for In Darkness bug', async () => {
  currentSettings.language = 'fr'
  currentSettings.favoriteLanguages = ['fr-FR']
  const movieResult = SearchResult.getBestMatch(inDarknessResults, 'In Darkness', 2018)
  expect(movieResult).toBeDefined()
  expect(movieResult.id).toBe(417643)
})

const threeHundredSearchResults = [
  {
    id: 1271,
    title: '300',
    year: 2007,
    originalTitle: '300',
    overview:
      'Adapté du roman graphique de Frank Miller, 300 est un récit épique de la Bataille des Thermopyles qui opposa en l’an –480 le roi Léonidas et 300 soldats spartiates à Xerxès et l’immense armée perse. Face à un invincible ennemi, les 300 déployèrent jusqu’à leur dernier souffle un courage surhumain ; leur vaillance et leur héroïque sacrifice inspirèrent toute la Grèce à se dresser contre la Perse, posant ainsi les premières pierres de la démocratie.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/q31SmDy9UvSPIuTz65XsHuPwhuS.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 23056,
    title: 'Pinocchio le robot',
    year: 2004,
    originalTitle: 'Pinocchio 3000',
    overview:
      "An 3000. Dans la cité de Scamboville se dresse une jolie maisonnette avec un petit jardin. C'est ici que vit Gepetto. Grâce à l'aide du pingouin Spencer et de la fée Cyberina, il vient de créer un prototype de robot ultraperformant : Pinocchio. Le petit robot sait parler, danser, chanter et même rire sans toutefois être un véritable enfant.La fée Cyberina lui fait la promesse de le changer en vrai petit garçon quand il aura appris à faire la distinction entre le bien et le mal. Pour cela, elle lui fait don d'un nez magique qui grandira à chacun de ses mensonges. Pendant ce temps, le diabolique maire de la ville, Scamboli, nourrit de sombres desseins : transformer tous les enfants en robots. Pinocchio, Gepetto, Spencer et Marlène, la fille de Scamboli, liguent alors leurs forces pour empêcher les plans maléfiques du maire. Mais ils ne sont pas au bout de leurs surprises...",
    posterURL: 'https://image.tmdb.org/t/p/w1280/kjzwXakAG33GFX0OchKUD1mj0wB.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 792217,
    title: '3000 km līdz Apsolītajai zemei',
    year: 2006,
    originalTitle: '3000 km līdz Apsolītajai zemei',
    overview: '',
    posterURL: 'https://image.tmdb.org/t/p/w1280/AiUjyd70S6IIgrRFkkSstc899Em.jpg',
    language: {
      code: 'lv',
      label: 'Latvian',
      altCodes: ['lav']
    },
    countries: []
  },
  {
    id: 544689,
    title: "Jérusalem 3000 ans d'histoire",
    year: 2006,
    originalTitle: "Jérusalem 3000 ans d'histoire",
    overview:
      "Ce film vous fera découvrir la Jérusalem d'hier et d'aujourd'hui. En parcourant la ville, chacun de vos pas croisera l'histoire exceptionnelle de cette ville où trois religions célèbrent un seul Dieu. Une ville contenant des trésors magnifiques, des hauts-lieux symboliques tels le tombeau du Christ, le mur des lamentations et le dôme d'or de la mosquée du Rocher. Jérusalem, au coeur de l'actualité du XXème siècle, est réellement unique dans l'histoire de l'humanité...",
    posterURL: 'https://image.tmdb.org/t/p/w1280/w3C6SF3KeIJ1oeXcg9hPpiBLeGF.jpg',
    language: {
      code: 'fr',
      label: 'French',
      altCodes: ['fre', 'fra'],
      matchNames: ['French', 'Français', 'Francais'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 719963,
    title: 'Home Movies 300-1',
    year: 2006,
    originalTitle: 'Home Movies 300-1',
    overview:
      'A work which projects the 16-mm moving portrait of an anonymous family onto a double Plexiglas screen while its 300 LEDs diffuse the footage into a series of noises as the minimal units of digital visual information.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/oBaPBPcoIFieYhl9osinxZ3abfp.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 665526,
    title: 'Video 3000',
    year: 2006,
    originalTitle: 'Video 3000',
    overview:
      'He is thrilled about his brand new "Video 3000" VCR. Unfortunately the stupid thing doesn\'t work - or does it?',
    posterURL: 'https://image.tmdb.org/t/p/w1280/7fDSikulEfjTZnwqCzHS5scxsq1.jpg',
    language: {
      code: 'de',
      label: 'German',
      altCodes: ['ger', 'deu'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 1317499,
    title: 'My Poetic Works 300 Yen',
    year: 2006,
    originalTitle: '私の志集 三〇〇円',
    overview: 'miniDV film by Yukiyasu Shimada.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/2soVN5QkjH67F83NBkXEYC41BBh.jpg',
    language: {
      code: 'ja',
      label: 'Japanese',
      altCodes: ['jpn']
    },
    countries: []
  },
  {
    id: 25676,
    title: "L'Expert de Hong Kong",
    year: 2006,
    originalTitle: '寶貝計劃',
    overview:
      'Expert en combines en tout genre, Fong Ka Ho est chargé par le chef d’une triade de voler le bébé d’une riche femme. Aidé d’un autre voleur surnommé « Octopus », il réussit sa mission jusqu’à ce que l’enfant prononce ses premiers mots : Papa !',
    posterURL: 'https://image.tmdb.org/t/p/w1280/qsyuigCSZZY59KM3iIVEARAfNWA.jpg',
    countries: []
  },
  {
    id: 409454,
    title: 'Le Grand Ruban (Truck)',
    year: 1991,
    originalTitle: 'Le Grand Ruban (Truck)',
    overview:
      "Jeff est un routier au grand coeur. Avant un départ pour la Yougoslavie, Mr Devrette, son principal commanditaire, lui propose d'emmener François-Xavier, jeune homme prétentieux. Sylvie, une jeune auto-stoppeuse, se joint à eux, ce qui envenime encore l'atmosphère dans le véhicule. Mais les trois compères deviennent amis à leur arrivée à Rijeka. Cependant la présence de la maitresse de Jeff dans la ville nuit aux relations intimes qui naissaient entre Sylvie et le routier. Le retour vers la France est de nouveau prétexte à de multiples disputes, mais finalement chacun y trouvera ce qu'il était venu chercher...",
    posterURL: 'https://image.tmdb.org/t/p/w1280/xMHPe6IaRQZM3Mw3iaAyC0pWfUi.jpg',
    language: {
      code: 'fr',
      label: 'French',
      altCodes: ['fre', 'fra'],
      matchNames: ['French', 'Français', 'Francais'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 718031,
    title: 'Madrid Before Hanita',
    year: 2006,
    originalTitle: 'מדריד לפני הניתה',
    overview:
      'The rarely heard story of 300 Jews from pre-Israel Palestine who departed to fight fascism and joined the International Brigades during the Spanish Civil War from 1936–1939. Their bravery is displayed in this documentary that features archival photographs and interviews with surviving members of this elite group.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/jGmuKTYWxOCYxVH0ob3ycDLtA45.jpg',
    language: {
      code: 'he',
      label: 'Hebrew',
      altCodes: ['heb']
    },
    countries: []
  }
] as SearchResult[]
test('Best match for 300 bug', async () => {
  currentSettings.language = 'fr'
  currentSettings.favoriteLanguages = ['fr-FR']
  const movieResult = SearchResult.getBestMatch(threeHundredSearchResults, '300', 2006)
  expect(movieResult).toBeDefined()
  expect(movieResult.id).toBe(1271)
})

const battleRoyaleSearchResults = [
  {
    id: 3177,
    title: 'Battle Royale II : Requiem',
    year: 2003,
    originalTitle: 'バトル・ロワイアルII 鎮魂歌',
    overview:
      "L'histoire se déroule un an après le premier film. On y suit les deux survivants rentrer chez eux et tenter d'alerter l'opinion publique sur ce qui s'est passé sur l'île. Leurs déclarations provoquent un chaos sur tout le pays, violemment réprimé par le pouvoir militaire. Ce dernier décide alors de faire participer les deux opposants à la deuxième session de Battle Royale en compagnie d'une classe beaucoup moins tendre que la précédente.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/1tBSs1j98lgbrtszvqnDp8S9aT7.jpg',
    language: {
      code: 'ja',
      label: 'Japanese',
      altCodes: ['jpn']
    },
    countries: []
  },
  {
    id: 966297,
    title: 'Making of Battle Royale II: Requiem',
    year: 2003,
    originalTitle: 'バトル・ロワイアルⅡ 鎮魂歌 外伝',
    overview: 'Behind the scenes of Battle Royale II',
    posterURL: 'https://image.tmdb.org/t/p/w1280/4D5cOLvbnWYvpZecoQ8Kn485HPk.jpg',
    language: {
      code: 'ja',
      label: 'Japanese',
      altCodes: ['jpn']
    },
    countries: []
  },
  {
    id: 966016,
    title: 'The Final Battleground — Making of Battle Royale II',
    year: 2003,
    originalTitle: '深作欣二・最後の戦場 父と子のバトル・ロワイアル Ⅱ',
    overview:
      'Prolific director Kinji Fukasaku died suddenly during the production of Battle Royale 2. His son and screenwriter Kenta took over as director and completed the film.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/gZ1n84jILu3wIUvEtVa7qfidQY5.jpg',
    language: {
      code: 'ja',
      label: 'Japanese',
      altCodes: ['jpn']
    },
    countries: []
  }
] as SearchResult[]
test('Battle Royale match bug', async () => {
  currentSettings.language = 'fr'
  currentSettings.favoriteLanguages = ['fr-FR']
  const movieResult = SearchResult.getBestMatch(battleRoyaleSearchResults, 'Battle Royale II', 2003)
  expect(movieResult).toBeDefined()
  expect(movieResult.id).toBe(3177)
})

const silenceOfTheLambSearchResults = [
  {
    id: 274,
    title: 'Le Silence des agneaux',
    year: 1991,
    originalTitle: 'The Silence of the Lambs',
    overview:
      'Un psychopathe connu sous le nom de Buffalo Bill sème la terreur dans le Middle West en kidnappant et en assassinant de jeunes femmes. Clarice Starling, une jeune stagiaire du FBI, est chargée d’interroger l’ex‐psychiatre Hannibal Lecter. Psychopathe redoutablement intelligent et porté sur le cannibalisme, Lecter est capable de lui fournir des informations concernant Buffalo Bill ainsi que son portrait psychologique. Mais il n’accepte de l’aider qu’en échange d’informations sur la vie privée de la jeune femme. Entre eux s’établit un lien de fascination et de répulsion.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/sSQDxwm4r28YpJSQVyVOtpYVs0E.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 692291,
    title: "The Making of 'The Silence of the Lambs'",
    year: 1991,
    originalTitle: "The Making of 'The Silence of the Lambs'",
    overview:
      'This brief throwback piece focused on interview snippets from Hopkins, Demme, Glenn, Foster, FBI agent John Douglas and another unnamed FBI agent.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/1e23ofpVd8ZVQvZZ17NKnSIjvIR.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  }
] as SearchResult[]
test('Silence of the lamb match bug', async () => {
  currentSettings.language = 'fr'
  currentSettings.favoriteLanguages = ['fr-FR']
  const movieResult = SearchResult.getBestMatch(silenceOfTheLambSearchResults, 'The Silence of the Lambs', 1991)
  expect(movieResult).toBeDefined()
  expect(movieResult.id).toBe(274)
})

const runSearchResults = [
  {
    id: 546121,
    title: 'Run',
    year: 2020,
    originalTitle: 'Run',
    overview:
      "Une adolescente, qui a passé sa vie recluse avec sa mère, découvre le terrible secret que cette dernière lui cache depuis de nombreuses années. La vie idyllique de l'adolescente bascule...",
    posterURL: 'https://image.tmdb.org/t/p/w1280/onq9Q5fsacgGAaiWgh2u0Eo7e8b.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 793687,
    title: 'Run',
    year: 2020,
    originalTitle: 'Run',
    overview:
      'Discover a tale of unrelenting human spirit, beyond limits. Find out just how much sport can change lives.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/8BNZep5NxWwLhSVHJh1btfrymaY.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 528215,
    title: 'Run',
    year: 2020,
    originalTitle: 'Run',
    overview:
      'A former boyracer, who married his first love and took a job in one of the fish factories, now has a 17 year-old-son of his own following in his footsteps and can no longer ignore the fact he’s going nowhere. Unable to be physically or emotionally present with his family, he takes his son’s car out for one final joy ride and risks losing the love that surrounds him',
    posterURL: 'https://image.tmdb.org/t/p/w1280/rrdgxsYRKWPPvHK5JiQjN0dQWf3.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 753587,
    title: 'RUN!',
    year: 2019,
    originalTitle: 'RUN!',
    overview:
      'Shot at sites of nuclear development, detonation, industry, tourism, and activism, "RUN!" examines the ways that ideologies of war structure landscapes, community rituals, cinematic technology, entomology, pandemic management, and even notions of LGBTQ liberation.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/aMtMrAms6FfU42eHNn6lnDfYlZo.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 507990,
    title: 'Run the Race',
    year: 2019,
    originalTitle: 'Run the Race',
    overview:
      "Après la mort de sa mère et l'abandon du domicile familial par son père, le jeune Zach trouve refuge dans le sport. Excellent athlète, il compte sur le football pour offrir un avenir plus beau à lui et à son frère, David. Hélas, blessé, Zach se retrouve sur le banc de touche, David va alors chausser ses crampons afin de sauver leur plan.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/1myP5YdjENipbKZYbONxZwPN8KK.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 532870,
    title: 'Cours, ma jolie, cours.',
    year: 2020,
    originalTitle: 'Run Sweetheart Run',
    overview:
      "À la suite d'un banal dîner d'affaires, une mère célibataire se retrouve pourchassée par un monstrueux et, semble-t-il, inarrêtable agresseur dans ce terrifiant triller sombre.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/bDkdcKOFSUaeQLgX3HuDXmxaq1d.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 575072,
    title: 'Time Run',
    year: 2020,
    originalTitle: 'Бег',
    overview:
      "Moscou. Après un accident de voiture, le champion sportif Sergey Borozdin est soudainement doté d'un don surnaturel lui permettant de voir les événements passés. Lorsqu'il devient suspect dans une série de meurtres, il est obligé d'utiliser cette capacité pour trouver le véritable tueur.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/p7fhd89FRUemP5kA796n2oGWKD.jpg',
    language: {
      code: 'ru',
      label: 'Russian',
      altCodes: ['rus']
    },
    countries: []
  },
  {
    id: 78,
    title: 'Blade Runner',
    year: 1982,
    originalTitle: 'Blade Runner',
    overview:
      '2019, Los Angeles. La Terre est surpeuplée et l’humanité est partie coloniser l’espace. Les nouveaux colons sont assistés de Replicants, androïdes que rien ne peut distinguer de l\'être humain. Conçus comme de nouveaux esclaves, certains parmi les plus évolués s’affranchissent de leurs chaînes et s’enfuient. Rick Deckard, un ancien Blade Runner, catégorie spéciale de policiers chargés de "retirer" ces replicants, accepte une nouvelle mission consistant à retrouver quatre de ces individus qui viennent de regagner la Terre après avoir volé une navette spatiale.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/zHKWxyG4j404HVeSYHNH4niUpkW.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 596911,
    title: 'She Runs',
    year: 2019,
    originalTitle: '南方少女',
    overview:
      'Un hiver chinois comme les autres. Yu, une jeune collégienne d’une petite ville tente de quitter son équipe de gymnastique rythmique.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/x1HkSxmn2ThVQqH9rlw95g4LxZH.jpg',
    language: {
      code: 'zh',
      label: 'Chinese',
      altCodes: ['chi', 'zho'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 734355,
    title: 'Monster Run',
    year: 2020,
    originalTitle: '怪物先生',
    overview:
      'En grandissant, Ji Wei a toujours été traitée différemment en raison de sa capacité à voir des “monstres”. Très rapidement, sa mère la met dans un hôpital psychiatrique à cause de ses visions. A sa sortie, elle trouve un travail dans un supermarché. Mais rapidement, les visions reprennent et elle voit un monstre attaquer le supermarché. C’est là qu’intervient Meng Ge, un chasseur de monstres, et Ji Wei se rend compte que les choses qu’elle voit existent vraiment. Après avoir survécu à plusieurs péripéties avec Meng Ge, ils découvrent que Ji Wei est la fille qui a été choisie par le monde magique pour être la gardienne du Portail…',
    posterURL: 'https://image.tmdb.org/t/p/w1280/18mwyI7hSaXwqfJazyCbCEq4TLl.jpg',
    language: {
      code: 'zh',
      label: 'Chinese',
      altCodes: ['chi', 'zho'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 546546,
    title: 'Midnight Runner',
    year: 2018,
    originalTitle: 'Der Läufer',
    overview:
      'Le véritable drame d’un sportif de haut niveau célèbre qui finit par devenir un criminel en série: Jonas Widmer, le coureur de marathon militaire suisse, cherche un moyen de surmonter son passé tragique et s’empêtre toujours plus profondément dans une double vie calamiteuse.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/aOpESNpPaYkJTV4RIpw7LmLDrY0.jpg',
    language: {
      code: 'de',
      label: 'German',
      altCodes: ['ger', 'deu'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 523077,
    title: 'La traque du diable',
    year: 2019,
    originalTitle: 'Running with the Devil',
    overview:
      'Quand un transport de cocaïne voyageant du Mexique au Canada est compromis, le chef d’un puissant cartel ordonne à son meilleur "cuisinier" et à son chef du trafic de remonter la chaîne afin d’identifier et régler le problème. En parallèle, le FBI remonte la piste d’une cocaïne coupée particulièrement mortelle. Rien ne va se passer comme prévu pour les deux camps…',
    posterURL: 'https://image.tmdb.org/t/p/w1280/yXQ12YQSa846QeAJlb5HZYkbWDc.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 400160,
    title: "Bob l'éponge, le film: Éponge en eaux troubles",
    year: 2020,
    originalTitle: 'The SpongeBob Movie: Sponge on the Run',
    overview:
      'Suite à l’escargotnapping de Gary, son compagnon de toujours, Bob entraîne Patrick dans une folle aventure vers la Cité Perdue d’Atlantic City afin de le retrouver. A travers cette mission sauvetage pleine de surprises, de merveilles et de dangers, Bob l’Éponge et ses acolytes vont réaliser que rien n’est plus fort que le pouvoir de l’amitié.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/sVeJ29yoYF9iExsALVBGLY26Of2.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 7443,
    title: 'Chicken Run',
    year: 2000,
    originalTitle: 'Chicken Run',
    overview:
      'À la ferme des Tweedy, les poules qui ne pondent pas pour le breakfast savent qu’elles risquent de finir au menu du dîner. Il leur faut prendre leurs pattes à leur cou au plus vite.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/52ILcyaRoMegsAHlMSyHcw0B2XQ.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 799514,
    title: 'Runmania',
    year: 2020,
    originalTitle: 'Бегомания',
    overview:
      "L'héroïne du film court s'entraîne pour un marathon, mais ce n'est pas une raison pour rester indifférente aux gens rencontrés dans le parc !",
    posterURL: 'https://image.tmdb.org/t/p/w1280/xHKBpYDa8Sfzvecdn1UN6dkCOoF.jpg',
    language: {
      code: 'ru',
      label: 'Russian',
      altCodes: ['rus']
    },
    countries: []
  },
  {
    id: 629017,
    title: 'Run Hide Fight',
    year: 2021,
    originalTitle: 'Run Hide Fight',
    overview:
      "Zoe est sur le point d'obtenir son diplôme à un moment très difficile de sa vie après la mort de sa mère. Pour se distraire, elle part à la chasse avec son père Todd, ancien membre des forces spéciales. Un jour, alors que Zoe est à l'école, quatre élèves assiègent le bâtiment et pénètrent dans le bar de l'école avec une camionnette. En utilisant les techniques qu'elle a apprises de son père, Zoe parvient à échapper aux assaillants.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/wlP25H14OvKoFORIwuKomZzioA5.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 576682,
    title: 'Régner sur la ville',
    year: 2020,
    originalTitle: 'Run This Town',
    overview: "Un jeune journaliste décroche un scoop sur les agissements d'un homme politique véreux.",
    posterURL: 'https://image.tmdb.org/t/p/w1280/nMgBR5hRxg725jAJFLEn5jlCeIz.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 688809,
    title: 'The Runners',
    year: 2020,
    originalTitle: 'The Runners',
    overview:
      'A man races against time to save his teenage sister from human traffickers who want to sell her to a Mexican cartel.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/9pXQKpofog0ILXiJWdYtPJQlm35.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 1197141,
    title: "Michael's Run",
    year: 2020,
    originalTitle: "Michael's Run",
    overview:
      "Michael is minding is own business, until a run in with the local gang prompts a chase he'll never forget...",
    posterURL: 'https://image.tmdb.org/t/p/w1280/jfx0T8zr13mDoISE7EY5fyDq6qY.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  },
  {
    id: 724574,
    title: 'Runt',
    year: 2020,
    originalTitle: 'Runt',
    overview:
      'Neglected and unsupervised, a group of high school seniors are pulled into a downward cycle of violence.',
    posterURL: 'https://image.tmdb.org/t/p/w1280/pl8ErG20nzAWOkcCVu88hjUt41t.jpg',
    language: {
      code: 'en',
      label: 'English',
      altCodes: ['eng'],
      isRegionImportant: true
    },
    countries: []
  }
] as SearchResult[]
test('Run bug', async () => {
  currentSettings.language = 'fr'
  currentSettings.favoriteLanguages = ['fr-FR']
  const movieResult = SearchResult.getBestMatch(runSearchResults, 'Run', 2020)
  expect(movieResult).toBeDefined()
  expect(movieResult.id).toBe(546121)
})
