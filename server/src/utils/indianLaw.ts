/**
 * Indian Law Constants
 *
 * Central repository for Indian legal system reference data used throughout
 * the application. Includes section mappings between new and old criminal
 * laws, High Court jurisdictions, safety resources, and court hierarchy.
 */

// ---- Section Mapping: New Criminal Laws (effective 1 July 2024) ----

export interface SectionMap {
  newSection: string;
  oldSection: string;
  newAct: string;
  oldAct: string;
  description: string;
}

export const SECTION_MAPPING: SectionMap[] = [
  { newSection: 'BNS 101', oldSection: 'IPC 302', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Murder' },
  { newSection: 'BNS 103', oldSection: 'IPC 304', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Culpable homicide not amounting to murder' },
  { newSection: 'BNS 115', oldSection: 'IPC 323', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Voluntarily causing hurt' },
  { newSection: 'BNS 117', oldSection: 'IPC 326', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Voluntarily causing grievous hurt' },
  { newSection: 'BNS 63', oldSection: 'IPC 376', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Rape' },
  { newSection: 'BNS 74', oldSection: 'IPC 354', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Assault or criminal force to woman' },
  { newSection: 'BNS 78', oldSection: 'IPC 498A', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Cruelty by husband or relatives' },
  { newSection: 'BNS 303', oldSection: 'IPC 379', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Theft' },
  { newSection: 'BNS 309', oldSection: 'IPC 392', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Robbery' },
  { newSection: 'BNS 318', oldSection: 'IPC 420', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Cheating and dishonestly inducing delivery of property' },
  { newSection: 'BNS 316', oldSection: 'IPC 406', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Criminal breach of trust' },
  { newSection: 'BNS 329', oldSection: 'IPC 452', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'House trespass after preparation for hurt' },
  { newSection: 'BNS 351', oldSection: 'IPC 500', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Defamation' },
  { newSection: 'BNS 196', oldSection: 'IPC 120B', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Criminal conspiracy' },
  { newSection: 'BNS 61', oldSection: 'IPC 304A', newAct: 'Bharatiya Nyaya Sanhita, 2023', oldAct: 'Indian Penal Code, 1860', description: 'Causing death by negligence' },
  { newSection: 'BNSS 173', oldSection: 'CrPC 154', newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023', oldAct: 'Code of Criminal Procedure, 1973', description: 'First Information Report (FIR)' },
  { newSection: 'BNSS 35', oldSection: 'CrPC 41', newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023', oldAct: 'Code of Criminal Procedure, 1973', description: 'When police may arrest without warrant' },
  { newSection: 'BNSS 478', oldSection: 'CrPC 436', newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023', oldAct: 'Code of Criminal Procedure, 1973', description: 'Bail in bailable offences' },
  { newSection: 'BNSS 480', oldSection: 'CrPC 437', newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023', oldAct: 'Code of Criminal Procedure, 1973', description: 'Bail in non-bailable offences' },
  { newSection: 'BNSS 482', oldSection: 'CrPC 439', newAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023', oldAct: 'Code of Criminal Procedure, 1973', description: 'Special powers of High Court or Sessions Court regarding bail' },
];

// ---- High Court Mapping: State/UT -> High Court ----

export const HIGH_COURT_MAPPING: Record<string, string> = {
  'delhi': 'Delhi High Court',
  'uttar_pradesh': 'Allahabad High Court (Lucknow Bench for certain districts)',
  'maharashtra': 'Bombay High Court (Nagpur Bench, Aurangabad Bench for respective regions)',
  'karnataka': 'Karnataka High Court (Dharwad Bench, Kalaburagi Bench)',
  'tamil_nadu': 'Madras High Court (Madurai Bench)',
  'west_bengal': 'Calcutta High Court (Circuit Bench at Jalpaiguri)',
  'rajasthan': 'Rajasthan High Court, Jodhpur (Jaipur Bench)',
  'gujarat': 'Gujarat High Court, Ahmedabad',
  'madhya_pradesh': 'Madhya Pradesh High Court, Jabalpur (Gwalior Bench, Indore Bench)',
  'kerala': 'Kerala High Court, Ernakulam',
  'punjab': 'Punjab and Haryana High Court, Chandigarh',
  'haryana': 'Punjab and Haryana High Court, Chandigarh',
  'telangana': 'Telangana High Court, Hyderabad',
  'andhra_pradesh': 'Andhra Pradesh High Court, Amaravati',
  'bihar': 'Patna High Court',
  'odisha': 'Orissa High Court, Cuttack',
  'jharkhand': 'Jharkhand High Court, Ranchi',
  'chhattisgarh': 'Chhattisgarh High Court, Bilaspur',
  'uttarakhand': 'Uttarakhand High Court, Nainital',
  'assam': 'Gauhati High Court, Guwahati',
  'himachal_pradesh': 'Himachal Pradesh High Court, Shimla',
  'goa': 'Bombay High Court (Goa Bench, Panaji)',
  'tripura': 'Tripura High Court, Agartala',
  'meghalaya': 'Meghalaya High Court, Shillong',
  'manipur': 'Manipur High Court, Imphal',
  'nagaland': 'Gauhati High Court (Kohima Bench)',
  'mizoram': 'Gauhati High Court (Aizawl Bench)',
  'arunachal_pradesh': 'Gauhati High Court (Naharlagun Bench)',
  'sikkim': 'Sikkim High Court, Gangtok',
  'jammu_kashmir': 'Jammu & Kashmir and Ladakh High Court',
  'ladakh': 'Jammu & Kashmir and Ladakh High Court',
  'chandigarh': 'Punjab and Haryana High Court, Chandigarh',
  'puducherry': 'Madras High Court',
  'andaman_nicobar': 'Calcutta High Court (Circuit Bench)',
  'lakshadweep': 'Kerala High Court',
  'dadra_nagar_haveli': 'Bombay High Court',
  'daman_diu': 'Bombay High Court',
};

// ---- Safety / Emergency Resources ----

export const SAFETY_RESOURCES = {
  womenHelpline: '181',
  police: '112',
  ncwWhatsapp: '+91-7217735372',
  nalsa: '15100',
  childHelpline: '1098',
  seniorCitizenHelpline: '14567',
} as const;

// ---- Court Hierarchy ----

export const COURT_HIERARCHY = `Indian Court Hierarchy (highest to lowest):
1. Supreme Court of India (New Delhi) — Final appellate authority
2. High Courts — One for each state/group of states, appellate and writ jurisdiction
3. District Courts — Principal civil/criminal court at district level
4. Subordinate Courts — Civil Judge (Junior Division), Judicial Magistrate
5. Specialized Tribunals — NCLT, NCLAT, NGT, RERA, Consumer Forums, Labour Courts, Family Courts`;
