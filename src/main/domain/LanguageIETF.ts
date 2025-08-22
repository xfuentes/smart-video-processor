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

import { Country } from './Countries'

export interface LanguageIETF {
  code: string
  label: string
  altCodes?: string[]
  matchNames?: string[]
  matchCountries?: string[]
  isRegionImportant?: boolean
}

const languages: LanguageIETF[] = [
  { code: 'und', label: 'Undetermined', altCodes: ['xx'] },
  { code: 'aa', label: 'Afar', altCodes: ['aar'] },
  { code: 'ab', label: 'Abkhazian', altCodes: ['abk'] },
  { code: 'af', label: 'Afrikaans', altCodes: ['afr'] },
  { code: 'ak', label: 'Akan', altCodes: ['aka'] },
  { code: 'av', label: 'Avaric', altCodes: ['ava'], matchNames: ['Avar'] },
  { code: 'ae', label: 'Avestan', altCodes: ['ave'] },
  { code: 'ba', label: 'Bashkir', altCodes: ['bak'] },
  { code: 'bih', label: 'Bihari languages' },
  { code: 'bi', label: 'Bislama', altCodes: ['bis'] },
  { code: 'bo', label: 'Tibetan', altCodes: ['bod', 'tib'] },
  { code: 'ch', label: 'Chamorro', altCodes: ['cha'] },
  { code: 'ce', label: 'Chechen', altCodes: ['che'] },
  {
    code: 'cu',
    label: 'Church Slavonic',
    altCodes: ['chu'],
    matchNames: ['Old Bulgarian', 'Church Slavic', 'Old Slavonic']
  },
  { code: 'cv', label: 'Chuvash', altCodes: ['chv'] },
  { code: 'kw', label: 'Cornish', altCodes: ['cor'] },
  { code: 'cr', label: 'Cree', altCodes: ['cre'] },
  { code: 'dz', label: 'Dzongkha', altCodes: ['dzo'] },
  { code: 'fj', label: 'Fijian', altCodes: ['fij'] },
  { code: 'ff', label: 'Fulah', altCodes: ['ful'] },
  { code: 'gv', label: 'Manx', altCodes: ['glv'] },
  { code: 'hz', label: 'Herero', altCodes: ['her'] },
  { code: 'ho', label: 'Hiri Motu', altCodes: ['hmo'] },
  { code: 'io', label: 'Ido', altCodes: ['ido'] },
  { code: 'ii', label: 'Sichuan Yi', altCodes: ['iii'], matchNames: ['Nuosu'] },
  { code: 'iu', label: 'Inuktitut', altCodes: ['iku'] },
  { code: 'ie', label: 'Occidental', altCodes: ['ile'], matchNames: ['Interlingue'] },
  { code: 'ik', label: 'Inupiaq', altCodes: ['ipk'] },
  { code: 'kl', label: 'Greenlandic', altCodes: ['kal'], matchNames: ['Kalaallisut'] },
  { code: 'ks', label: 'Kashmiri', altCodes: ['kas'] },
  { code: 'kr', label: 'Kanuri', altCodes: ['kau'] },
  { code: 'ki', label: 'Kikuyu', altCodes: ['kik'], matchNames: ['Gikuyu'] },
  { code: 'kv', label: 'Komi', altCodes: ['kom'] },
  { code: 'kg', label: 'Kongo', altCodes: ['kon'] },
  { code: 'kj', label: 'Kuanyama', altCodes: ['kua'], matchNames: ['Kwanyama'] },
  { code: 'li', label: 'Limburgan', altCodes: ['lim'], matchNames: ['Limburger', 'Limburgish'] },
  { code: 'lu', label: 'Luba-Katanga', altCodes: ['lub'] },
  { code: 'mh', label: 'Marshallese', altCodes: ['mah'] },
  { code: 'na', label: 'Nauru', altCodes: ['nau'], matchNames: ['Nauruan'] },
  { code: 'nv', label: 'Navajo', altCodes: ['nav'], matchNames: ['Navaho'] },
  {
    code: 'nr',
    label: 'South Ndebele',
    altCodes: ['nbl'],
    matchNames: ['Ndebele, South', 'Southern Ndebele']
  },
  {
    code: 'nd',
    label: 'North Ndebele',
    altCodes: ['nde'],
    matchNames: ['Ndebele, North', 'Northern Ndebele']
  },
  { code: 'ng', label: 'Ndonga', altCodes: ['ndo'] },
  { code: 'oj', label: 'Ojibwa', altCodes: ['oji'], matchNames: ['Ojibwe', 'Ojibwan'] },
  { code: 'os', label: 'Ossetian', altCodes: ['oss'], matchNames: ['Ossetic'] },
  { code: 'pi', label: 'Pali', altCodes: ['pli'] },
  { code: 'rn', label: 'Rundi', altCodes: ['run'], matchNames: ['Kirundi'] },
  { code: 'sg', label: 'Sango', altCodes: ['sag'] },
  { code: 'se', label: 'Northern Sami', altCodes: ['sme'] },
  { code: 'sc', label: 'Sardinian', altCodes: ['srd'] },
  { code: 'ss', label: 'Swati', altCodes: ['ssw'], matchNames: ['Swazi'] },
  { code: 'ty', label: 'Tahitian', altCodes: ['tah'] },
  { code: 'tl', label: 'Tagalog', altCodes: ['tgl'] },
  { code: 've', label: 'Venda', altCodes: ['ven'] },
  { code: 'vo', label: 'Volapük', altCodes: ['vol'] },
  { code: 'sq', label: 'Albanian', altCodes: ['alb', 'sqi'] },
  { code: 'am', label: 'Amharic', altCodes: ['amh'] },
  { code: 'ar', label: 'Arabic', altCodes: ['ara'] },
  { code: 'an', label: 'Aragonese', altCodes: ['arg'] },
  { code: 'hy', label: 'Armenian', altCodes: ['arm', 'hye'] },
  { code: 'as', label: 'Assamese', altCodes: ['asm'] },
  { code: 'ast', label: 'Asturian' },
  { code: 'ay', label: 'Aymara', altCodes: ['aym'] },
  { code: 'az', label: 'Azerbaijani', altCodes: ['aze'] },
  { code: 'bm', label: 'Bambara', altCodes: ['bam'] },
  { code: 'bn', label: 'Bengali (Bangla)', altCodes: ['ben'] },
  { code: 'eu', label: 'Basque', altCodes: ['baq', 'eus'] },
  { code: 'be', label: 'Belarusian', altCodes: ['bel'] },
  { code: 'bho', label: 'Bhojpuri' },
  { code: 'bs', label: 'Bosnian', altCodes: ['bos'] },
  { code: 'br', label: 'Breton', altCodes: ['bre'] },
  { code: 'bg', label: 'Bulgarian', altCodes: ['bul'] },
  { code: 'my', label: 'Burmese', altCodes: ['bur', 'mya'] },
  { code: 'ca', label: 'Catalan', altCodes: ['cat'] },
  { code: 'ceb', label: 'Cebuano' },
  { code: 'chr', label: 'Cherokee' },
  { code: 'zh', label: 'Chinese', altCodes: ['chi', 'zho'], isRegionImportant: true },
  { code: 'yue', label: 'Yue Chinese', altCodes: ['cn'], matchNames: ['Yue'] },
  { code: 'za', label: 'Zhuang', altCodes: ['zha'], matchNames: ['Chuang'] },
  { code: 'zh-HK', label: 'Chinese (Hong Kong)' },
  {
    code: 'zh-TW',
    label: 'Chinese (Taiwan)',
    altCodes: ['zhtw'],
    matchNames: ['Chinese'],
    matchCountries: ['Taiwan']
  },
  { code: 'co', label: 'Corsican', altCodes: ['cos'] },
  { code: 'hr', label: 'Croatian', altCodes: ['hrv'] },
  { code: 'cs', label: 'Czech', altCodes: ['cze', 'ces'] },
  { code: 'da', label: 'Danish', altCodes: ['dan'] },
  { code: 'dv', label: 'Divehi', altCodes: ['div'] },
  { code: 'doi', label: 'Dogri' },
  { code: 'nl', label: 'Dutch', altCodes: ['dut', 'nld'] },
  { code: 'en', label: 'English', altCodes: ['eng'], isRegionImportant: true },
  { code: 'en-AU', label: 'English (Australia)' },
  { code: 'en-CA', label: 'English (Canada)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-IE', label: 'English (Ireland)' },
  { code: 'en-NZ', label: 'English (New Zealand)' },
  { code: 'en-ZA', label: 'English (South Africa)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'eo', label: 'Esperanto', altCodes: ['epo'] },
  { code: 'et', label: 'Estonian', altCodes: ['est'] },
  { code: 'ee', label: 'Ewe', altCodes: ['ewe'] },
  { code: 'fo', label: 'Faroese', altCodes: ['fao'] },
  { code: 'fil', label: 'Filipino' },
  { code: 'fi', label: 'Finnish', altCodes: ['fin'] },
  {
    code: 'fr',
    label: 'French',
    altCodes: ['fre', 'fra'],
    matchNames: ['French', 'Français', 'Francais'],
    isRegionImportant: true
  },
  {
    code: 'fr-CA',
    label: 'French (Canada)',
    matchNames: ['French', 'Français'],
    matchCountries: ['Canada', 'CA']
  },
  {
    code: 'fr-FR',
    label: 'French (France)',
    matchNames: ['French', 'Français'],
    matchCountries: ['France', 'FR']
  },
  {
    code: 'fr-CH',
    label: 'French (Switzerland)',
    matchNames: ['French', 'Français'],
    matchCountries: ['Switzerland', 'Suisse', 'CH']
  },
  { code: 'gl', label: 'Galician', altCodes: ['glg'] },
  { code: 'lg', label: 'Ganda', altCodes: ['lug'] },
  { code: 'ka', label: 'Georgian', altCodes: ['geo', 'kat'] },
  { code: 'de', label: 'German', altCodes: ['ger', 'deu'], isRegionImportant: true },
  { code: 'de-AT', label: 'German (Austria)' },
  { code: 'de-DE', label: 'German (Germany)' },
  { code: 'de-LI', label: 'German (Liechtenstein)' },
  { code: 'de-CH', label: 'German (Switzerland)' },
  { code: 'el', label: 'Greek', altCodes: ['gre', 'ell'] },
  { code: 'gn', label: 'Guarani', altCodes: ['grn'] },
  { code: 'gu', label: 'Gujarati', altCodes: ['guj'] },
  { code: 'ht', label: 'Haitian Creole', altCodes: ['hat'] },
  { code: 'ha', label: 'Hausa', altCodes: ['hau'] },
  { code: 'haw', label: 'Hawaiian' },
  { code: 'he', label: 'Hebrew', altCodes: ['heb'] },
  { code: 'hi', label: 'Hindi', altCodes: ['hin'] },
  { code: 'hmn', label: 'Hmong' },
  { code: 'hu', label: 'Hungarian', altCodes: ['hun'] },
  { code: 'is', label: 'Icelandic', altCodes: ['ice', 'isl'] },
  { code: 'ig', label: 'Igbo', altCodes: ['ibo'] },
  { code: 'ilo', label: 'Iloko' },
  { code: 'id', label: 'Indonesian', altCodes: ['ind'] },
  { code: 'ia', label: 'Interlingua', altCodes: ['ina'] },
  { code: 'ga', label: 'Irish', altCodes: ['gle'] },
  { code: 'it', label: 'Italian', altCodes: ['ita'], isRegionImportant: true },
  { code: 'it-IT', label: 'Italian (Italy)' },
  { code: 'it-CH', label: 'Italian (Switzerland)' },
  { code: 'ja', label: 'Japanese', altCodes: ['jpn'] },
  { code: 'jv', label: 'Javanese', altCodes: ['jav'] },
  { code: 'kn', label: 'Kannada', altCodes: ['kan'] },
  { code: 'kk', label: 'Kazakh', altCodes: ['kaz'] },
  { code: 'km', label: 'Khmer', altCodes: ['khm'] },
  { code: 'rw', label: 'Kinyarwanda', altCodes: ['kin'] },
  { code: 'kok', label: 'Konkani' },
  { code: 'ko', label: 'Korean', altCodes: ['kor'] },
  { code: 'kri', label: 'Krio' },
  { code: 'ku', label: 'Kurdish', altCodes: ['kur'] },
  { code: 'ky', label: 'Kyrgyz', altCodes: ['kir'] },
  { code: 'lo', label: 'Lao', altCodes: ['lao'] },
  { code: 'la', label: 'Latin', altCodes: ['lat'] },
  { code: 'lv', label: 'Latvian', altCodes: ['lav'] },
  { code: 'ln', label: 'Lingala', altCodes: ['lin'] },
  { code: 'lt', label: 'Lithuanian', altCodes: ['lit'] },
  { code: 'lb', label: 'Luxembourgish', altCodes: ['ltz'] },
  { code: 'mk', label: 'Macedonian', altCodes: ['mac', 'mkd'] },
  { code: 'mai', label: 'Maithili' },
  { code: 'mg', label: 'Malagasy', altCodes: ['mlg'] },
  { code: 'ms', label: 'Malay', altCodes: ['may', 'msa'] },
  { code: 'ml', label: 'Malayalam', altCodes: ['mal'] },
  { code: 'mt', label: 'Maltese', altCodes: ['mlt'] },
  { code: 'mni', label: 'Manipuri (Meitei Mayek)' },
  { code: 'mi', label: 'Māori', altCodes: ['mao', 'mri'] },
  { code: 'mr', label: 'Marathi', altCodes: ['mar'] },
  { code: 'lus', label: 'Mizo' },
  { code: 'mn', label: 'Mongolian', altCodes: ['mon'] },
  { code: 'ne', label: 'Nepali', altCodes: ['nep'] },
  { code: 'nso', label: 'Northern Sotho' },
  { code: 'no', label: 'Norwegian', altCodes: ['nor'] },
  { code: 'nb', label: 'Norwegian Bokmål', altCodes: ['nob'] },
  { code: 'nn', label: 'Norwegian Nynorsk', altCodes: ['nno'] },
  { code: 'ny', label: 'Nyanja', altCodes: ['nya'] },
  { code: 'oc', label: 'Occitan', altCodes: ['oci'] },
  { code: 'or', label: 'Odia', altCodes: ['ori'] },
  { code: 'om', label: 'Oromo', altCodes: ['orm'] },
  { code: 'ps', label: 'Pashto', altCodes: ['pus'] },
  { code: 'fa', label: 'Persian', altCodes: ['per', 'fas'] },
  { code: 'pl', label: 'Polish', altCodes: ['pol'] },
  { code: 'pt', label: 'Portuguese', altCodes: ['por'], isRegionImportant: true },
  { code: 'pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pa', label: 'Punjabi', altCodes: ['pan'] },
  { code: 'qu', label: 'Quechua', altCodes: ['que'] },
  { code: 'ro', label: 'Romanian', altCodes: ['rum', 'ron'], isRegionImportant: true },
  { code: 'ro-RO', label: 'Romanian (Romania)' },
  { code: 'ro-MD', label: 'Romanian (Moldova)', altCodes: ['mo', 'mol'] },
  { code: 'roh', label: 'Romansh', altCodes: ['rm'] },
  { code: 'ru', label: 'Russian', altCodes: ['rus'] },
  { code: 'sm', label: 'Samoan', altCodes: ['smo'] },
  { code: 'sa', label: 'Sanskrit', altCodes: ['san'] },
  { code: 'gd', label: 'Scottish Gaelic', altCodes: ['gla'] },
  { code: 'sr', label: 'Serbian', altCodes: ['scc', 'srp'] },
  { code: 'sh', label: 'Serbo-Croatian', altCodes: ['scr'] },
  { code: 'sn', label: 'Shona', altCodes: ['sna'] },
  { code: 'sd', label: 'Sindhi', altCodes: ['snd'] },
  { code: 'si', label: 'Sinhala', altCodes: ['sin'] },
  { code: 'sk', label: 'Slovak', altCodes: ['slo', 'slk'] },
  { code: 'sl', label: 'Slovenian', altCodes: ['slv'] },
  { code: 'so', label: 'Somali', altCodes: ['som'] },
  { code: 'st', label: 'Southern Sotho', altCodes: ['sot'] },
  { code: 'es', label: 'Spanish', altCodes: ['spa'], isRegionImportant: true },
  { code: 'es-AR', label: 'Spanish (Argentina)' },
  { code: 'es-CL', label: 'Spanish (Chile)' },
  { code: 'es-CO', label: 'Spanish (Colombia)' },
  { code: 'es-CR', label: 'Spanish (Costa Rica)' },
  { code: 'es-HN', label: 'Spanish (Honduras)' },
  { code: 'es-MX', label: 'Spanish (Mexico)' },
  { code: 'es-PE', label: 'Spanish (Peru)' },
  { code: 'es-ES', label: 'Spanish (Spain)' },
  { code: 'es-US', label: 'Spanish (United States)' },
  { code: 'es-UY', label: 'Spanish (Uruguay)' },
  { code: 'es-VE', label: 'Spanish (Venezuela)' },
  { code: 'su', label: 'Sundanese', altCodes: ['sun'] },
  { code: 'sw', label: 'Swahili', altCodes: ['swa'] },
  { code: 'sv', label: 'Swedish', altCodes: ['swe'] },
  { code: 'tg', label: 'Tajik', altCodes: ['tgk'] },
  { code: 'ta', label: 'Tamil', altCodes: ['tam'] },
  { code: 'tt', label: 'Tatar', altCodes: ['tat'] },
  { code: 'te', label: 'Telugu', altCodes: ['tel'] },
  { code: 'th', label: 'Thai', altCodes: ['tha'] },
  { code: 'ti', label: 'Tigrinya', altCodes: ['tir'] },
  { code: 'to', label: 'Tongan', altCodes: ['ton'] },
  { code: 'ts', label: 'Tsonga', altCodes: ['tso'] },
  { code: 'tn', label: 'Tswana', altCodes: ['tsn'] },
  { code: 'tr', label: 'Turkish', altCodes: ['tur'] },
  { code: 'tk', label: 'Turkmen', altCodes: ['tuk'] },
  { code: 'tw', label: 'Twi', altCodes: ['twi'] },
  { code: 'uk', label: 'Ukrainian', altCodes: ['ukr'] },
  { code: 'ur', label: 'Urdu', altCodes: ['urd'] },
  { code: 'ug', label: 'Uyghur', altCodes: ['uig'] },
  { code: 'uz', label: 'Uzbek', altCodes: ['uzb'] },
  { code: 'vi', label: 'Vietnamese', altCodes: ['vie'] },
  { code: 'wa', label: 'Walloon', altCodes: ['wln'] },
  { code: 'cy', label: 'Welsh', altCodes: ['wel', 'cym'] },
  { code: 'fy', label: 'Western Frisian', altCodes: ['fry'] },
  { code: 'wo', label: 'Wolof', altCodes: ['wol'] },
  { code: 'xh', label: 'Xhosa', altCodes: ['xho'] },
  { code: 'yi', label: 'Yiddish', altCodes: ['yid'] },
  { code: 'yo', label: 'Yoruba', altCodes: ['yor'] },
  { code: 'zu', label: 'Zulu', altCodes: ['zul'] },
  { code: 'arc', label: 'Aramaic (700-300 BCE)' }
]

export class Languages {
  static getList(): LanguageIETF[] {
    return languages
  }

  static getLanguageByCode(code: string | undefined, exact?: boolean) {
    if (!code) {
      return undefined
    }
    let found = languages.find((lang) => {
      return lang.code === code || lang.altCodes?.includes(code)
    })

    if (!exact && !found && code.indexOf('-') !== -1) {
      const simpleCode = code.substring(0, code.indexOf('-'))
      found = languages.find((lang) => {
        return lang.code === simpleCode || lang.altCodes?.includes(simpleCode)
      })
    }

    return found
  }

  static fromIETF(languageIETF: string | undefined) {
    if (!languageIETF) {
      return {}
    }
    const sep = languageIETF.indexOf('-')
    const language = languageIETF.substring(0, sep !== -1 ? sep : undefined)
    const region = sep !== -1 ? languageIETF.substring(sep + 1) : undefined
    return { language, region }
  }

  static toIETF(language?: string, region?: string): string | undefined {
    return language !== undefined
      ? language + (region !== undefined ? '-' + region : '')
      : undefined
  }

  static descriptionMatchLanguage(description: string, lang: LanguageIETF): boolean {
    let matching = false
    const prev = '(?<=\\P{Letter})'
    const next = '(?=\\P{Letter})'
    let langCodePat = lang.code === 'vo' ? '' : `${lang.code.toUpperCase()}`
    const altCodesPat = lang.altCodes ? lang.altCodes.map((l) => l.toUpperCase()).join('|') : ''
    langCodePat =
      langCodePat.length > 0 && altCodesPat.length > 0
        ? `${langCodePat}|${altCodesPat}`
        : langCodePat + altCodesPat
    const codePattern = new RegExp(prev + `(?:${langCodePat})` + next, 'u')
    const descPat = prev + lang.label + next

    if (
      new RegExp(codePattern, 'u').exec('\n' + description + '\n') !== null ||
      new RegExp(descPat, 'iu').exec('\n' + description + '\n') !== null
    ) {
      matching = true
    } else if (lang.matchNames || lang.matchCountries) {
      matching = true
      if (lang.matchNames) {
        const patStr2 = `${prev}(?:${lang.matchNames.join('|')})${next}`
        const pattern2 = new RegExp(patStr2, 'iu')
        if (pattern2.exec('\n' + description + '\n') === null) {
          matching = false
        }
      }
      if (lang.matchCountries) {
        const patStr2 = `${prev}(?:${lang.matchCountries.join('|')})${next}`
        const pattern2 = new RegExp(patStr2, 'iu')
        if (pattern2.exec('\n' + description + '\n') === null) {
          matching = false
        }
      }
    }
    return matching
  }

  static findLanguageFromDescription(description: string) {
    return languages.find((lang) => this.descriptionMatchLanguage(description, lang))
  }

  static guessLanguageIETFFromCountries(languageCode: string, originalCountries: Country[]) {
    const language = Languages.getLanguageByCode(languageCode)
    const candidates: LanguageIETF[] = []
    if (originalCountries.length > 0) {
      for (const country of originalCountries) {
        const languageIETF = this.getLanguageByCode(language?.code + '-' + country.alpha2, true)
        if (languageIETF != undefined) {
          candidates.push(languageIETF)
        }
      }
    }
    if (candidates.length === 1) {
      return candidates[0]
    }
    return language
  }

  static getMatchingCodeFromCodeList(languageToMatch: LanguageIETF, codes: string[]) {
    for (const code of codes) {
      if (code === languageToMatch.code || languageToMatch.altCodes?.includes(code)) {
        return code
      }
    }
    return undefined
  }

  static searchByNameOrCode(input: string) {
    const loweredInput = input.toLocaleLowerCase()
    return languages.filter((lang) => {
      return (
        lang.code.toLocaleLowerCase().indexOf(loweredInput) !== -1 ||
        lang.label.toLocaleLowerCase().indexOf(loweredInput) !== -1
      )
    })
  }
}
