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

import { Strings } from './Strings'

export interface Country {
  id: string
  label: string
  alias?: string
  alpha2: string
  alpha3: string
  flagURL: string
}

const countries: Country[] = [
  {
    id: '004',
    label: 'Afghanistan',
    alpha2: 'AF',
    alpha3: 'AFG',
    flagURL: new URL('../../resources/flags/AFG.png', import.meta.url).href
  },
  {
    id: '008',
    label: 'Albania',
    alpha2: 'AL',
    alpha3: 'ALB',
    flagURL: new URL('../../resources/flags/ALB.png', import.meta.url).href
  },
  {
    id: '012',
    label: 'Algeria',
    alpha2: 'DZ',
    alpha3: 'DZA',
    flagURL: new URL('../../resources/flags/DZA.png', import.meta.url).href
  },
  {
    id: '016',
    label: 'American Samoa',
    alpha2: 'AS',
    alpha3: 'ASM',
    flagURL: new URL('../../resources/flags/ASM.png', import.meta.url).href
  },
  {
    id: '020',
    label: 'Andorra',
    alpha2: 'AD',
    alpha3: 'AND',
    flagURL: new URL('../../resources/flags/AND.png', import.meta.url).href
  },
  {
    id: '024',
    label: 'Angola',
    alpha2: 'AO',
    alpha3: 'AGO',
    flagURL: new URL('../../resources/flags/AGO.png', import.meta.url).href
  },
  {
    id: '660',
    label: 'Anguilla',
    alpha2: 'AI',
    alpha3: 'AIA',
    flagURL: new URL('../../resources/flags/AIA.png', import.meta.url).href
  },
  {
    id: '010',
    label: 'Antarctica',
    alpha2: 'AQ',
    alpha3: 'ATA',
    flagURL: new URL('../../resources/flags/ATA.png', import.meta.url).href
  },
  {
    id: '028',
    label: 'Antigua and Barbuda',
    alpha2: 'AG',
    alpha3: 'ATG',
    flagURL: new URL('../../resources/flags/ATG.png', import.meta.url).href
  },
  {
    id: '032',
    label: 'Argentina',
    alpha2: 'AR',
    alpha3: 'ARG',
    flagURL: new URL('../../resources/flags/ARG.png', import.meta.url).href
  },
  {
    id: '051',
    label: 'Armenia',
    alpha2: 'AM',
    alpha3: 'ARM',
    flagURL: new URL('../../resources/flags/ARM.png', import.meta.url).href
  },
  {
    id: '533',
    label: 'Aruba',
    alpha2: 'AW',
    alpha3: 'ABW',
    flagURL: new URL('../../resources/flags/ABW.png', import.meta.url).href
  },
  {
    id: '036',
    label: 'Australia',
    alpha2: 'AU',
    alpha3: 'AUS',
    flagURL: new URL('../../resources/flags/AUS.png', import.meta.url).href
  },
  {
    id: '040',
    label: 'Austria',
    alpha2: 'AT',
    alpha3: 'AUT',
    flagURL: new URL('../../resources/flags/AUT.png', import.meta.url).href
  },
  {
    id: '031',
    label: 'Azerbaijan',
    alpha2: 'AZ',
    alpha3: 'AZE',
    flagURL: new URL('../../resources/flags/AZE.png', import.meta.url).href
  },
  {
    id: '044',
    label: 'Bahamas',
    alpha2: 'BS',
    alpha3: 'BHS',
    flagURL: new URL('../../resources/flags/BHS.png', import.meta.url).href
  },
  {
    id: '048',
    label: 'Bahrain',
    alpha2: 'BH',
    alpha3: 'BHR',
    flagURL: new URL('../../resources/flags/BHR.png', import.meta.url).href
  },
  {
    id: '050',
    label: 'Bangladesh',
    alpha2: 'BD',
    alpha3: 'BGD',
    flagURL: new URL('../../resources/flags/BGD.png', import.meta.url).href
  },
  {
    id: '052',
    label: 'Barbados',
    alpha2: 'BB',
    alpha3: 'BRB',
    flagURL: new URL('../../resources/flags/BRB.png', import.meta.url).href
  },
  {
    id: '112',
    label: 'Belarus',
    alpha2: 'BY',
    alpha3: 'BLR',
    flagURL: new URL('../../resources/flags/BLR.png', import.meta.url).href
  },
  {
    id: '056',
    label: 'Belgium',
    alpha2: 'BE',
    alpha3: 'BEL',
    flagURL: new URL('../../resources/flags/BEL.png', import.meta.url).href
  },
  {
    id: '084',
    label: 'Belize',
    alpha2: 'BZ',
    alpha3: 'BLZ',
    flagURL: new URL('../../resources/flags/BLZ.png', import.meta.url).href
  },
  {
    id: '204',
    label: 'Benin',
    alpha2: 'BJ',
    alpha3: 'BEN',
    flagURL: new URL('../../resources/flags/BEN.png', import.meta.url).href
  },
  {
    id: '060',
    label: 'Bermuda',
    alpha2: 'BM',
    alpha3: 'BMU',
    flagURL: new URL('../../resources/flags/BMU.png', import.meta.url).href
  },
  {
    id: '064',
    label: 'Bhutan',
    alpha2: 'BT',
    alpha3: 'BTN',
    flagURL: new URL('../../resources/flags/BTN.png', import.meta.url).href
  },
  {
    id: '068',
    label: 'Bolivia (Plurinational State of)',
    alpha2: 'BO',
    alpha3: 'BOL',
    flagURL: new URL('../../resources/flags/BOL.png', import.meta.url).href
  },
  {
    id: '535',
    label: 'Bonaire, Sint Eustatius and Saba',
    alpha2: 'BQ',
    alpha3: 'BES',
    flagURL: new URL('../../resources/flags/BES.png', import.meta.url).href
  },
  {
    id: '070',
    label: 'Bosnia and Herzegovina',
    alpha2: 'BA',
    alpha3: 'BIH',
    flagURL: new URL('../../resources/flags/BIH.png', import.meta.url).href
  },
  {
    id: '072',
    label: 'Botswana',
    alpha2: 'BW',
    alpha3: 'BWA',
    flagURL: new URL('../../resources/flags/BWA.png', import.meta.url).href
  },
  {
    id: '074',
    label: 'Bouvet Island',
    alpha2: 'BV',
    alpha3: 'BVT',
    flagURL: new URL('../../resources/flags/BVT.png', import.meta.url).href
  },
  {
    id: '076',
    label: 'Brazil',
    alpha2: 'BR',
    alpha3: 'BRA',
    flagURL: new URL('../../resources/flags/BRA.png', import.meta.url).href
  },
  {
    id: '086',
    label: 'British Indian Ocean Territory',
    alpha2: 'IO',
    alpha3: 'IOT',
    flagURL: new URL('../../resources/flags/IOT.png', import.meta.url).href
  },
  {
    id: '096',
    label: 'Brunei Darussalam',
    alpha2: 'BN',
    alpha3: 'BRN',
    flagURL: new URL('../../resources/flags/BRN.png', import.meta.url).href
  },
  {
    id: '100',
    label: 'Bulgaria',
    alpha2: 'BG',
    alpha3: 'BGR',
    flagURL: new URL('../../resources/flags/BGR.png', import.meta.url).href
  },
  {
    id: '854',
    label: 'Burkina Faso',
    alpha2: 'BF',
    alpha3: 'BFA',
    flagURL: new URL('../../resources/flags/BFA.png', import.meta.url).href
  },
  {
    id: '108',
    label: 'Burundi',
    alpha2: 'BI',
    alpha3: 'BDI',
    flagURL: new URL('../../resources/flags/BDI.png', import.meta.url).href
  },
  {
    id: '132',
    label: 'Cape Verde',
    alpha2: 'CV',
    alpha3: 'CPV',
    flagURL: new URL('../../resources/flags/CPV.png', import.meta.url).href
  },
  {
    id: '116',
    label: 'Cambodia',
    alpha2: 'KH',
    alpha3: 'KHM',
    flagURL: new URL('../../resources/flags/KHM.png', import.meta.url).href
  },
  {
    id: '120',
    label: 'Cameroon',
    alpha2: 'CM',
    alpha3: 'CMR',
    flagURL: new URL('../../resources/flags/CMR.png', import.meta.url).href
  },
  {
    id: '124',
    label: 'Canada',
    alpha2: 'CA',
    alpha3: 'CAN',
    flagURL: new URL('../../resources/flags/CAN.png', import.meta.url).href
  },
  {
    id: '136',
    label: 'Cayman Islands',
    alpha2: 'KY',
    alpha3: 'CYM',
    flagURL: new URL('../../resources/flags/CYM.png', import.meta.url).href
  },
  {
    id: '140',
    label: 'Central African Republic',
    alpha2: 'CF',
    alpha3: 'CAF',
    flagURL: new URL('../../resources/flags/CAF.png', import.meta.url).href
  },
  {
    id: '148',
    label: 'Chad',
    alpha2: 'TD',
    alpha3: 'TCD',
    flagURL: new URL('../../resources/flags/TCD.png', import.meta.url).href
  },
  {
    id: '152',
    label: 'Chile',
    alpha2: 'CL',
    alpha3: 'CHL',
    flagURL: new URL('../../resources/flags/CHL.png', import.meta.url).href
  },
  {
    id: '156',
    label: 'China',
    alias: 'Republic of China',
    alpha2: 'CN',
    alpha3: 'CHN',
    flagURL: new URL('../../resources/flags/CHN.png', import.meta.url).href
  },
  {
    id: '162',
    label: 'Christmas Island',
    alpha2: 'CX',
    alpha3: 'CXR',
    flagURL: new URL('../../resources/flags/CXR.png', import.meta.url).href
  },
  {
    id: '166',
    label: 'Cocos (Keeling) Islands',
    alpha2: 'CC',
    alpha3: 'CCK',
    flagURL: new URL('../../resources/flags/CCK.png', import.meta.url).href
  },
  {
    id: '170',
    label: 'Colombia',
    alpha2: 'CO',
    alpha3: 'COL',
    flagURL: new URL('../../resources/flags/COL.png', import.meta.url).href
  },
  {
    id: '174',
    label: 'Comoros',
    alpha2: 'KM',
    alpha3: 'COM',
    flagURL: new URL('../../resources/flags/COM.png', import.meta.url).href
  },
  {
    id: '180',
    label: 'Congo (the Democratic Republic of the)',
    alpha2: 'CD',
    alpha3: 'COD',
    flagURL: new URL('../../resources/flags/COD.png', import.meta.url).href
  },
  {
    id: '178',
    label: 'Congo',
    alpha2: 'CG',
    alpha3: 'COG',
    flagURL: new URL('../../resources/flags/COG.png', import.meta.url).href
  },
  {
    id: '184',
    label: 'Cook Islands',
    alpha2: 'CK',
    alpha3: 'COK',
    flagURL: new URL('../../resources/flags/COK.png', import.meta.url).href
  },
  {
    id: '188',
    label: 'Costa Rica',
    alpha2: 'CR',
    alpha3: 'CRI',
    flagURL: new URL('../../resources/flags/CRI.png', import.meta.url).href
  },
  {
    id: '191',
    label: 'Croatia',
    alpha2: 'HR',
    alpha3: 'HRV',
    flagURL: new URL('../../resources/flags/HRV.png', import.meta.url).href
  },
  {
    id: '192',
    label: 'Cuba',
    alpha2: 'CU',
    alpha3: 'CUB',
    flagURL: new URL('../../resources/flags/CUB.png', import.meta.url).href
  },
  {
    id: '531',
    label: 'Curaçao',
    alpha2: 'CW',
    alpha3: 'CUW',
    flagURL: new URL('../../resources/flags/CUW.png', import.meta.url).href
  },
  {
    id: '196',
    label: 'Cyprus',
    alpha2: 'CY',
    alpha3: 'CYP',
    flagURL: new URL('../../resources/flags/CYP.png', import.meta.url).href
  },
  {
    id: '203',
    label: 'Czech Republic',
    alpha2: 'CZ',
    alpha3: 'CZE',
    flagURL: new URL('../../resources/flags/CZE.png', import.meta.url).href
  },
  {
    id: '384',
    label: 'Ivory Coast',
    alpha2: 'CI',
    alpha3: 'CIV',
    flagURL: new URL('../../resources/flags/CIV.png', import.meta.url).href
  },
  {
    id: '208',
    label: 'Denmark',
    alpha2: 'DK',
    alpha3: 'DNK',
    flagURL: new URL('../../resources/flags/DNK.png', import.meta.url).href
  },
  {
    id: '262',
    label: 'Djibouti',
    alpha2: 'DJ',
    alpha3: 'DJI',
    flagURL: new URL('../../resources/flags/DJI.png', import.meta.url).href
  },
  {
    id: '212',
    label: 'Dominica',
    alpha2: 'DM',
    alpha3: 'DMA',
    flagURL: new URL('../../resources/flags/DMA.png', import.meta.url).href
  },
  {
    id: '214',
    label: 'Dominican Republic',
    alpha2: 'DO',
    alpha3: 'DOM',
    flagURL: new URL('../../resources/flags/DOM.png', import.meta.url).href
  },
  {
    id: '218',
    label: 'Ecuador',
    alpha2: 'EC',
    alpha3: 'ECU',
    flagURL: new URL('../../resources/flags/ECU.png', import.meta.url).href
  },
  {
    id: '818',
    label: 'Egypt',
    alpha2: 'EG',
    alpha3: 'EGY',
    flagURL: new URL('../../resources/flags/EGY.png', import.meta.url).href
  },
  {
    id: '222',
    label: 'El Salvador',
    alpha2: 'SV',
    alpha3: 'SLV',
    flagURL: new URL('../../resources/flags/SLV.png', import.meta.url).href
  },
  {
    id: '226',
    label: 'Equatorial Guinea',
    alpha2: 'GQ',
    alpha3: 'GNQ',
    flagURL: new URL('../../resources/flags/GNQ.png', import.meta.url).href
  },
  {
    id: '232',
    label: 'Eritrea',
    alpha2: 'ER',
    alpha3: 'ERI',
    flagURL: new URL('../../resources/flags/ERI.png', import.meta.url).href
  },
  {
    id: '233',
    label: 'Estonia',
    alpha2: 'EE',
    alpha3: 'EST',
    flagURL: new URL('../../resources/flags/EST.png', import.meta.url).href
  },
  {
    id: '748',
    label: 'Eswatini',
    alpha2: 'SZ',
    alpha3: 'SWZ',
    flagURL: new URL('../../resources/flags/SWZ.png', import.meta.url).href
  },
  {
    id: '231',
    label: 'Ethiopia',
    alpha2: 'ET',
    alpha3: 'ETH',
    flagURL: new URL('../../resources/flags/ETH.png', import.meta.url).href
  },
  {
    id: '238',
    label: 'Falkland Islands [Malvinas]',
    alpha2: 'FK',
    alpha3: 'FLK',
    flagURL: new URL('../../resources/flags/FLK.png', import.meta.url).href
  },
  {
    id: '234',
    label: 'Faroe Islands',
    alpha2: 'FO',
    alpha3: 'FRO',
    flagURL: new URL('../../resources/flags/FRO.png', import.meta.url).href
  },
  {
    id: '242',
    label: 'Fiji',
    alpha2: 'FJ',
    alpha3: 'FJI',
    flagURL: new URL('../../resources/flags/FJI.png', import.meta.url).href
  },
  {
    id: '246',
    label: 'Finland',
    alpha2: 'FI',
    alpha3: 'FIN',
    flagURL: new URL('../../resources/flags/FIN.png', import.meta.url).href
  },
  {
    id: '250',
    label: 'France',
    alpha2: 'FR',
    alpha3: 'FRA',
    flagURL: new URL('../../resources/flags/FRA.png', import.meta.url).href
  },
  {
    id: '254',
    label: 'French Guiana',
    alpha2: 'GF',
    alpha3: 'GUF',
    flagURL: new URL('../../resources/flags/GUF.png', import.meta.url).href
  },
  {
    id: '258',
    label: 'French Polynesia',
    alpha2: 'PF',
    alpha3: 'PYF',
    flagURL: new URL('../../resources/flags/PYF.png', import.meta.url).href
  },
  {
    id: '260',
    label: 'French Southern Territories',
    alpha2: 'TF',
    alpha3: 'ATF',
    flagURL: new URL('../../resources/flags/ATF.png', import.meta.url).href
  },
  {
    id: '266',
    label: 'Gabon',
    alpha2: 'GA',
    alpha3: 'GAB',
    flagURL: new URL('../../resources/flags/GAB.png', import.meta.url).href
  },
  {
    id: '270',
    label: 'Gambia',
    alpha2: 'GM',
    alpha3: 'GMB',
    flagURL: new URL('../../resources/flags/GMB.png', import.meta.url).href
  },
  {
    id: '268',
    label: 'Georgia',
    alpha2: 'GE',
    alpha3: 'GEO',
    flagURL: new URL('../../resources/flags/GEO.png', import.meta.url).href
  },
  {
    id: '276',
    label: 'Germany',
    alpha2: 'DE',
    alpha3: 'DEU',
    flagURL: new URL('../../resources/flags/DEU.png', import.meta.url).href
  },
  {
    id: '288',
    label: 'Ghana',
    alpha2: 'GH',
    alpha3: 'GHA',
    flagURL: new URL('../../resources/flags/GHA.png', import.meta.url).href
  },
  {
    id: '292',
    label: 'Gibraltar',
    alpha2: 'GI',
    alpha3: 'GIB',
    flagURL: new URL('../../resources/flags/GIB.png', import.meta.url).href
  },
  {
    id: '300',
    label: 'Greece',
    alpha2: 'GR',
    alpha3: 'GRC',
    flagURL: new URL('../../resources/flags/GRC.png', import.meta.url).href
  },
  {
    id: '304',
    label: 'Greenland',
    alpha2: 'GL',
    alpha3: 'GRL',
    flagURL: new URL('../../resources/flags/GRL.png', import.meta.url).href
  },
  {
    id: '308',
    label: 'Grenada',
    alpha2: 'GD',
    alpha3: 'GRD',
    flagURL: new URL('../../resources/flags/GRD.png', import.meta.url).href
  },
  {
    id: '312',
    label: 'Guadeloupe',
    alpha2: 'GP',
    alpha3: 'GLP',
    flagURL: new URL('../../resources/flags/GLP.png', import.meta.url).href
  },
  {
    id: '316',
    label: 'Guam',
    alpha2: 'GU',
    alpha3: 'GUM',
    flagURL: new URL('../../resources/flags/GUM.png', import.meta.url).href
  },
  {
    id: '320',
    label: 'Guatemala',
    alpha2: 'GT',
    alpha3: 'GTM',
    flagURL: new URL('../../resources/flags/GTM.png', import.meta.url).href
  },
  {
    id: '831',
    label: 'Guernsey',
    alpha2: 'GG',
    alpha3: 'GGY',
    flagURL: new URL('../../resources/flags/GGY.png', import.meta.url).href
  },
  {
    id: '324',
    label: 'Guinea',
    alpha2: 'GN',
    alpha3: 'GIN',
    flagURL: new URL('../../resources/flags/GIN.png', import.meta.url).href
  },
  {
    id: '624',
    label: 'Guinea-Bissau',
    alpha2: 'GW',
    alpha3: 'GNB',
    flagURL: new URL('../../resources/flags/GNB.png', import.meta.url).href
  },
  {
    id: '328',
    label: 'Guyana',
    alpha2: 'GY',
    alpha3: 'GUY',
    flagURL: new URL('../../resources/flags/GUY.png', import.meta.url).href
  },
  {
    id: '332',
    label: 'Haiti',
    alpha2: 'HT',
    alpha3: 'HTI',
    flagURL: new URL('../../resources/flags/HTI.png', import.meta.url).href
  },
  {
    id: '334',
    label: 'Heard Island and McDonald Islands',
    alpha2: 'HM',
    alpha3: 'HMD',
    flagURL: new URL('../../resources/flags/HMD.png', import.meta.url).href
  },
  {
    id: '336',
    label: 'Holy See',
    alpha2: 'VA',
    alpha3: 'VAT',
    flagURL: new URL('../../resources/flags/VAT.png', import.meta.url).href
  },
  {
    id: '340',
    label: 'Honduras',
    alpha2: 'HN',
    alpha3: 'HND',
    flagURL: new URL('../../resources/flags/HND.png', import.meta.url).href
  },
  {
    id: '344',
    label: 'Hong Kong',
    alpha2: 'HK',
    alpha3: 'HKG',
    flagURL: new URL('../../resources/flags/HKG.png', import.meta.url).href
  },
  {
    id: '348',
    label: 'Hungary',
    alpha2: 'HU',
    alpha3: 'HUN',
    flagURL: new URL('../../resources/flags/HUN.png', import.meta.url).href
  },
  {
    id: '352',
    label: 'Iceland',
    alpha2: 'IS',
    alpha3: 'ISL',
    flagURL: new URL('../../resources/flags/ISL.png', import.meta.url).href
  },
  {
    id: '356',
    label: 'India',
    alpha2: 'IN',
    alpha3: 'IND',
    flagURL: new URL('../../resources/flags/IND.png', import.meta.url).href
  },
  {
    id: '360',
    label: 'Indonesia',
    alpha2: 'ID',
    alpha3: 'IDN',
    flagURL: new URL('../../resources/flags/IDN.png', import.meta.url).href
  },
  {
    id: '364',
    label: 'Iran (Islamic Republic of)',
    alpha2: 'IR',
    alpha3: 'IRN',
    flagURL: new URL('../../resources/flags/IRN.png', import.meta.url).href
  },
  {
    id: '368',
    label: 'Iraq',
    alpha2: 'IQ',
    alpha3: 'IRQ',
    flagURL: new URL('../../resources/flags/IRQ.png', import.meta.url).href
  },
  {
    id: '372',
    label: 'Ireland',
    alpha2: 'IE',
    alpha3: 'IRL',
    flagURL: new URL('../../resources/flags/IRL.png', import.meta.url).href
  },
  {
    id: '833',
    label: 'Isle of Man',
    alpha2: 'IM',
    alpha3: 'IMN',
    flagURL: new URL('../../resources/flags/IMN.png', import.meta.url).href
  },
  {
    id: '376',
    label: 'Israel',
    alpha2: 'IL',
    alpha3: 'ISR',
    flagURL: new URL('../../resources/flags/ISR.png', import.meta.url).href
  },
  {
    id: '380',
    label: 'Italy',
    alpha2: 'IT',
    alpha3: 'ITA',
    flagURL: new URL('../../resources/flags/ITA.png', import.meta.url).href
  },
  {
    id: '388',
    label: 'Jamaica',
    alpha2: 'JM',
    alpha3: 'JAM',
    flagURL: new URL('../../resources/flags/JAM.png', import.meta.url).href
  },
  {
    id: '392',
    label: 'Japan',
    alpha2: 'JP',
    alpha3: 'JPN',
    flagURL: new URL('../../resources/flags/JPN.png', import.meta.url).href
  },
  {
    id: '832',
    label: 'Jersey',
    alpha2: 'JE',
    alpha3: 'JEY',
    flagURL: new URL('../../resources/flags/JEY.png', import.meta.url).href
  },
  {
    id: '400',
    label: 'Jordan',
    alpha2: 'JO',
    alpha3: 'JOR',
    flagURL: new URL('../../resources/flags/JOR.png', import.meta.url).href
  },
  {
    id: '398',
    label: 'Kazakhstan',
    alpha2: 'KZ',
    alpha3: 'KAZ',
    flagURL: new URL('../../resources/flags/KAZ.png', import.meta.url).href
  },
  {
    id: '404',
    label: 'Kenya',
    alpha2: 'KE',
    alpha3: 'KEN',
    flagURL: new URL('../../resources/flags/KEN.png', import.meta.url).href
  },
  {
    id: '296',
    label: 'Kiribati',
    alpha2: 'KI',
    alpha3: 'KIR',
    flagURL: new URL('../../resources/flags/KIR.png', import.meta.url).href
  },
  {
    id: '408',
    label: 'North Korea',
    alpha2: 'KP',
    alpha3: 'PRK',
    flagURL: new URL('../../resources/flags/PRK.png', import.meta.url).href
  },
  {
    id: '410',
    label: 'South Korea',
    alpha2: 'KR',
    alpha3: 'KOR',
    flagURL: new URL('../../resources/flags/KOR.png', import.meta.url).href
  },
  {
    id: '414',
    label: 'Kuwait',
    alpha2: 'KW',
    alpha3: 'KWT',
    flagURL: new URL('../../resources/flags/KWT.png', import.meta.url).href
  },
  {
    id: '417',
    label: 'Kyrgyzstan',
    alpha2: 'KG',
    alpha3: 'KGZ',
    flagURL: new URL('../../resources/flags/KGZ.png', import.meta.url).href
  },
  {
    id: '418',
    label: 'Laos',
    alpha2: 'LA',
    alpha3: 'LAO',
    flagURL: new URL('../../resources/flags/LAO.png', import.meta.url).href
  },
  {
    id: '428',
    label: 'Latvia',
    alpha2: 'LV',
    alpha3: 'LVA',
    flagURL: new URL('../../resources/flags/LVA.png', import.meta.url).href
  },
  {
    id: '422',
    label: 'Lebanon',
    alpha2: 'LB',
    alpha3: 'LBN',
    flagURL: new URL('../../resources/flags/LBN.png', import.meta.url).href
  },
  {
    id: '426',
    label: 'Lesotho',
    alpha2: 'LS',
    alpha3: 'LSO',
    flagURL: new URL('../../resources/flags/LSO.png', import.meta.url).href
  },
  {
    id: '430',
    label: 'Liberia',
    alpha2: 'LR',
    alpha3: 'LBR',
    flagURL: new URL('../../resources/flags/LBR.png', import.meta.url).href
  },
  {
    id: '434',
    label: 'Libya',
    alpha2: 'LY',
    alpha3: 'LBY',
    flagURL: new URL('../../resources/flags/LBY.png', import.meta.url).href
  },
  {
    id: '438',
    label: 'Liechtenstein',
    alpha2: 'LI',
    alpha3: 'LIE',
    flagURL: new URL('../../resources/flags/LIE.png', import.meta.url).href
  },
  {
    id: '440',
    label: 'Lithuania',
    alpha2: 'LT',
    alpha3: 'LTU',
    flagURL: new URL('../../resources/flags/LTU.png', import.meta.url).href
  },
  {
    id: '442',
    label: 'Luxembourg',
    alpha2: 'LU',
    alpha3: 'LUX',
    flagURL: new URL('../../resources/flags/LUX.png', import.meta.url).href
  },
  {
    id: '446',
    label: 'Macao',
    alpha2: 'MO',
    alpha3: 'MAC',
    flagURL: new URL('../../resources/flags/MAC.png', import.meta.url).href
  },
  {
    id: '450',
    label: 'Madagascar',
    alpha2: 'MG',
    alpha3: 'MDG',
    flagURL: new URL('../../resources/flags/MDG.png', import.meta.url).href
  },
  {
    id: '454',
    label: 'Malawi',
    alpha2: 'MW',
    alpha3: 'MWI',
    flagURL: new URL('../../resources/flags/MWI.png', import.meta.url).href
  },
  {
    id: '458',
    label: 'Malaysia',
    alpha2: 'MY',
    alpha3: 'MYS',
    flagURL: new URL('../../resources/flags/MYS.png', import.meta.url).href
  },
  {
    id: '462',
    label: 'Maldives',
    alpha2: 'MV',
    alpha3: 'MDV',
    flagURL: new URL('../../resources/flags/MDV.png', import.meta.url).href
  },
  {
    id: '466',
    label: 'Mali',
    alpha2: 'ML',
    alpha3: 'MLI',
    flagURL: new URL('../../resources/flags/MLI.png', import.meta.url).href
  },
  {
    id: '470',
    label: 'Malta',
    alpha2: 'MT',
    alpha3: 'MLT',
    flagURL: new URL('../../resources/flags/MLT.png', import.meta.url).href
  },
  {
    id: '584',
    label: 'Marshall Islands',
    alpha2: 'MH',
    alpha3: 'MHL',
    flagURL: new URL('../../resources/flags/MHL.png', import.meta.url).href
  },
  {
    id: '474',
    label: 'Martinique',
    alpha2: 'MQ',
    alpha3: 'MTQ',
    flagURL: new URL('../../resources/flags/MTQ.png', import.meta.url).href
  },
  {
    id: '478',
    label: 'Mauritania',
    alpha2: 'MR',
    alpha3: 'MRT',
    flagURL: new URL('../../resources/flags/MRT.png', import.meta.url).href
  },
  {
    id: '480',
    label: 'Mauritius',
    alpha2: 'MU',
    alpha3: 'MUS',
    flagURL: new URL('../../resources/flags/MUS.png', import.meta.url).href
  },
  {
    id: '175',
    label: 'Mayotte',
    alpha2: 'YT',
    alpha3: 'MYT',
    flagURL: new URL('../../resources/flags/MYT.png', import.meta.url).href
  },
  {
    id: '484',
    label: 'Mexico',
    alpha2: 'MX',
    alpha3: 'MEX',
    flagURL: new URL('../../resources/flags/MEX.png', import.meta.url).href
  },
  {
    id: '583',
    label: 'Micronesia (Federated States of)',
    alpha2: 'FM',
    alpha3: 'FSM',
    flagURL: new URL('../../resources/flags/FSM.png', import.meta.url).href
  },
  {
    id: '498',
    label: 'Moldova (the Republic of)',
    alpha2: 'MD',
    alpha3: 'MDA',
    flagURL: new URL('../../resources/flags/MDA.png', import.meta.url).href
  },
  {
    id: '492',
    label: 'Monaco',
    alpha2: 'MC',
    alpha3: 'MCO',
    flagURL: new URL('../../resources/flags/MCO.png', import.meta.url).href
  },
  {
    id: '496',
    label: 'Mongolia',
    alpha2: 'MN',
    alpha3: 'MNG',
    flagURL: new URL('../../resources/flags/MNG.png', import.meta.url).href
  },
  {
    id: '499',
    label: 'Montenegro',
    alpha2: 'ME',
    alpha3: 'MNE',
    flagURL: new URL('../../resources/flags/MNE.png', import.meta.url).href
  },
  {
    id: '500',
    label: 'Montserrat',
    alpha2: 'MS',
    alpha3: 'MSR',
    flagURL: new URL('../../resources/flags/MSR.png', import.meta.url).href
  },
  {
    id: '504',
    label: 'Morocco',
    alpha2: 'MA',
    alpha3: 'MAR',
    flagURL: new URL('../../resources/flags/MAR.png', import.meta.url).href
  },
  {
    id: '508',
    label: 'Mozambique',
    alpha2: 'MZ',
    alpha3: 'MOZ',
    flagURL: new URL('../../resources/flags/MOZ.png', import.meta.url).href
  },
  {
    id: '104',
    label: 'Myanmar',
    alpha2: 'MM',
    alpha3: 'MMR',
    flagURL: new URL('../../resources/flags/MMR.png', import.meta.url).href
  },
  {
    id: '516',
    label: 'Namibia',
    alpha2: 'NA',
    alpha3: 'NAM',
    flagURL: new URL('../../resources/flags/NAM.png', import.meta.url).href
  },
  {
    id: '520',
    label: 'Nauru',
    alpha2: 'NR',
    alpha3: 'NRU',
    flagURL: new URL('../../resources/flags/NRU.png', import.meta.url).href
  },
  {
    id: '524',
    label: 'Nepal',
    alpha2: 'NP',
    alpha3: 'NPL',
    flagURL: new URL('../../resources/flags/NPL.png', import.meta.url).href
  },
  {
    id: '528',
    label: 'Netherlands',
    alpha2: 'NL',
    alpha3: 'NLD',
    flagURL: new URL('../../resources/flags/NLD.png', import.meta.url).href
  },
  {
    id: '540',
    label: 'New Caledonia',
    alpha2: 'NC',
    alpha3: 'NCL',
    flagURL: new URL('../../resources/flags/NCL.png', import.meta.url).href
  },
  {
    id: '554',
    label: 'New Zealand',
    alpha2: 'NZ',
    alpha3: 'NZL',
    flagURL: new URL('../../resources/flags/NZL.png', import.meta.url).href
  },
  {
    id: '558',
    label: 'Nicaragua',
    alpha2: 'NI',
    alpha3: 'NIC',
    flagURL: new URL('../../resources/flags/NIC.png', import.meta.url).href
  },
  {
    id: '562',
    label: 'Niger',
    alpha2: 'NE',
    alpha3: 'NER',
    flagURL: new URL('../../resources/flags/NER.png', import.meta.url).href
  },
  {
    id: '566',
    label: 'Nigeria',
    alpha2: 'NG',
    alpha3: 'NGA',
    flagURL: new URL('../../resources/flags/NGA.png', import.meta.url).href
  },
  {
    id: '570',
    label: 'Niue',
    alpha2: 'NU',
    alpha3: 'NIU',
    flagURL: new URL('../../resources/flags/NIU.png', import.meta.url).href
  },
  {
    id: '574',
    label: 'Norfolk Island',
    alpha2: 'NF',
    alpha3: 'NFK',
    flagURL: new URL('../../resources/flags/NFK.png', import.meta.url).href
  },
  {
    id: '580',
    label: 'Northern Mariana Islands',
    alpha2: 'MP',
    alpha3: 'MNP',
    flagURL: new URL('../../resources/flags/MNP.png', import.meta.url).href
  },
  {
    id: '578',
    label: 'Norway',
    alpha2: 'NO',
    alpha3: 'NOR',
    flagURL: new URL('../../resources/flags/NOR.png', import.meta.url).href
  },
  {
    id: '512',
    label: 'Oman',
    alpha2: 'OM',
    alpha3: 'OMN',
    flagURL: new URL('../../resources/flags/OMN.png', import.meta.url).href
  },
  {
    id: '586',
    label: 'Pakistan',
    alpha2: 'PK',
    alpha3: 'PAK',
    flagURL: new URL('../../resources/flags/PAK.png', import.meta.url).href
  },
  {
    id: '585',
    label: 'Palau',
    alpha2: 'PW',
    alpha3: 'PLW',
    flagURL: new URL('../../resources/flags/PLW.png', import.meta.url).href
  },
  {
    id: '275',
    label: 'Palestine, State of',
    alias: 'Palestinian Territory',
    alpha2: 'PS',
    alpha3: 'PSE',
    flagURL: new URL('../../resources/flags/PSE.png', import.meta.url).href
  },
  {
    id: '591',
    label: 'Panama',
    alpha2: 'PA',
    alpha3: 'PAN',
    flagURL: new URL('../../resources/flags/PAN.png', import.meta.url).href
  },
  {
    id: '598',
    label: 'Papua New Guinea',
    alpha2: 'PG',
    alpha3: 'PNG',
    flagURL: new URL('../../resources/flags/PNG.png', import.meta.url).href
  },
  {
    id: '600',
    label: 'Paraguay',
    alpha2: 'PY',
    alpha3: 'PRY',
    flagURL: new URL('../../resources/flags/PRY.png', import.meta.url).href
  },
  {
    id: '604',
    label: 'Peru',
    alpha2: 'PE',
    alpha3: 'PER',
    flagURL: new URL('../../resources/flags/PER.png', import.meta.url).href
  },
  {
    id: '608',
    label: 'Philippines',
    alpha2: 'PH',
    alpha3: 'PHL',
    flagURL: new URL('../../resources/flags/PHL.png', import.meta.url).href
  },
  {
    id: '612',
    label: 'Pitcairn',
    alias: 'Pitcairn Islands',
    alpha2: 'PN',
    alpha3: 'PCN',
    flagURL: new URL('../../resources/flags/PCN.png', import.meta.url).href
  },
  {
    id: '616',
    label: 'Poland',
    alpha2: 'PL',
    alpha3: 'POL',
    flagURL: new URL('../../resources/flags/POL.png', import.meta.url).href
  },
  {
    id: '620',
    label: 'Portugal',
    alpha2: 'PT',
    alpha3: 'PRT',
    flagURL: new URL('../../resources/flags/PRT.png', import.meta.url).href
  },
  {
    id: '630',
    label: 'Puerto Rico',
    alpha2: 'PR',
    alpha3: 'PRI',
    flagURL: new URL('../../resources/flags/PRI.png', import.meta.url).href
  },
  {
    id: '634',
    label: 'Qatar',
    alpha2: 'QA',
    alpha3: 'QAT',
    flagURL: new URL('../../resources/flags/QAT.png', import.meta.url).href
  },
  {
    id: '807',
    label: 'Republic of North Macedonia',
    alpha2: 'MK',
    alpha3: 'MKD',
    flagURL: new URL('../../resources/flags/MKD.png', import.meta.url).href
  },
  {
    id: '642',
    label: 'Romania',
    alpha2: 'RO',
    alpha3: 'ROU',
    flagURL: new URL('../../resources/flags/ROU.png', import.meta.url).href
  },
  {
    id: '643',
    label: 'Russian Federation',
    alpha2: 'RU',
    alpha3: 'RUS',
    flagURL: new URL('../../resources/flags/RUS.png', import.meta.url).href
  },
  {
    id: '646',
    label: 'Rwanda',
    alpha2: 'RW',
    alpha3: 'RWA',
    flagURL: new URL('../../resources/flags/RWA.png', import.meta.url).href
  },
  {
    id: '638',
    label: 'Réunion',
    alpha2: 'RE',
    alpha3: 'REU',
    flagURL: new URL('../../resources/flags/REU.png', import.meta.url).href
  },
  {
    id: '652',
    label: 'Saint Barthélemy',
    alpha2: 'BL',
    alpha3: 'BLM',
    flagURL: new URL('../../resources/flags/BLM.png', import.meta.url).href
  },
  {
    id: '654',
    label: 'Saint Helena, Ascension and Tristan da Cunha',
    alpha2: 'SH',
    alpha3: 'SHN',
    flagURL: new URL('../../resources/flags/SHN.png', import.meta.url).href
  },
  {
    id: '659',
    label: 'Saint Kitts and Nevis',
    alpha2: 'KN',
    alpha3: 'KNA',
    flagURL: new URL('../../resources/flags/KNA.png', import.meta.url).href
  },
  {
    id: '662',
    label: 'Saint Lucia',
    alpha2: 'LC',
    alpha3: 'LCA',
    flagURL: new URL('../../resources/flags/LCA.png', import.meta.url).href
  },
  {
    id: '663',
    label: 'Saint Martin (French part)',
    alpha2: 'MF',
    alpha3: 'MAF',
    flagURL: new URL('../../resources/flags/MAF.png', import.meta.url).href
  },
  {
    id: '666',
    label: 'Saint Pierre and Miquelon',
    alpha2: 'PM',
    alpha3: 'SPM',
    flagURL: new URL('../../resources/flags/SPM.png', import.meta.url).href
  },
  {
    id: '670',
    label: 'Saint Vincent and the Grenadines',
    alpha2: 'VC',
    alpha3: 'VCT',
    flagURL: new URL('../../resources/flags/VCT.png', import.meta.url).href
  },
  {
    id: '882',
    label: 'Samoa',
    alpha2: 'WS',
    alpha3: 'WSM',
    flagURL: new URL('../../resources/flags/WSM.png', import.meta.url).href
  },
  {
    id: '674',
    label: 'San Marino',
    alpha2: 'SM',
    alpha3: 'SMR',
    flagURL: new URL('../../resources/flags/SMR.png', import.meta.url).href
  },
  {
    id: '678',
    label: 'Sao Tome and Principe',
    alpha2: 'ST',
    alpha3: 'STP',
    flagURL: new URL('../../resources/flags/STP.png', import.meta.url).href
  },
  {
    id: '682',
    label: 'Saudi Arabia',
    alpha2: 'SA',
    alpha3: 'SAU',
    flagURL: new URL('../../resources/flags/SAU.png', import.meta.url).href
  },
  {
    id: '686',
    label: 'Senegal',
    alpha2: 'SN',
    alpha3: 'SEN',
    flagURL: new URL('../../resources/flags/SEN.png', import.meta.url).href
  },
  {
    id: '688',
    label: 'Serbia',
    alpha2: 'RS',
    alpha3: 'SRB',
    flagURL: new URL('../../resources/flags/SRB.png', import.meta.url).href
  },
  {
    id: '690',
    label: 'Seychelles',
    alpha2: 'SC',
    alpha3: 'SYC',
    flagURL: new URL('../../resources/flags/SYC.png', import.meta.url).href
  },
  {
    id: '694',
    label: 'Sierra Leone',
    alpha2: 'SL',
    alpha3: 'SLE',
    flagURL: new URL('../../resources/flags/SLE.png', import.meta.url).href
  },
  {
    id: '702',
    label: 'Singapore',
    alpha2: 'SG',
    alpha3: 'SGP',
    flagURL: new URL('../../resources/flags/SGP.png', import.meta.url).href
  },
  {
    id: '534',
    label: 'Sint Maarten (Dutch part)',
    alpha2: 'SX',
    alpha3: 'SXM',
    flagURL: new URL('../../resources/flags/SXM.png', import.meta.url).href
  },
  {
    id: '703',
    label: 'Slovakia',
    alpha2: 'SK',
    alpha3: 'SVK',
    flagURL: new URL('../../resources/flags/SVK.png', import.meta.url).href
  },
  {
    id: '705',
    label: 'Slovenia',
    alpha2: 'SI',
    alpha3: 'SVN',
    flagURL: new URL('../../resources/flags/SVN.png', import.meta.url).href
  },
  {
    id: '090',
    label: 'Solomon Islands',
    alpha2: 'SB',
    alpha3: 'SLB',
    flagURL: new URL('../../resources/flags/SLB.png', import.meta.url).href
  },
  {
    id: '706',
    label: 'Somalia',
    alpha2: 'SO',
    alpha3: 'SOM',
    flagURL: new URL('../../resources/flags/SOM.png', import.meta.url).href
  },
  {
    id: '710',
    label: 'South Africa',
    alpha2: 'ZA',
    alpha3: 'ZAF',
    flagURL: new URL('../../resources/flags/ZAF.png', import.meta.url).href
  },
  {
    id: '239',
    label: 'South Georgia and the South Sandwich Islands',
    alpha2: 'GS',
    alpha3: 'SGS',
    flagURL: new URL('../../resources/flags/SGS.png', import.meta.url).href
  },
  {
    id: '728',
    label: 'South Sudan',
    alpha2: 'SS',
    alpha3: 'SSD',
    flagURL: new URL('../../resources/flags/SSD.png', import.meta.url).href
  },
  {
    id: '724',
    label: 'Spain',
    alpha2: 'ES',
    alpha3: 'ESP',
    flagURL: new URL('../../resources/flags/ESP.png', import.meta.url).href
  },
  {
    id: '144',
    label: 'Sri Lanka',
    alpha2: 'LK',
    alpha3: 'LKA',
    flagURL: new URL('../../resources/flags/LKA.png', import.meta.url).href
  },
  {
    id: '729',
    label: 'Sudan',
    alpha2: 'SD',
    alpha3: 'SDN',
    flagURL: new URL('../../resources/flags/SDN.png', import.meta.url).href
  },
  {
    id: '740',
    label: 'Suriname',
    alpha2: 'SR',
    alpha3: 'SUR',
    flagURL: new URL('../../resources/flags/SUR.png', import.meta.url).href
  },
  {
    id: '744',
    label: 'Svalbard and Jan Mayen',
    alpha2: 'SJ',
    alpha3: 'SJM',
    flagURL: new URL('../../resources/flags/SJM.png', import.meta.url).href
  },
  {
    id: '752',
    label: 'Sweden',
    alpha2: 'SE',
    alpha3: 'SWE',
    flagURL: new URL('../../resources/flags/SWE.png', import.meta.url).href
  },
  {
    id: '756',
    label: 'Switzerland',
    alpha2: 'CH',
    alpha3: 'CHE',
    flagURL: new URL('../../resources/flags/CHE.png', import.meta.url).href
  },
  {
    id: '760',
    label: 'Syrian Arab Republic',
    alpha2: 'SY',
    alpha3: 'SYR',
    flagURL: new URL('../../resources/flags/SYR.png', import.meta.url).href
  },
  {
    id: '158',
    label: 'Taiwan',
    alpha2: 'TW',
    alpha3: 'TWN',
    flagURL: new URL('../../resources/flags/TWN.png', import.meta.url).href
  },
  {
    id: '762',
    label: 'Tajikistan',
    alpha2: 'TJ',
    alpha3: 'TJK',
    flagURL: new URL('../../resources/flags/TJK.png', import.meta.url).href
  },
  {
    id: '834',
    label: 'Tanzania, United Republic of',
    alpha2: 'TZ',
    alpha3: 'TZA',
    flagURL: new URL('../../resources/flags/TZA.png', import.meta.url).href
  },
  {
    id: '764',
    label: 'Thailand',
    alpha2: 'TH',
    alpha3: 'THA',
    flagURL: new URL('../../resources/flags/THA.png', import.meta.url).href
  },
  {
    id: '626',
    label: 'Timor-Leste',
    alias: 'East Timor',
    alpha2: 'TL',
    alpha3: 'TLS',
    flagURL: new URL('../../resources/flags/TLS.png', import.meta.url).href
  },
  {
    id: '768',
    label: 'Togo',
    alpha2: 'TG',
    alpha3: 'TGO',
    flagURL: new URL('../../resources/flags/TGO.png', import.meta.url).href
  },
  {
    id: '772',
    label: 'Tokelau',
    alpha2: 'TK',
    alpha3: 'TKL',
    flagURL: new URL('../../resources/flags/TKL.png', import.meta.url).href
  },
  {
    id: '776',
    label: 'Tonga',
    alpha2: 'TO',
    alpha3: 'TON',
    flagURL: new URL('../../resources/flags/TON.png', import.meta.url).href
  },
  {
    id: '780',
    label: 'Trinidad and Tobago',
    alpha2: 'TT',
    alpha3: 'TTO',
    flagURL: new URL('../../resources/flags/TTO.png', import.meta.url).href
  },
  {
    id: '788',
    label: 'Tunisia',
    alpha2: 'TN',
    alpha3: 'TUN',
    flagURL: new URL('../../resources/flags/TUN.png', import.meta.url).href
  },
  {
    id: '792',
    label: 'Turkey',
    alpha2: 'TR',
    alpha3: 'TUR',
    flagURL: new URL('../../resources/flags/TUR.png', import.meta.url).href
  },
  {
    id: '795',
    label: 'Turkmenistan',
    alpha2: 'TM',
    alpha3: 'TKM',
    flagURL: new URL('../../resources/flags/TKM.png', import.meta.url).href
  },
  {
    id: '796',
    label: 'Turks and Caicos Islands',
    alpha2: 'TC',
    alpha3: 'TCA',
    flagURL: new URL('../../resources/flags/TCA.png', import.meta.url).href
  },
  {
    id: '798',
    label: 'Tuvalu',
    alpha2: 'TV',
    alpha3: 'TUV',
    flagURL: new URL('../../resources/flags/TUV.png', import.meta.url).href
  },
  {
    id: '800',
    label: 'Uganda',
    alpha2: 'UG',
    alpha3: 'UGA',
    flagURL: new URL('../../resources/flags/UGA.png', import.meta.url).href
  },
  {
    id: '804',
    label: 'Ukraine',
    alpha2: 'UA',
    alpha3: 'UKR',
    flagURL: new URL('../../resources/flags/UKR.png', import.meta.url).href
  },
  {
    id: '784',
    label: 'United Arab Emirates',
    alpha2: 'AE',
    alpha3: 'ARE',
    flagURL: new URL('../../resources/flags/ARE.png', import.meta.url).href
  },
  {
    id: '826',
    label: 'United Kingdom',
    alias: 'England',
    alpha2: 'GB',
    alpha3: 'GBR',
    flagURL: new URL('../../resources/flags/GBR.png', import.meta.url).href
  },
  {
    id: '581',
    label: 'United States Minor Outlying Islands',
    alpha2: 'UM',
    alpha3: 'UMI',
    flagURL: new URL('../../resources/flags/UMI.png', import.meta.url).href
  },
  {
    id: '840',
    label: 'United States of America',
    alpha2: 'US',
    alpha3: 'USA',
    flagURL: new URL('../../resources/flags/USA.png', import.meta.url).href
  },
  {
    id: '858',
    label: 'Uruguay',
    alpha2: 'UY',
    alpha3: 'URY',
    flagURL: new URL('../../resources/flags/URY.png', import.meta.url).href
  },
  {
    id: '860',
    label: 'Uzbekistan',
    alpha2: 'UZ',
    alpha3: 'UZB',
    flagURL: new URL('../../resources/flags/UZB.png', import.meta.url).href
  },
  {
    id: '548',
    label: 'Vanuatu',
    alpha2: 'VU',
    alpha3: 'VUT',
    flagURL: new URL('../../resources/flags/VUT.png', import.meta.url).href
  },
  {
    id: '862',
    label: 'Venezuela',
    alpha2: 'VE',
    alpha3: 'VEN',
    flagURL: new URL('../../resources/flags/VEN.png', import.meta.url).href
  },
  {
    id: '704',
    label: 'Vietnam',
    alpha2: 'VN',
    alpha3: 'VNM',
    flagURL: new URL('../../resources/flags/VNM.png', import.meta.url).href
  },
  {
    id: '092',
    label: 'Virgin Islands (British)',
    alpha2: 'VG',
    alpha3: 'VGB',
    flagURL: new URL('../../resources/flags/VGB.png', import.meta.url).href
  },
  {
    id: '850',
    label: 'Virgin Islands (U.S.)',
    alias: 'Virgin Islands US',
    alpha2: 'VI',
    alpha3: 'VIR',
    flagURL: new URL('../../resources/flags/VIR.png', import.meta.url).href
  },
  {
    id: '876',
    label: 'Wallis and Futuna',
    alpha2: 'WF',
    alpha3: 'WLF',
    flagURL: new URL('../../resources/flags/WLF.png', import.meta.url).href
  },
  {
    id: '732',
    label: 'Western Sahara',
    alpha2: 'EH',
    alpha3: 'ESH',
    flagURL: new URL('../../resources/flags/ESH.png', import.meta.url).href
  },
  {
    id: '887',
    label: 'Yemen',
    alpha2: 'YE',
    alpha3: 'YEM',
    flagURL: new URL('../../resources/flags/YEM.png', import.meta.url).href
  },
  {
    id: '894',
    label: 'Zambia',
    alpha2: 'ZM',
    alpha3: 'ZMB',
    flagURL: new URL('../../resources/flags/ZMB.png', import.meta.url).href
  },
  {
    id: '716',
    label: 'Zimbabwe',
    alpha2: 'ZW',
    alpha3: 'ZWE',
    flagURL: new URL('../../resources/flags/ZWE.png', import.meta.url).href
  },
  {
    id: '248',
    label: 'Åland Islands',
    alpha2: 'AX',
    alpha3: 'ALA',
    flagURL: new URL('../../resources/flags/ALA.png', import.meta.url).href
  },
  {
    id: '666',
    label: 'Soviet Union',
    alpha2: 'SU',
    alpha3: 'SU',
    flagURL: new URL('../../resources/flags/SU.png', import.meta.url).href
  }
]

export class Countries {
  static getList(): Country[] {
    return countries
  }

  static getCountryByCode(code: string | undefined) {
    if (!code) {
      return undefined
    }
    code = code.toUpperCase()
    let found = countries.find((country) => {
      return country.alpha3 === code || country.alpha2 === code
    })

    if (!found && code.indexOf('-') !== -1) {
      const simpleCode = code.substring(code.indexOf('-') + 1)
      found = countries.find((country) => {
        return country.alpha3 === simpleCode || country.alpha2 === simpleCode
      })
    }

    return found
  }

  static searchCountry = (prop: keyof Country, search: string): Country | undefined => {
    if (prop === 'label') {
      const searches = search.split(/\s+/)
      return countries.find((country) => {
        let ret = true
        for (const s of searches) {
          if (!Strings.localeContains(s, country[prop])) {
            ret = false
            break
          }
        }
        if (country.alias && !ret) {
          ret = true
          for (const s of searches) {
            if (!Strings.localeContains(s, country.alias)) {
              ret = false
              break
            }
          }
        }
        return ret
      })
    } else {
      return countries.find((country) => country[prop]?.localeCompare(search, undefined, { sensitivity: 'base' }) === 0)
    }
  }
}
