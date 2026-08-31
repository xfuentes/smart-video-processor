/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
  i18nKey: string
  label: string
  altCodes?: string[]
  matchNames?: string[]
  matchCountries?: string[]
  isRegionImportant?: boolean
}

const languages: LanguageIETF[] = [
  { code: 'und', i18nKey: 'language.und', label: 'Undetermined', altCodes: ['xx'] },
  { code: 'aa', i18nKey: 'language.aa', label: 'Afar', altCodes: ['aar'] },
  { code: 'ab', i18nKey: 'language.ab', label: 'Abkhazian', altCodes: ['abk'] },
  { code: 'af', i18nKey: 'language.af', label: 'Afrikaans', altCodes: ['afr'] },
  { code: 'ak', i18nKey: 'language.ak', label: 'Akan', altCodes: ['aka'] },
  { code: 'av', i18nKey: 'language.av', label: 'Avaric', altCodes: ['ava'], matchNames: ['Avar'] },
  { code: 'ae', i18nKey: 'language.ae', label: 'Avestan', altCodes: ['ave'] },
  { code: 'ba', i18nKey: 'language.ba', label: 'Bashkir', altCodes: ['bak'] },
  { code: 'bih', i18nKey: 'language.bih', label: 'Bihari languages' },
  { code: 'bi', i18nKey: 'language.bi', label: 'Bislama', altCodes: ['bis'] },
  { code: 'bo', i18nKey: 'language.bo', label: 'Tibetan', altCodes: ['bod', 'tib'] },
  { code: 'ch', i18nKey: 'language.ch', label: 'Chamorro', altCodes: ['cha'] },
  { code: 'ce', i18nKey: 'language.ce', label: 'Chechen', altCodes: ['che'] },
  {
    code: 'cu',
    i18nKey: 'language.cu',
    label: 'Church Slavonic',
    altCodes: ['chu'],
    matchNames: ['Old Bulgarian', 'Church Slavic', 'Old Slavonic']
  },
  { code: 'cv', i18nKey: 'language.cv', label: 'Chuvash', altCodes: ['chv'] },
  { code: 'kw', i18nKey: 'language.kw', label: 'Cornish', altCodes: ['cor'] },
  { code: 'cr', i18nKey: 'language.cr', label: 'Cree', altCodes: ['cre'] },
  { code: 'dz', i18nKey: 'language.dz', label: 'Dzongkha', altCodes: ['dzo'] },
  { code: 'fj', i18nKey: 'language.fj', label: 'Fijian', altCodes: ['fij'] },
  { code: 'ff', i18nKey: 'language.ff', label: 'Fulah', altCodes: ['ful'] },
  { code: 'gv', i18nKey: 'language.gv', label: 'Manx', altCodes: ['glv'] },
  { code: 'hz', i18nKey: 'language.hz', label: 'Herero', altCodes: ['her'] },
  { code: 'ho', i18nKey: 'language.ho', label: 'Hiri Motu', altCodes: ['hmo'] },
  { code: 'io', i18nKey: 'language.io', label: 'Ido', altCodes: ['ido'] },
  { code: 'ii', i18nKey: 'language.ii', label: 'Sichuan Yi', altCodes: ['iii'], matchNames: ['Nuosu'] },
  { code: 'iu', i18nKey: 'language.iu', label: 'Inuktitut', altCodes: ['iku'] },
  { code: 'ie', i18nKey: 'language.ie', label: 'Occidental', altCodes: ['ile'], matchNames: ['Interlingue'] },
  { code: 'ik', i18nKey: 'language.ik', label: 'Inupiaq', altCodes: ['ipk'] },
  { code: 'kl', i18nKey: 'language.kl', label: 'Greenlandic', altCodes: ['kal'], matchNames: ['Kalaallisut'] },
  { code: 'ks', i18nKey: 'language.ks', label: 'Kashmiri', altCodes: ['kas'] },
  { code: 'kr', i18nKey: 'language.kr', label: 'Kanuri', altCodes: ['kau'] },
  { code: 'ki', i18nKey: 'language.ki', label: 'Kikuyu', altCodes: ['kik'], matchNames: ['Gikuyu'] },
  { code: 'kv', i18nKey: 'language.kv', label: 'Komi', altCodes: ['kom'] },
  { code: 'kg', i18nKey: 'language.kg', label: 'Kongo', altCodes: ['kon'] },
  { code: 'kj', i18nKey: 'language.kj', label: 'Kuanyama', altCodes: ['kua'], matchNames: ['Kwanyama'] },
  {
    code: 'li',
    i18nKey: 'language.li',
    label: 'Limburgan',
    altCodes: ['lim'],
    matchNames: ['Limburger', 'Limburgish']
  },
  { code: 'lu', i18nKey: 'language.lu', label: 'Luba-Katanga', altCodes: ['lub'] },
  { code: 'mh', i18nKey: 'language.mh', label: 'Marshallese', altCodes: ['mah'] },
  { code: 'na', i18nKey: 'language.na', label: 'Nauru', altCodes: ['nau'], matchNames: ['Nauruan'] },
  { code: 'nv', i18nKey: 'language.nv', label: 'Navajo', altCodes: ['nav'], matchNames: ['Navaho'] },
  {
    code: 'nr',
    i18nKey: 'language.nr',
    label: 'South Ndebele',
    altCodes: ['nbl'],
    matchNames: ['Ndebele, South', 'Southern Ndebele']
  },
  {
    code: 'nd',
    i18nKey: 'language.nd',
    label: 'North Ndebele',
    altCodes: ['nde'],
    matchNames: ['Ndebele, North', 'Northern Ndebele']
  },
  { code: 'ng', i18nKey: 'language.ng', label: 'Ndonga', altCodes: ['ndo'] },
  { code: 'oj', i18nKey: 'language.oj', label: 'Ojibwa', altCodes: ['oji'], matchNames: ['Ojibwe', 'Ojibwan'] },
  { code: 'os', i18nKey: 'language.os', label: 'Ossetian', altCodes: ['oss'], matchNames: ['Ossetic'] },
  { code: 'pi', i18nKey: 'language.pi', label: 'Pali', altCodes: ['pli'] },
  { code: 'rn', i18nKey: 'language.rn', label: 'Rundi', altCodes: ['run'], matchNames: ['Kirundi'] },
  { code: 'sg', i18nKey: 'language.sg', label: 'Sango', altCodes: ['sag'] },
  { code: 'se', i18nKey: 'language.se', label: 'Northern Sami', altCodes: ['sme'] },
  { code: 'sc', i18nKey: 'language.sc', label: 'Sardinian', altCodes: ['srd'] },
  { code: 'ss', i18nKey: 'language.ss', label: 'Swati', altCodes: ['ssw'], matchNames: ['Swazi'] },
  { code: 'ty', i18nKey: 'language.ty', label: 'Tahitian', altCodes: ['tah'] },
  { code: 'tl', i18nKey: 'language.tl', label: 'Tagalog', altCodes: ['tgl'] },
  { code: 've', i18nKey: 'language.ve', label: 'Venda', altCodes: ['ven'] },
  { code: 'vo', i18nKey: 'language.vo', label: 'Volapük', altCodes: ['vol'] },
  { code: 'sq', i18nKey: 'language.sq', label: 'Albanian', altCodes: ['alb', 'sqi'] },
  { code: 'am', i18nKey: 'language.am', label: 'Amharic', altCodes: ['amh'] },
  { code: 'ar', i18nKey: 'language.ar', label: 'Arabic', altCodes: ['ara'] },
  { code: 'an', i18nKey: 'language.an', label: 'Aragonese', altCodes: ['arg'] },
  { code: 'hy', i18nKey: 'language.hy', label: 'Armenian', altCodes: ['arm', 'hye'] },
  { code: 'as', i18nKey: 'language.as', label: 'Assamese', altCodes: ['asm'] },
  { code: 'ast', i18nKey: 'language.ast', label: 'Asturian' },
  { code: 'ay', i18nKey: 'language.ay', label: 'Aymara', altCodes: ['aym'] },
  { code: 'az', i18nKey: 'language.az', label: 'Azerbaijani', altCodes: ['aze'] },
  { code: 'bm', i18nKey: 'language.bm', label: 'Bambara', altCodes: ['bam'] },
  { code: 'bn', i18nKey: 'language.bn', label: 'Bengali (Bangla)', altCodes: ['ben'] },
  { code: 'eu', i18nKey: 'language.eu', label: 'Basque', altCodes: ['baq', 'eus'] },
  { code: 'be', i18nKey: 'language.be', label: 'Belarusian', altCodes: ['bel'] },
  { code: 'bho', i18nKey: 'language.bho', label: 'Bhojpuri' },
  { code: 'bs', i18nKey: 'language.bs', label: 'Bosnian', altCodes: ['bos'] },
  { code: 'br', i18nKey: 'language.br', label: 'Breton', altCodes: ['bre'] },
  { code: 'bg', i18nKey: 'language.bg', label: 'Bulgarian', altCodes: ['bul'] },
  { code: 'my', i18nKey: 'language.my', label: 'Burmese', altCodes: ['bur', 'mya'] },
  { code: 'ca', i18nKey: 'language.ca', label: 'Catalan', altCodes: ['cat'] },
  { code: 'ceb', i18nKey: 'language.ceb', label: 'Cebuano' },
  { code: 'chr', i18nKey: 'language.chr', label: 'Cherokee' },
  { code: 'zh', i18nKey: 'language.zh', label: 'Chinese', altCodes: ['chi', 'zho'], isRegionImportant: true },
  { code: 'yue', i18nKey: 'language.yue', label: 'Yue Chinese', altCodes: ['cn'], matchNames: ['Yue'] },
  { code: 'za', i18nKey: 'language.za', label: 'Zhuang', altCodes: ['zha'], matchNames: ['Chuang'] },
  { code: 'zh-HK', i18nKey: 'language.zh-HK', label: 'Chinese (Hong Kong)' },
  {
    code: 'zh-TW',
    i18nKey: 'language.zh-TW',
    label: 'Chinese (Taiwan)',
    altCodes: ['zhtw'],
    matchNames: ['Chinese'],
    matchCountries: ['Taiwan']
  },
  { code: 'co', i18nKey: 'language.co', label: 'Corsican', altCodes: ['cos'] },
  { code: 'hr', i18nKey: 'language.hr', label: 'Croatian', altCodes: ['hrv'] },
  { code: 'cs', i18nKey: 'language.cs', label: 'Czech', altCodes: ['cze', 'ces'] },
  { code: 'da', i18nKey: 'language.da', label: 'Danish', altCodes: ['dan'] },
  { code: 'dv', i18nKey: 'language.dv', label: 'Divehi', altCodes: ['div'] },
  { code: 'doi', i18nKey: 'language.doi', label: 'Dogri' },
  { code: 'nl', i18nKey: 'language.nl', label: 'Dutch', altCodes: ['dut', 'nld'] },
  { code: 'en', i18nKey: 'language.en', label: 'English', altCodes: ['eng'], isRegionImportant: true },
  { code: 'en-AU', i18nKey: 'language.en-AU', label: 'English (Australia)' },
  { code: 'en-CA', i18nKey: 'language.en-CA', label: 'English (Canada)' },
  { code: 'en-IN', i18nKey: 'language.en-IN', label: 'English (India)' },
  { code: 'en-IE', i18nKey: 'language.en-IE', label: 'English (Ireland)' },
  { code: 'en-NZ', i18nKey: 'language.en-NZ', label: 'English (New Zealand)' },
  { code: 'en-ZA', i18nKey: 'language.en-ZA', label: 'English (South Africa)' },
  { code: 'en-GB', i18nKey: 'language.en-GB', label: 'English (United Kingdom)' },
  { code: 'en-US', i18nKey: 'language.en-US', label: 'English (United States)' },
  { code: 'eo', i18nKey: 'language.eo', label: 'Esperanto', altCodes: ['epo'] },
  { code: 'et', i18nKey: 'language.et', label: 'Estonian', altCodes: ['est'] },
  { code: 'ee', i18nKey: 'language.ee', label: 'Ewe', altCodes: ['ewe'] },
  { code: 'fo', i18nKey: 'language.fo', label: 'Faroese', altCodes: ['fao'] },
  { code: 'fil', i18nKey: 'language.fil', label: 'Filipino' },
  { code: 'fi', i18nKey: 'language.fi', label: 'Finnish', altCodes: ['fin'] },
  {
    code: 'fr',
    i18nKey: 'language.fr',
    label: 'French',
    altCodes: ['fre', 'fra'],
    matchNames: ['French', 'Français', 'Francais'],
    isRegionImportant: true
  },
  {
    code: 'fr-CA',
    i18nKey: 'language.fr-CA',
    label: 'French (Canada)',
    matchNames: ['French', 'Français'],
    matchCountries: ['Canada', 'CA']
  },
  {
    code: 'fr-FR',
    i18nKey: 'language.fr-FR',
    label: 'French (France)',
    matchNames: ['French', 'Français'],
    matchCountries: ['France', 'FR']
  },
  {
    code: 'fr-CH',
    i18nKey: 'language.fr-CH',
    label: 'French (Switzerland)',
    matchNames: ['French', 'Français'],
    matchCountries: ['Switzerland', 'Suisse', 'CH']
  },
  { code: 'gl', i18nKey: 'language.gl', label: 'Galician', altCodes: ['glg'] },
  { code: 'lg', i18nKey: 'language.lg', label: 'Ganda', altCodes: ['lug'] },
  { code: 'ka', i18nKey: 'language.ka', label: 'Georgian', altCodes: ['geo', 'kat'] },
  { code: 'de', i18nKey: 'language.de', label: 'German', altCodes: ['ger', 'deu'], isRegionImportant: true },
  { code: 'de-AT', i18nKey: 'language.de-AT', label: 'German (Austria)' },
  { code: 'de-DE', i18nKey: 'language.de-DE', label: 'German (Germany)' },
  { code: 'de-LI', i18nKey: 'language.de-LI', label: 'German (Liechtenstein)' },
  { code: 'de-CH', i18nKey: 'language.de-CH', label: 'German (Switzerland)' },
  { code: 'el', i18nKey: 'language.el', label: 'Greek', altCodes: ['gre', 'ell'] },
  { code: 'gn', i18nKey: 'language.gn', label: 'Guarani', altCodes: ['grn'] },
  { code: 'gu', i18nKey: 'language.gu', label: 'Gujarati', altCodes: ['guj'] },
  { code: 'ht', i18nKey: 'language.ht', label: 'Haitian Creole', altCodes: ['hat'] },
  { code: 'ha', i18nKey: 'language.ha', label: 'Hausa', altCodes: ['hau'] },
  { code: 'haw', i18nKey: 'language.haw', label: 'Hawaiian' },
  { code: 'he', i18nKey: 'language.he', label: 'Hebrew', altCodes: ['heb'] },
  { code: 'hi', i18nKey: 'language.hi', label: 'Hindi', altCodes: ['hin'] },
  { code: 'hmn', i18nKey: 'language.hmn', label: 'Hmong' },
  { code: 'hu', i18nKey: 'language.hu', label: 'Hungarian', altCodes: ['hun'] },
  { code: 'is', i18nKey: 'language.is', label: 'Icelandic', altCodes: ['ice', 'isl'] },
  { code: 'ig', i18nKey: 'language.ig', label: 'Igbo', altCodes: ['ibo'] },
  { code: 'ilo', i18nKey: 'language.ilo', label: 'Iloko' },
  { code: 'id', i18nKey: 'language.id', label: 'Indonesian', altCodes: ['ind'] },
  { code: 'ia', i18nKey: 'language.ia', label: 'Interlingua', altCodes: ['ina'] },
  { code: 'ga', i18nKey: 'language.ga', label: 'Irish', altCodes: ['gle'] },
  { code: 'it', i18nKey: 'language.it', label: 'Italian', altCodes: ['ita'], isRegionImportant: true },
  { code: 'it-IT', i18nKey: 'language.it-IT', label: 'Italian (Italy)' },
  { code: 'it-CH', i18nKey: 'language.it-CH', label: 'Italian (Switzerland)' },
  { code: 'ja', i18nKey: 'language.ja', label: 'Japanese', altCodes: ['jpn'] },
  { code: 'jv', i18nKey: 'language.jv', label: 'Javanese', altCodes: ['jav'] },
  { code: 'kn', i18nKey: 'language.kn', label: 'Kannada', altCodes: ['kan'] },
  { code: 'kk', i18nKey: 'language.kk', label: 'Kazakh', altCodes: ['kaz'] },
  { code: 'km', i18nKey: 'language.km', label: 'Khmer', altCodes: ['khm'] },
  { code: 'rw', i18nKey: 'language.rw', label: 'Kinyarwanda', altCodes: ['kin'] },
  { code: 'kok', i18nKey: 'language.kok', label: 'Konkani' },
  { code: 'ko', i18nKey: 'language.ko', label: 'Korean', altCodes: ['kor'] },
  { code: 'kri', i18nKey: 'language.kri', label: 'Krio' },
  { code: 'ku', i18nKey: 'language.ku', label: 'Kurdish', altCodes: ['kur'] },
  { code: 'ky', i18nKey: 'language.ky', label: 'Kyrgyz', altCodes: ['kir'] },
  { code: 'lo', i18nKey: 'language.lo', label: 'Lao', altCodes: ['lao'] },
  { code: 'la', i18nKey: 'language.la', label: 'Latin', altCodes: ['lat'] },
  { code: 'lv', i18nKey: 'language.lv', label: 'Latvian', altCodes: ['lav'] },
  { code: 'ln', i18nKey: 'language.ln', label: 'Lingala', altCodes: ['lin'] },
  { code: 'lt', i18nKey: 'language.lt', label: 'Lithuanian', altCodes: ['lit'] },
  { code: 'lb', i18nKey: 'language.lb', label: 'Luxembourgish', altCodes: ['ltz'] },
  { code: 'mk', i18nKey: 'language.mk', label: 'Macedonian', altCodes: ['mac', 'mkd'] },
  { code: 'mai', i18nKey: 'language.mai', label: 'Maithili' },
  { code: 'mg', i18nKey: 'language.mg', label: 'Malagasy', altCodes: ['mlg'] },
  { code: 'ms', i18nKey: 'language.ms', label: 'Malay', altCodes: ['may', 'msa'] },
  { code: 'ml', i18nKey: 'language.ml', label: 'Malayalam', altCodes: ['mal'] },
  { code: 'mt', i18nKey: 'language.mt', label: 'Maltese', altCodes: ['mlt'] },
  { code: 'mni', i18nKey: 'language.mni', label: 'Manipuri (Meitei Mayek)' },
  { code: 'mi', i18nKey: 'language.mi', label: 'Māori', altCodes: ['mao', 'mri'] },
  { code: 'mr', i18nKey: 'language.mr', label: 'Marathi', altCodes: ['mar'] },
  { code: 'lus', i18nKey: 'language.lus', label: 'Mizo' },
  { code: 'mn', i18nKey: 'language.mn', label: 'Mongolian', altCodes: ['mon'] },
  { code: 'ne', i18nKey: 'language.ne', label: 'Nepali', altCodes: ['nep'] },
  { code: 'nso', i18nKey: 'language.nso', label: 'Northern Sotho' },
  { code: 'no', i18nKey: 'language.no', label: 'Norwegian', altCodes: ['nor'] },
  { code: 'nb', i18nKey: 'language.nb', label: 'Norwegian Bokmål', altCodes: ['nob'] },
  { code: 'nn', i18nKey: 'language.nn', label: 'Norwegian Nynorsk', altCodes: ['nno'] },
  { code: 'ny', i18nKey: 'language.ny', label: 'Nyanja', altCodes: ['nya'] },
  { code: 'oc', i18nKey: 'language.oc', label: 'Occitan', altCodes: ['oci'] },
  { code: 'or', i18nKey: 'language.or', label: 'Odia', altCodes: ['ori'] },
  { code: 'om', i18nKey: 'language.om', label: 'Oromo', altCodes: ['orm'] },
  { code: 'ps', i18nKey: 'language.ps', label: 'Pashto', altCodes: ['pus'] },
  { code: 'fa', i18nKey: 'language.fa', label: 'Persian', altCodes: ['per', 'fas'] },
  { code: 'pl', i18nKey: 'language.pl', label: 'Polish', altCodes: ['pol'] },
  { code: 'pt', i18nKey: 'language.pt', label: 'Portuguese', altCodes: ['por'], isRegionImportant: true },
  { code: 'pt-BR', i18nKey: 'language.pt-BR', label: 'Portuguese (Brazil)' },
  { code: 'pt-PT', i18nKey: 'language.pt-PT', label: 'Portuguese (Portugal)' },
  { code: 'pa', i18nKey: 'language.pa', label: 'Punjabi', altCodes: ['pan'] },
  { code: 'qu', i18nKey: 'language.qu', label: 'Quechua', altCodes: ['que'] },
  { code: 'ro', i18nKey: 'language.ro', label: 'Romanian', altCodes: ['rum', 'ron'], isRegionImportant: true },
  { code: 'ro-RO', i18nKey: 'language.ro-RO', label: 'Romanian (Romania)' },
  { code: 'ro-MD', i18nKey: 'language.ro-MD', label: 'Romanian (Moldova)', altCodes: ['mo', 'mol'] },
  { code: 'roh', i18nKey: 'language.roh', label: 'Romansh', altCodes: ['rm'] },
  { code: 'ru', i18nKey: 'language.ru', label: 'Russian', altCodes: ['rus'] },
  { code: 'sm', i18nKey: 'language.sm', label: 'Samoan', altCodes: ['smo'] },
  { code: 'sa', i18nKey: 'language.sa', label: 'Sanskrit', altCodes: ['san'] },
  { code: 'gd', i18nKey: 'language.gd', label: 'Scottish Gaelic', altCodes: ['gla'] },
  { code: 'sr', i18nKey: 'language.sr', label: 'Serbian', altCodes: ['scc', 'srp'] },
  { code: 'sh', i18nKey: 'language.sh', label: 'Serbo-Croatian', altCodes: ['scr'] },
  { code: 'sn', i18nKey: 'language.sn', label: 'Shona', altCodes: ['sna'] },
  { code: 'sd', i18nKey: 'language.sd', label: 'Sindhi', altCodes: ['snd'] },
  { code: 'si', i18nKey: 'language.si', label: 'Sinhala', altCodes: ['sin'] },
  { code: 'sk', i18nKey: 'language.sk', label: 'Slovak', altCodes: ['slo', 'slk'] },
  { code: 'sl', i18nKey: 'language.sl', label: 'Slovenian', altCodes: ['slv'] },
  { code: 'so', i18nKey: 'language.so', label: 'Somali', altCodes: ['som'] },
  { code: 'st', i18nKey: 'language.st', label: 'Southern Sotho', altCodes: ['sot'] },
  { code: 'es', i18nKey: 'language.es', label: 'Spanish', altCodes: ['spa'], isRegionImportant: true },
  { code: 'es-AR', i18nKey: 'language.es-AR', label: 'Spanish (Argentina)' },
  { code: 'es-CL', i18nKey: 'language.es-CL', label: 'Spanish (Chile)' },
  { code: 'es-CO', i18nKey: 'language.es-CO', label: 'Spanish (Colombia)' },
  { code: 'es-CR', i18nKey: 'language.es-CR', label: 'Spanish (Costa Rica)' },
  { code: 'es-HN', i18nKey: 'language.es-HN', label: 'Spanish (Honduras)' },
  { code: 'es-MX', i18nKey: 'language.es-MX', label: 'Spanish (Mexico)' },
  { code: 'es-PE', i18nKey: 'language.es-PE', label: 'Spanish (Peru)' },
  { code: 'es-ES', i18nKey: 'language.es-ES', label: 'Spanish (Spain)' },
  { code: 'es-US', i18nKey: 'language.es-US', label: 'Spanish (United States)' },
  { code: 'es-UY', i18nKey: 'language.es-UY', label: 'Spanish (Uruguay)' },
  { code: 'es-VE', i18nKey: 'language.es-VE', label: 'Spanish (Venezuela)' },
  { code: 'su', i18nKey: 'language.su', label: 'Sundanese', altCodes: ['sun'] },
  { code: 'sw', i18nKey: 'language.sw', label: 'Swahili', altCodes: ['swa'] },
  { code: 'sv', i18nKey: 'language.sv', label: 'Swedish', altCodes: ['swe'] },
  { code: 'tg', i18nKey: 'language.tg', label: 'Tajik', altCodes: ['tgk'] },
  { code: 'ta', i18nKey: 'language.ta', label: 'Tamil', altCodes: ['tam'] },
  { code: 'tt', i18nKey: 'language.tt', label: 'Tatar', altCodes: ['tat'] },
  { code: 'te', i18nKey: 'language.te', label: 'Telugu', altCodes: ['tel'] },
  { code: 'th', i18nKey: 'language.th', label: 'Thai', altCodes: ['tha'] },
  { code: 'ti', i18nKey: 'language.ti', label: 'Tigrinya', altCodes: ['tir'] },
  { code: 'to', i18nKey: 'language.to', label: 'Tongan', altCodes: ['ton'] },
  { code: 'ts', i18nKey: 'language.ts', label: 'Tsonga', altCodes: ['tso'] },
  { code: 'tn', i18nKey: 'language.tn', label: 'Tswana', altCodes: ['tsn'] },
  { code: 'tr', i18nKey: 'language.tr', label: 'Turkish', altCodes: ['tur'] },
  { code: 'tk', i18nKey: 'language.tk', label: 'Turkmen', altCodes: ['tuk'] },
  { code: 'tw', i18nKey: 'language.tw', label: 'Twi', altCodes: ['twi'] },
  { code: 'uk', i18nKey: 'language.uk', label: 'Ukrainian', altCodes: ['ukr'] },
  { code: 'ur', i18nKey: 'language.ur', label: 'Urdu', altCodes: ['urd'] },
  { code: 'ug', i18nKey: 'language.ug', label: 'Uyghur', altCodes: ['uig'] },
  { code: 'uz', i18nKey: 'language.uz', label: 'Uzbek', altCodes: ['uzb'] },
  { code: 'vi', i18nKey: 'language.vi', label: 'Vietnamese', altCodes: ['vie'] },
  { code: 'wa', i18nKey: 'language.wa', label: 'Walloon', altCodes: ['wln'] },
  { code: 'cy', i18nKey: 'language.cy', label: 'Welsh', altCodes: ['wel', 'cym'] },
  { code: 'fy', i18nKey: 'language.fy', label: 'Western Frisian', altCodes: ['fry'] },
  { code: 'wo', i18nKey: 'language.wo', label: 'Wolof', altCodes: ['wol'] },
  { code: 'xh', i18nKey: 'language.xh', label: 'Xhosa', altCodes: ['xho'] },
  { code: 'yi', i18nKey: 'language.yi', label: 'Yiddish', altCodes: ['yid'] },
  { code: 'yo', i18nKey: 'language.yo', label: 'Yoruba', altCodes: ['yor'] },
  { code: 'zu', i18nKey: 'language.zu', label: 'Zulu', altCodes: ['zul'] },
  { code: 'arc', i18nKey: 'language.arc', label: 'Aramaic (700-300 BCE)' }
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
    return language !== undefined ? language + (region !== undefined ? '-' + region : '') : undefined
  }

  static descriptionMatchLanguage(description: string, lang: LanguageIETF): boolean {
    let matching = false
    const prev = '(?<=\\P{Letter})'
    const next = '(?=\\P{Letter})'
    let langCodePat = lang.code === 'vo' ? '' : `${lang.code.toUpperCase()}`
    const altCodesPat = lang.altCodes ? lang.altCodes.map((l) => l.toUpperCase()).join('|') : ''
    langCodePat =
      langCodePat.length > 0 && altCodesPat.length > 0 ? `${langCodePat}|${altCodesPat}` : langCodePat + altCodesPat
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
