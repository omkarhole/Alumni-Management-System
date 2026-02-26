/**
 * Calculate skills match percentage between user skills and job skills
 * Uses fuzzy matching to check if skills overlap
 * 
 * @param {string[]} userSkills - Array of user's skills
 * @param {string[]} jobSkills - Array of job's required skills
 * @returns {number} - Match percentage (0-100)
 */
function calculateSkillsMatchPercentage(userSkills, jobSkills) {
  if (!userSkills?.length || !jobSkills?.length) return 0;
  
  const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
  const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());
  
  let matchCount = 0;
  normalizedJob.forEach(jobSkill => {
    if (normalizedUser.some(userSkill => 
      userSkill.includes(jobSkill) || jobSkill.includes(userSkill)
    )) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / normalizedJob.length) * 100);
}

module.exports = { calculateSkillsMatchPercentage };
