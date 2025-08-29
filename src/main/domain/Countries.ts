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

import { Strings } from '../../common/Strings'
import { Country } from '../../common/@types/Countries'

const countries: Country[] = [
  { id: '004', label: 'Afghanistan', alpha2: 'AF', alpha3: 'AFG' },
  { id: '008', label: 'Albania', alpha2: 'AL', alpha3: 'ALB' },
  { id: '012', label: 'Algeria', alpha2: 'DZ', alpha3: 'DZA' },
  { id: '016', label: 'American Samoa', alpha2: 'AS', alpha3: 'ASM' },
  { id: '020', label: 'Andorra', alpha2: 'AD', alpha3: 'AND' },
  { id: '024', label: 'Angola', alpha2: 'AO', alpha3: 'AGO' },
  { id: '660', label: 'Anguilla', alpha2: 'AI', alpha3: 'AIA' },
  { id: '010', label: 'Antarctica', alpha2: 'AQ', alpha3: 'ATA' },
  { id: '028', label: 'Antigua and Barbuda', alpha2: 'AG', alpha3: 'ATG' },
  { id: '032', label: 'Argentina', alpha2: 'AR', alpha3: 'ARG' },
  { id: '051', label: 'Armenia', alpha2: 'AM', alpha3: 'ARM' },
  { id: '533', label: 'Aruba', alpha2: 'AW', alpha3: 'ABW' },
  { id: '036', label: 'Australia', alpha2: 'AU', alpha3: 'AUS' },
  { id: '040', label: 'Austria', alpha2: 'AT', alpha3: 'AUT' },
  { id: '031', label: 'Azerbaijan', alpha2: 'AZ', alpha3: 'AZE' },
  { id: '044', label: 'Bahamas', alpha2: 'BS', alpha3: 'BHS' },
  { id: '048', label: 'Bahrain', alpha2: 'BH', alpha3: 'BHR' },
  { id: '050', label: 'Bangladesh', alpha2: 'BD', alpha3: 'BGD' },
  { id: '052', label: 'Barbados', alpha2: 'BB', alpha3: 'BRB' },
  { id: '112', label: 'Belarus', alpha2: 'BY', alpha3: 'BLR' },
  { id: '056', label: 'Belgium', alpha2: 'BE', alpha3: 'BEL' },
  { id: '084', label: 'Belize', alpha2: 'BZ', alpha3: 'BLZ' },
  { id: '204', label: 'Benin', alpha2: 'BJ', alpha3: 'BEN' },
  { id: '060', label: 'Bermuda', alpha2: 'BM', alpha3: 'BMU' },
  { id: '064', label: 'Bhutan', alpha2: 'BT', alpha3: 'BTN' },
  { id: '068', label: 'Bolivia (Plurinational State of)', alpha2: 'BO', alpha3: 'BOL' },
  { id: '535', label: 'Bonaire, Sint Eustatius and Saba', alpha2: 'BQ', alpha3: 'BES' },
  { id: '070', label: 'Bosnia and Herzegovina', alpha2: 'BA', alpha3: 'BIH' },
  { id: '072', label: 'Botswana', alpha2: 'BW', alpha3: 'BWA' },
  { id: '074', label: 'Bouvet Island', alpha2: 'BV', alpha3: 'BVT' },
  { id: '076', label: 'Brazil', alpha2: 'BR', alpha3: 'BRA' },
  { id: '086', label: 'British Indian Ocean Territory', alpha2: 'IO', alpha3: 'IOT' },
  { id: '096', label: 'Brunei Darussalam', alpha2: 'BN', alpha3: 'BRN' },
  { id: '100', label: 'Bulgaria', alpha2: 'BG', alpha3: 'BGR' },
  { id: '854', label: 'Burkina Faso', alpha2: 'BF', alpha3: 'BFA' },
  { id: '108', label: 'Burundi', alpha2: 'BI', alpha3: 'BDI' },
  { id: '132', label: 'Cape Verde', alpha2: 'CV', alpha3: 'CPV' },
  { id: '116', label: 'Cambodia', alpha2: 'KH', alpha3: 'KHM' },
  { id: '120', label: 'Cameroon', alpha2: 'CM', alpha3: 'CMR' },
  { id: '124', label: 'Canada', alpha2: 'CA', alpha3: 'CAN' },
  { id: '136', label: 'Cayman Islands', alpha2: 'KY', alpha3: 'CYM' },
  { id: '140', label: 'Central African Republic', alpha2: 'CF', alpha3: 'CAF' },
  { id: '148', label: 'Chad', alpha2: 'TD', alpha3: 'TCD' },
  { id: '152', label: 'Chile', alpha2: 'CL', alpha3: 'CHL' },
  { id: '156', label: 'China', alias: 'Republic of China', alpha2: 'CN', alpha3: 'CHN' },
  { id: '162', label: 'Christmas Island', alpha2: 'CX', alpha3: 'CXR' },
  { id: '166', label: 'Cocos (Keeling) Islands', alpha2: 'CC', alpha3: 'CCK' },
  { id: '170', label: 'Colombia', alpha2: 'CO', alpha3: 'COL' },
  { id: '174', label: 'Comoros', alpha2: 'KM', alpha3: 'COM' },
  { id: '180', label: 'Congo (the Democratic Republic of the)', alpha2: 'CD', alpha3: 'COD' },
  { id: '178', label: 'Congo', alpha2: 'CG', alpha3: 'COG' },
  { id: '184', label: 'Cook Islands', alpha2: 'CK', alpha3: 'COK' },
  { id: '188', label: 'Costa Rica', alpha2: 'CR', alpha3: 'CRI' },
  { id: '191', label: 'Croatia', alpha2: 'HR', alpha3: 'HRV' },
  { id: '192', label: 'Cuba', alpha2: 'CU', alpha3: 'CUB' },
  { id: '531', label: 'Curaçao', alpha2: 'CW', alpha3: 'CUW' },
  { id: '196', label: 'Cyprus', alpha2: 'CY', alpha3: 'CYP' },
  { id: '203', label: 'Czech Republic', alpha2: 'CZ', alpha3: 'CZE' },
  { id: '384', label: 'Ivory Coast', alpha2: 'CI', alpha3: 'CIV' },
  { id: '208', label: 'Denmark', alpha2: 'DK', alpha3: 'DNK' },
  { id: '262', label: 'Djibouti', alpha2: 'DJ', alpha3: 'DJI' },
  { id: '212', label: 'Dominica', alpha2: 'DM', alpha3: 'DMA' },
  { id: '214', label: 'Dominican Republic', alpha2: 'DO', alpha3: 'DOM' },
  { id: '218', label: 'Ecuador', alpha2: 'EC', alpha3: 'ECU' },
  { id: '818', label: 'Egypt', alpha2: 'EG', alpha3: 'EGY' },
  { id: '222', label: 'El Salvador', alpha2: 'SV', alpha3: 'SLV' },
  { id: '226', label: 'Equatorial Guinea', alpha2: 'GQ', alpha3: 'GNQ' },
  { id: '232', label: 'Eritrea', alpha2: 'ER', alpha3: 'ERI' },
  { id: '233', label: 'Estonia', alpha2: 'EE', alpha3: 'EST' },
  { id: '748', label: 'Eswatini', alpha2: 'SZ', alpha3: 'SWZ' },
  { id: '231', label: 'Ethiopia', alpha2: 'ET', alpha3: 'ETH' },
  { id: '238', label: 'Falkland Islands [Malvinas]', alpha2: 'FK', alpha3: 'FLK' },
  { id: '234', label: 'Faroe Islands', alpha2: 'FO', alpha3: 'FRO' },
  { id: '242', label: 'Fiji', alpha2: 'FJ', alpha3: 'FJI' },
  { id: '246', label: 'Finland', alpha2: 'FI', alpha3: 'FIN' },
  { id: '250', label: 'France', alpha2: 'FR', alpha3: 'FRA' },
  { id: '254', label: 'French Guiana', alpha2: 'GF', alpha3: 'GUF' },
  { id: '258', label: 'French Polynesia', alpha2: 'PF', alpha3: 'PYF' },
  { id: '260', label: 'French Southern Territories', alpha2: 'TF', alpha3: 'ATF' },
  { id: '266', label: 'Gabon', alpha2: 'GA', alpha3: 'GAB' },
  { id: '270', label: 'Gambia', alpha2: 'GM', alpha3: 'GMB' },
  { id: '268', label: 'Georgia', alpha2: 'GE', alpha3: 'GEO' },
  { id: '276', label: 'Germany', alpha2: 'DE', alpha3: 'DEU' },
  { id: '288', label: 'Ghana', alpha2: 'GH', alpha3: 'GHA' },
  { id: '292', label: 'Gibraltar', alpha2: 'GI', alpha3: 'GIB' },
  { id: '300', label: 'Greece', alpha2: 'GR', alpha3: 'GRC' },
  { id: '304', label: 'Greenland', alpha2: 'GL', alpha3: 'GRL' },
  { id: '308', label: 'Grenada', alpha2: 'GD', alpha3: 'GRD' },
  { id: '312', label: 'Guadeloupe', alpha2: 'GP', alpha3: 'GLP' },
  { id: '316', label: 'Guam', alpha2: 'GU', alpha3: 'GUM' },
  { id: '320', label: 'Guatemala', alpha2: 'GT', alpha3: 'GTM' },
  { id: '831', label: 'Guernsey', alpha2: 'GG', alpha3: 'GGY' },
  { id: '324', label: 'Guinea', alpha2: 'GN', alpha3: 'GIN' },
  { id: '624', label: 'Guinea-Bissau', alpha2: 'GW', alpha3: 'GNB' },
  { id: '328', label: 'Guyana', alpha2: 'GY', alpha3: 'GUY' },
  { id: '332', label: 'Haiti', alpha2: 'HT', alpha3: 'HTI' },
  { id: '334', label: 'Heard Island and McDonald Islands', alpha2: 'HM', alpha3: 'HMD' },
  { id: '336', label: 'Holy See', alpha2: 'VA', alpha3: 'VAT' },
  { id: '340', label: 'Honduras', alpha2: 'HN', alpha3: 'HND' },
  { id: '344', label: 'Hong Kong', alpha2: 'HK', alpha3: 'HKG' },
  { id: '348', label: 'Hungary', alpha2: 'HU', alpha3: 'HUN' },
  { id: '352', label: 'Iceland', alpha2: 'IS', alpha3: 'ISL' },
  { id: '356', label: 'India', alpha2: 'IN', alpha3: 'IND' },
  { id: '360', label: 'Indonesia', alpha2: 'ID', alpha3: 'IDN' },
  { id: '364', label: 'Iran (Islamic Republic of)', alpha2: 'IR', alpha3: 'IRN' },
  { id: '368', label: 'Iraq', alpha2: 'IQ', alpha3: 'IRQ' },
  { id: '372', label: 'Ireland', alpha2: 'IE', alpha3: 'IRL' },
  { id: '833', label: 'Isle of Man', alpha2: 'IM', alpha3: 'IMN' },
  { id: '376', label: 'Israel', alpha2: 'IL', alpha3: 'ISR' },
  { id: '380', label: 'Italy', alpha2: 'IT', alpha3: 'ITA' },
  { id: '388', label: 'Jamaica', alpha2: 'JM', alpha3: 'JAM' },
  { id: '392', label: 'Japan', alpha2: 'JP', alpha3: 'JPN' },
  { id: '832', label: 'Jersey', alpha2: 'JE', alpha3: 'JEY' },
  { id: '400', label: 'Jordan', alpha2: 'JO', alpha3: 'JOR' },
  { id: '398', label: 'Kazakhstan', alpha2: 'KZ', alpha3: 'KAZ' },
  { id: '404', label: 'Kenya', alpha2: 'KE', alpha3: 'KEN' },
  { id: '296', label: 'Kiribati', alpha2: 'KI', alpha3: 'KIR' },
  { id: '408', label: 'North Korea', alpha2: 'KP', alpha3: 'PRK' },
  { id: '410', label: 'South Korea', alpha2: 'KR', alpha3: 'KOR' },
  { id: '414', label: 'Kuwait', alpha2: 'KW', alpha3: 'KWT' },
  { id: '417', label: 'Kyrgyzstan', alpha2: 'KG', alpha3: 'KGZ' },
  { id: '418', label: 'Laos', alpha2: 'LA', alpha3: 'LAO' },
  { id: '428', label: 'Latvia', alpha2: 'LV', alpha3: 'LVA' },
  { id: '422', label: 'Lebanon', alpha2: 'LB', alpha3: 'LBN' },
  { id: '426', label: 'Lesotho', alpha2: 'LS', alpha3: 'LSO' },
  { id: '430', label: 'Liberia', alpha2: 'LR', alpha3: 'LBR' },
  { id: '434', label: 'Libya', alpha2: 'LY', alpha3: 'LBY' },
  { id: '438', label: 'Liechtenstein', alpha2: 'LI', alpha3: 'LIE' },
  { id: '440', label: 'Lithuania', alpha2: 'LT', alpha3: 'LTU' },
  { id: '442', label: 'Luxembourg', alpha2: 'LU', alpha3: 'LUX' },
  { id: '446', label: 'Macao', alpha2: 'MO', alpha3: 'MAC' },
  { id: '450', label: 'Madagascar', alpha2: 'MG', alpha3: 'MDG' },
  { id: '454', label: 'Malawi', alpha2: 'MW', alpha3: 'MWI' },
  { id: '458', label: 'Malaysia', alpha2: 'MY', alpha3: 'MYS' },
  { id: '462', label: 'Maldives', alpha2: 'MV', alpha3: 'MDV' },
  { id: '466', label: 'Mali', alpha2: 'ML', alpha3: 'MLI' },
  { id: '470', label: 'Malta', alpha2: 'MT', alpha3: 'MLT' },
  { id: '584', label: 'Marshall Islands', alpha2: 'MH', alpha3: 'MHL' },
  { id: '474', label: 'Martinique', alpha2: 'MQ', alpha3: 'MTQ' },
  { id: '478', label: 'Mauritania', alpha2: 'MR', alpha3: 'MRT' },
  { id: '480', label: 'Mauritius', alpha2: 'MU', alpha3: 'MUS' },
  { id: '175', label: 'Mayotte', alpha2: 'YT', alpha3: 'MYT' },
  { id: '484', label: 'Mexico', alpha2: 'MX', alpha3: 'MEX' },
  { id: '583', label: 'Micronesia (Federated States of)', alpha2: 'FM', alpha3: 'FSM' },
  { id: '498', label: 'Moldova (the Republic of)', alpha2: 'MD', alpha3: 'MDA' },
  { id: '492', label: 'Monaco', alpha2: 'MC', alpha3: 'MCO' },
  { id: '496', label: 'Mongolia', alpha2: 'MN', alpha3: 'MNG' },
  { id: '499', label: 'Montenegro', alpha2: 'ME', alpha3: 'MNE' },
  { id: '500', label: 'Montserrat', alpha2: 'MS', alpha3: 'MSR' },
  { id: '504', label: 'Morocco', alpha2: 'MA', alpha3: 'MAR' },
  { id: '508', label: 'Mozambique', alpha2: 'MZ', alpha3: 'MOZ' },
  { id: '104', label: 'Myanmar', alpha2: 'MM', alpha3: 'MMR' },
  { id: '516', label: 'Namibia', alpha2: 'NA', alpha3: 'NAM' },
  { id: '520', label: 'Nauru', alpha2: 'NR', alpha3: 'NRU' },
  { id: '524', label: 'Nepal', alpha2: 'NP', alpha3: 'NPL' },
  { id: '528', label: 'Netherlands', alpha2: 'NL', alpha3: 'NLD' },
  { id: '540', label: 'New Caledonia', alpha2: 'NC', alpha3: 'NCL' },
  { id: '554', label: 'New Zealand', alpha2: 'NZ', alpha3: 'NZL' },
  { id: '558', label: 'Nicaragua', alpha2: 'NI', alpha3: 'NIC' },
  { id: '562', label: 'Niger', alpha2: 'NE', alpha3: 'NER' },
  { id: '566', label: 'Nigeria', alpha2: 'NG', alpha3: 'NGA' },
  { id: '570', label: 'Niue', alpha2: 'NU', alpha3: 'NIU' },
  { id: '574', label: 'Norfolk Island', alpha2: 'NF', alpha3: 'NFK' },
  { id: '580', label: 'Northern Mariana Islands', alpha2: 'MP', alpha3: 'MNP' },
  { id: '578', label: 'Norway', alpha2: 'NO', alpha3: 'NOR' },
  { id: '512', label: 'Oman', alpha2: 'OM', alpha3: 'OMN' },
  { id: '586', label: 'Pakistan', alpha2: 'PK', alpha3: 'PAK' },
  { id: '585', label: 'Palau', alpha2: 'PW', alpha3: 'PLW' },
  {
    id: '275',
    label: 'Palestine, State of',
    alias: 'Palestinian Territory',
    alpha2: 'PS',
    alpha3: 'PSE'
  },
  { id: '591', label: 'Panama', alpha2: 'PA', alpha3: 'PAN' },
  { id: '598', label: 'Papua New Guinea', alpha2: 'PG', alpha3: 'PNG' },
  { id: '600', label: 'Paraguay', alpha2: 'PY', alpha3: 'PRY' },
  { id: '604', label: 'Peru', alpha2: 'PE', alpha3: 'PER' },
  { id: '608', label: 'Philippines', alpha2: 'PH', alpha3: 'PHL' },
  { id: '612', label: 'Pitcairn', alias: 'Pitcairn Islands', alpha2: 'PN', alpha3: 'PCN' },
  { id: '616', label: 'Poland', alpha2: 'PL', alpha3: 'POL' },
  { id: '620', label: 'Portugal', alpha2: 'PT', alpha3: 'PRT' },
  { id: '630', label: 'Puerto Rico', alpha2: 'PR', alpha3: 'PRI' },
  { id: '634', label: 'Qatar', alpha2: 'QA', alpha3: 'QAT' },
  { id: '807', label: 'Republic of North Macedonia', alpha2: 'MK', alpha3: 'MKD' },
  { id: '642', label: 'Romania', alpha2: 'RO', alpha3: 'ROU' },
  { id: '643', label: 'Russian Federation', alpha2: 'RU', alpha3: 'RUS' },
  { id: '646', label: 'Rwanda', alpha2: 'RW', alpha3: 'RWA' },
  { id: '638', label: 'Réunion', alpha2: 'RE', alpha3: 'REU' },
  { id: '652', label: 'Saint Barthélemy', alpha2: 'BL', alpha3: 'BLM' },
  { id: '654', label: 'Saint Helena, Ascension and Tristan da Cunha', alpha2: 'SH', alpha3: 'SHN' },
  { id: '659', label: 'Saint Kitts and Nevis', alpha2: 'KN', alpha3: 'KNA' },
  { id: '662', label: 'Saint Lucia', alpha2: 'LC', alpha3: 'LCA' },
  { id: '663', label: 'Saint Martin (French part)', alpha2: 'MF', alpha3: 'MAF' },
  { id: '666', label: 'Saint Pierre and Miquelon', alpha2: 'PM', alpha3: 'SPM' },
  { id: '670', label: 'Saint Vincent and the Grenadines', alpha2: 'VC', alpha3: 'VCT' },
  { id: '882', label: 'Samoa', alpha2: 'WS', alpha3: 'WSM' },
  { id: '674', label: 'San Marino', alpha2: 'SM', alpha3: 'SMR' },
  { id: '678', label: 'Sao Tome and Principe', alpha2: 'ST', alpha3: 'STP' },
  { id: '682', label: 'Saudi Arabia', alpha2: 'SA', alpha3: 'SAU' },
  { id: '686', label: 'Senegal', alpha2: 'SN', alpha3: 'SEN' },
  { id: '688', label: 'Serbia', alpha2: 'RS', alpha3: 'SRB' },
  { id: '690', label: 'Seychelles', alpha2: 'SC', alpha3: 'SYC' },
  { id: '694', label: 'Sierra Leone', alpha2: 'SL', alpha3: 'SLE' },
  { id: '702', label: 'Singapore', alpha2: 'SG', alpha3: 'SGP' },
  { id: '534', label: 'Sint Maarten (Dutch part)', alpha2: 'SX', alpha3: 'SXM' },
  { id: '703', label: 'Slovakia', alpha2: 'SK', alpha3: 'SVK' },
  { id: '705', label: 'Slovenia', alpha2: 'SI', alpha3: 'SVN' },
  { id: '090', label: 'Solomon Islands', alpha2: 'SB', alpha3: 'SLB' },
  { id: '706', label: 'Somalia', alpha2: 'SO', alpha3: 'SOM' },
  { id: '710', label: 'South Africa', alpha2: 'ZA', alpha3: 'ZAF' },
  { id: '239', label: 'South Georgia and the South Sandwich Islands', alpha2: 'GS', alpha3: 'SGS' },
  { id: '728', label: 'South Sudan', alpha2: 'SS', alpha3: 'SSD' },
  { id: '724', label: 'Spain', alpha2: 'ES', alpha3: 'ESP' },
  { id: '144', label: 'Sri Lanka', alpha2: 'LK', alpha3: 'LKA' },
  { id: '729', label: 'Sudan', alpha2: 'SD', alpha3: 'SDN' },
  { id: '740', label: 'Suriname', alpha2: 'SR', alpha3: 'SUR' },
  { id: '744', label: 'Svalbard and Jan Mayen', alpha2: 'SJ', alpha3: 'SJM' },
  { id: '752', label: 'Sweden', alpha2: 'SE', alpha3: 'SWE' },
  { id: '756', label: 'Switzerland', alpha2: 'CH', alpha3: 'CHE' },
  { id: '760', label: 'Syrian Arab Republic', alpha2: 'SY', alpha3: 'SYR' },
  { id: '158', label: 'Taiwan', alpha2: 'TW', alpha3: 'TWN' },
  { id: '762', label: 'Tajikistan', alpha2: 'TJ', alpha3: 'TJK' },
  { id: '834', label: 'Tanzania, United Republic of', alpha2: 'TZ', alpha3: 'TZA' },
  { id: '764', label: 'Thailand', alpha2: 'TH', alpha3: 'THA' },
  { id: '626', label: 'Timor-Leste', alias: 'East Timor', alpha2: 'TL', alpha3: 'TLS' },
  { id: '768', label: 'Togo', alpha2: 'TG', alpha3: 'TGO' },
  { id: '772', label: 'Tokelau', alpha2: 'TK', alpha3: 'TKL' },
  { id: '776', label: 'Tonga', alpha2: 'TO', alpha3: 'TON' },
  { id: '780', label: 'Trinidad and Tobago', alpha2: 'TT', alpha3: 'TTO' },
  { id: '788', label: 'Tunisia', alpha2: 'TN', alpha3: 'TUN' },
  { id: '792', label: 'Turkey', alpha2: 'TR', alpha3: 'TUR' },
  { id: '795', label: 'Turkmenistan', alpha2: 'TM', alpha3: 'TKM' },
  { id: '796', label: 'Turks and Caicos Islands', alpha2: 'TC', alpha3: 'TCA' },
  { id: '798', label: 'Tuvalu', alpha2: 'TV', alpha3: 'TUV' },
  { id: '800', label: 'Uganda', alpha2: 'UG', alpha3: 'UGA' },
  { id: '804', label: 'Ukraine', alpha2: 'UA', alpha3: 'UKR' },
  { id: '784', label: 'United Arab Emirates', alpha2: 'AE', alpha3: 'ARE' },
  { id: '826', label: 'United Kingdom', alias: 'England', alpha2: 'GB', alpha3: 'GBR' },
  { id: '581', label: 'United States Minor Outlying Islands', alpha2: 'UM', alpha3: 'UMI' },
  { id: '840', label: 'United States of America', alpha2: 'US', alpha3: 'USA' },
  { id: '858', label: 'Uruguay', alpha2: 'UY', alpha3: 'URY' },
  { id: '860', label: 'Uzbekistan', alpha2: 'UZ', alpha3: 'UZB' },
  { id: '548', label: 'Vanuatu', alpha2: 'VU', alpha3: 'VUT' },
  { id: '862', label: 'Venezuela', alpha2: 'VE', alpha3: 'VEN' },
  { id: '704', label: 'Vietnam', alpha2: 'VN', alpha3: 'VNM' },
  { id: '092', label: 'Virgin Islands (British)', alpha2: 'VG', alpha3: 'VGB' },
  {
    id: '850',
    label: 'Virgin Islands (U.S.)',
    alias: 'Virgin Islands US',
    alpha2: 'VI',
    alpha3: 'VIR'
  },
  { id: '876', label: 'Wallis and Futuna', alpha2: 'WF', alpha3: 'WLF' },
  { id: '732', label: 'Western Sahara', alpha2: 'EH', alpha3: 'ESH' },
  { id: '887', label: 'Yemen', alpha2: 'YE', alpha3: 'YEM' },
  { id: '894', label: 'Zambia', alpha2: 'ZM', alpha3: 'ZMB' },
  { id: '716', label: 'Zimbabwe', alpha2: 'ZW', alpha3: 'ZWE' },
  { id: '248', label: 'Åland Islands', alpha2: 'AX', alpha3: 'ALA' },
  { id: '666', label: 'Soviet Union', alpha2: 'SU', alpha3: 'SU' }
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
