/**
 * Client-side role normalization mapping.
 * Maps messy role strings from LeetCode to standardized tiers.
 */

const ROLE_MAP = {
  // Software Engineer levels
  'sde': 'SDE',
  'sde 1': 'SDE-1',
  'sde-1': 'SDE-1',
  'sde1': 'SDE-1',
  'sde i': 'SDE-1',
  'se 1': 'SDE-1',
  'se1': 'SDE-1',
  'swe': 'SDE',
  'swe 1': 'SDE-1',
  'swe1': 'SDE-1',
  'swe-1': 'SDE-1',
  'swe i': 'SDE-1',
  'software engineer': 'SDE',
  'software engineer 1': 'SDE-1',
  'software engineer i': 'SDE-1',
  'software engineer ii': 'SDE-2',
  'software engineer iii': 'SDE-3',
  'junior software engineer': 'SDE-1',
  'associate software engineer': 'SDE-1',
  'ase': 'SDE-1',
  'sde 2': 'SDE-2',
  'sde-2': 'SDE-2',
  'sde2': 'SDE-2',
  'sde ii': 'SDE-2',
  'se 2': 'SDE-2',
  'se2': 'SDE-2',
  'swe 2': 'SDE-2',
  'swe2': 'SDE-2',
  'swe-2': 'SDE-2',
  'swe ii': 'SDE-2',
  'software engineer 2': 'SDE-2',
  'sde 3': 'SDE-3',
  'sde-3': 'SDE-3',
  'sde3': 'SDE-3',
  'sde iii': 'SDE-3',
  'se 3': 'SDE-3',
  'swe 3': 'SDE-3',
  'swe-3': 'SDE-3',
  'software engineer 3': 'SDE-3',

  // Senior
  'sse': 'Senior SDE',
  'senior software engineer': 'Senior SDE',
  'senior engineer': 'Senior SDE',
  'senior sde': 'Senior SDE',
  'senior swe': 'Senior SDE',
  'sr software engineer': 'Senior SDE',
  'sr. software engineer': 'Senior SDE',
  'sr sde': 'Senior SDE',
  'sr. sde': 'Senior SDE',
  'senior': 'Senior SDE',

  // Staff+
  'staff': 'Staff',
  'staff engineer': 'Staff',
  'staff software engineer': 'Staff',
  'staff sde': 'Staff',
  'principal': 'Principal',
  'principal engineer': 'Principal',
  'principal software engineer': 'Principal',
  'distinguished engineer': 'Distinguished',

  // Lead / Manager
  'tech lead': 'Tech Lead',
  'lead': 'Tech Lead',
  'lead engineer': 'Tech Lead',
  'lead software engineer': 'Tech Lead',
  'engineering manager': 'Engineering Manager',
  'em': 'Engineering Manager',
  'director': 'Director',
  'vp': 'VP Engineering',
  'avp': 'AVP',

  // Data / ML
  'data scientist': 'Data Scientist',
  'ds': 'Data Scientist',
  'data engineer': 'Data Engineer',
  'de': 'Data Engineer',
  'ml engineer': 'ML Engineer',
  'machine learning engineer': 'ML Engineer',
  'ai ml': 'ML Engineer',
  'ai engineer': 'AI Engineer',

  // Frontend / Backend
  'frontend engineer': 'Frontend Engineer',
  'fe': 'Frontend Engineer',
  'fsd': 'Full Stack',
  'full stack developer': 'Full Stack',
  'full stack engineer': 'Full Stack',
  'backend engineer': 'Backend Engineer',
  'be': 'Backend Engineer',

  // DevOps / Infra
  'devops engineer': 'DevOps',
  'devops': 'DevOps',
  'sre': 'SRE',
  'site reliability engineer': 'SRE',
  'platform engineer': 'Platform Engineer',
  'cloud engineer': 'Cloud Engineer',

  // Other
  'intern': 'Intern',
  'internship': 'Intern',
  'consultant': 'Consultant',
  'contractor': 'Contractor',
  'analyst': 'Analyst',
  'associate': 'Associate',
  'engineer': 'Engineer',

  // Company-specific levels
  'l3': 'SDE-1 (L3)',
  'l4': 'SDE-2 (L4)',
  'l5': 'Senior (L5)',
  'l5a': 'Senior (L5)',
  'l6': 'Staff (L6)',
  'l63': 'SDE-2 (L63)',
  'l64': 'Senior (L64)',
  'e3': 'SDE-1 (E3)',
  'e4': 'SDE-2 (E4)',
  'e5': 'Senior (E5)',
  'e6': 'Staff (E6)',
  'ic2': 'SDE-1 (IC2)',
  'ic3': 'SDE-2 (IC3)',
  'ic4': 'Senior (IC4)',
  'ic5': 'Staff (IC5)',
  't4': 'SDE-1 (T4)',
  't5': 'SDE-2 (T5)',
  't6': 'Senior (T6)',
  'cs': 'Computer Scientist',
  'cs 1': 'Computer Scientist 1',
  'cse': 'Computer Scientist',
  'smts': 'Senior MTS',
  'mts': 'MTS',
};

// Seniority tiers for grouping
export const SENIORITY_TIERS = {
  'Intern': 0,
  'SDE-1': 1, 'SDE-1 (L3)': 1, 'SDE-1 (E3)': 1, 'SDE-1 (IC2)': 1, 'SDE-1 (T4)': 1,
  'Associate': 1, 'Analyst': 1,
  'SDE': 1.5,
  'Engineer': 1.5,
  'SDE-2': 2, 'SDE-2 (L4)': 2, 'SDE-2 (E4)': 2, 'SDE-2 (IC3)': 2, 'SDE-2 (L63)': 2, 'SDE-2 (T5)': 2,
  'MTS': 2, 'Computer Scientist 1': 2,
  'SDE-3': 3,
  'Senior SDE': 3, 'Senior (L5)': 3, 'Senior (E5)': 3, 'Senior (IC4)': 3, 'Senior (L64)': 3, 'Senior (T6)': 3,
  'Senior MTS': 3, 'Computer Scientist': 3,
  'Tech Lead': 3.5,
  'Staff': 4, 'Staff (L6)': 4, 'Staff (E6)': 4, 'Staff (IC5)': 4,
  'Principal': 5,
  'Distinguished': 6,
  'Director': 5, 'Engineering Manager': 4, 'VP Engineering': 6, 'AVP': 4.5,
};

/**
 * Normalize a role string to a standardized tier.
 * Returns the original if no mapping found.
 */
export function normalizeRole(role) {
  if (!role) return 'Unknown';
  const key = role.toLowerCase().trim();
  return ROLE_MAP[key] || role;
}

/**
 * Get the seniority level (0-6) for a normalized role.
 */
export function getSeniorityLevel(normalizedRole) {
  return SENIORITY_TIERS[normalizedRole] ?? 2; // default to mid-level
}

/**
 * Group roles into broad categories for aggregation.
 */
export function getRoleBucket(normalizedRole) {
  const level = getSeniorityLevel(normalizedRole);
  if (level <= 0) return 'Intern';
  if (level <= 1.5) return 'Junior (SDE-1)';
  if (level <= 2.5) return 'Mid (SDE-2)';
  if (level <= 3.5) return 'Senior';
  if (level <= 4.5) return 'Staff+';
  return 'Director+';
}
