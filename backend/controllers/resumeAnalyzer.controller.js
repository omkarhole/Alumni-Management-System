const { User, Career, Course, ResumeAnalysis } = require('../models/Index');
const logger = require('../utils/logger');
const { calculateSkillsMatchPercentage } = require('../utils/skillMatcher');

// Lightweight, keyword-based "skill extraction" from resume text.
// NOTE: This is intentionally deterministic and requires no external AI calls.
function extractSkillsFromResumeText(resumeText = '', knownSkills = []) {
  const text = String(resumeText || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\s#.-]/g, ' ');

  // If we have a vocabulary of skills, detect only those.
  // Otherwise fall back to extracting frequent noun-like tokens.
  const vocabulary = Array.isArray(knownSkills) ? knownSkills.filter(Boolean) : [];

  if (vocabulary.length > 0) {
    const matched = new Set();
    for (const skill of vocabulary) {
      const s = String(skill).toLowerCase().trim();
      if (!s) continue;
      // Simple containment to catch "React" inside longer phrases.
      if (text.includes(s) || s.split(/\s+/).every((part) => text.includes(part))) {
        matched.add(skill);
      }
    }
    return Array.from(matched);
  }

  // Fallback: heuristics
  const tokens = text
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => t.length >= 3 && !/^(and|the|for|with|from|into|that|this|have|will|you|your)$/i.test(t));

  const freq = new Map();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) || 0) + 1);
  }

  // Return top 20 tokens
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([t]) => t);
}

function getMissingSkills({ resumeSkills = [], jobSkills = [] }) {
  const normalizedResume = new Set((resumeSkills || []).map((s) => String(s).toLowerCase().trim()));
  const missing = [];

  for (const reqSkill of jobSkills || []) {
    const rs = String(reqSkill).toLowerCase().trim();
    const isMatched = Array.from(normalizedResume).some((userSkill) =>
      userSkill.includes(rs) || rs.includes(userSkill)
    );
    if (!isMatched) missing.push(reqSkill);
  }

  return missing;
}

function normalizeSkillText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSkillExplanations({ resumeText = '', resumeSkills = [], requiredSkills = [], source = 'jobRequirements' }) {
  const normalizedResumeText = normalizeSkillText(resumeText);
  const normalizedResumeSkills = new Set(
    (resumeSkills || []).map((skill) => normalizeSkillText(skill)).filter(Boolean)
  );

  return (requiredSkills || []).map((skill) => {
    const skillLabel = String(skill || '').trim();
    const normalizedSkill = normalizeSkillText(skillLabel);
    const skillTokens = normalizedSkill.split(' ').filter(Boolean);
    const matchedBecause = [];
    let matchedType = 'none';
    let status = 'missing';

    const exactHit = normalizedSkill && normalizedResumeText.includes(normalizedSkill);
    const tokenHits = skillTokens.filter((token) => normalizedResumeText.includes(token));
    const resumeSkillHit = normalizedResumeSkills.has(normalizedSkill);

    if (exactHit || resumeSkillHit) {
      matchedType = 'exact';
      status = 'matched';
      matchedBecause.push(`resume includes '${skillLabel}'`);
      if (!exactHit && resumeSkillHit) {
        matchedBecause.push(`skill extractor detected '${skillLabel}' in the resume`);
      }
    } else if (skillTokens.length > 1 && tokenHits.length >= Math.ceil(skillTokens.length / 2)) {
      matchedType = 'partial';
      status = 'matched';
      matchedBecause.push(`resume includes related terms for '${skillLabel}': ${tokenHits.map((token) => `'${token}'`).join(', ')}`);
    } else if (tokenHits.length > 0) {
      matchedType = 'partial';
      status = 'matched';
      matchedBecause.push(`resume includes partial keyword hits for '${skillLabel}': ${tokenHits.map((token) => `'${token}'`).join(', ')}`);
    } else {
      matchedBecause.push(`resume does not include '${skillLabel}'`);
    }

    const confidence = matchedType === 'exact' ? 'exact' : (matchedType === 'partial' ? 'partial' : 'low');

    if (matchedBecause.length === 0) {
      matchedBecause.push(`no confirmation information available for '${skillLabel}'`);
    }

    return {
      skill: skillLabel,
      status,
      matchedType,
      matchedBecause,
      confidence,
      source,
    };
  });
}

function buildRecommendations({ missingSkills = [], score = 0 }) {
  const recommendations = [];

  if (missingSkills.length === 0) {
    recommendations.push('Great coverage: Your resume matches most required skills. Focus on impact and project depth.');
    return recommendations;
  }

  // Simple tiering based on overall score
  if (score < 40) {
    recommendations.push('Start with foundational skills first. Consider completing 1–2 core courses before applying again.');
  } else if (score < 70) {
    recommendations.push('You are close. Target the missing skills with short, focused learning to improve ATS match.');
  } else {
    recommendations.push('You have strong alignment. Add depth to the missing skills with projects or certifications.');
  }

  // Add per-skill recs
  const topMissing = missingSkills.slice(0, 8);
  for (const skill of topMissing) {
    recommendations.push(`Recommended to develop: ${skill}. Add 1 project, 1 certification, or measurable experience demonstrating it.`);
  }

  // If lots missing, highlight clustering opportunity
  if (missingSkills.length > 8) {
    recommendations.push('Consider grouping missing skills into a mini-learning plan (e.g., tools + frameworks + deployment) and build a small portfolio project.');
  }

  return recommendations;
}

async function analyzeResume(req, res, next) {
  try {
    const userId = req.user.id;
    const { resumeText = '', jobId = null, jobDescription = '', jobSkills = [] } = req.body || {};

    if (!resumeText && !jobDescription && (!jobSkills || jobSkills.length === 0)) {
      return res.status(400).json({ message: 'Provide resumeText and at least jobSkills or jobDescription/jobId' });
    }

    // Load user (for vocabulary)
    const user = await User.findById(userId).lean();

    // Determine job requirements
    let requiredSkills = Array.isArray(jobSkills) ? jobSkills : [];

    // If jobId is provided, use Career.skills as job required skills (best available source)
    let career = null;
    if (jobId) {
      career = await Career.findById(jobId).lean();
      if (career?.skills?.length) {
        requiredSkills = career.skills;
      }
    }

    // If no jobSkills yet but jobDescription exists, attempt to derive rough skills from course/category vocabulary
    // (we keep it simple: match to existing platform skill vocabulary from user skills + course tags)
    if ((!requiredSkills || requiredSkills.length === 0) && jobDescription) {
      const knownSkills = [
        ...(user?.alumnus_bio?.skills || []),
        // Course tags are the only other structured skill-like data present in this repo
        ...(await Course.distinct('tags').catch(() => [])),
      ]
        .flat()
        .filter(Boolean);

      const extractedFromJob = extractSkillsFromResumeText(jobDescription, knownSkills);
      requiredSkills = extractedFromJob.slice(0, 25);
    }

    const knownSkillsForResumeExtraction = [
      ...(user?.alumnus_bio?.skills || []),
      ...(await Course.distinct('tags').catch(() => [])),
    ]
      .flat()
      .filter(Boolean);

    const resumeSkills = extractSkillsFromResumeText(resumeText, knownSkillsForResumeExtraction);

    // If we still have no required skills, return a low-confidence analysis
    if (!requiredSkills || requiredSkills.length === 0) {
      const analysis = await ResumeAnalysis.create({
        user: userId,
        job: career?._id || null,
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        skillExplanations: [],
        recommendations: [
          'Could not detect job required skills. Provide jobSkills or jobId (preferred).',
        ],
        jobRequirements: [],
        resumeSkills,
      });

      return res.status(201).json({
        analysisId: analysis._id,
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        recommendations: analysis.recommendations,
        resumeSkills,
        jobRequirements: [],
      });
    }

    // Calculate match score using existing utility
    const score = calculateSkillsMatchPercentage(resumeSkills, requiredSkills);

    // Compute matched + missing skill lists for UI visibility
    const skillExplanations = buildSkillExplanations({
      resumeText,
      resumeSkills,
      requiredSkills,
      source: career?._id ? 'career.skills' : (Array.isArray(jobSkills) && jobSkills.length > 0 ? 'jobSkills' : 'jobDescription'),
    });
    const matchedSkills = skillExplanations.filter((entry) => entry.status === 'matched').map((entry) => entry.skill);
    const missingSkills = skillExplanations.filter((entry) => entry.status === 'missing').map((entry) => entry.skill);

    // Course suggestions: match missing skills against course tags/title (best-effort)
    // Fix: avoid N+1 DB queries by doing a single batched query for all missing skills (up to 8).
    const missingTop = missingSkills.slice(0, 8);

    const courseSuggestions = [];
    if (missingTop.length > 0) {
      const escapeRegExp = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const skillRegexes = missingTop
        .map((skill) => ({
          skill: String(skill).trim(),
          regex: new RegExp(escapeRegExp(String(skill)), 'i'),
        }))
        .filter((x) => x.skill.length > 0);

      if (skillRegexes.length > 0) {
        // Single query that returns candidates matched by ANY missing skill.
        const orConditions = [
          ...skillRegexes.map((sr) => ({ title: { $regex: sr.regex } })),
          ...skillRegexes.map((sr) => ({
            tags: { $elemMatch: { $regex: sr.regex } },
          })),
          ...skillRegexes.map((sr) => ({ description: { $regex: sr.regex } })),
        ];

        const courses = await Course.find({
          isPublished: true,
          $or: orConditions,
        })
          // Upper bound; we post-process to pick best matches.
          .limit(60)
          .lean();

        if (courses && courses.length > 0) {
          const getSkillScoreForCourse = (course, skillEntry) => {
            // Important: RegExp#test is stateful for /g. We never use /g, but cloning keeps it safe.
            const regex = new RegExp(skillEntry.regex.source, skillEntry.regex.flags);

            const title = String(course?.title || '');
            const description = String(course?.description || '');
            const tags = Array.isArray(course?.tags) ? course.tags : [];

            let score = 0;

            if (regex.test(title)) score += 6;
            if (regex.test(description)) score += 3;
            if (tags.some((t) => regex.test(String(t)))) score += 5;

            const skillLower = String(skillEntry.skill).toLowerCase().trim();
            if (skillLower && title.toLowerCase().includes(skillLower)) score += 2;

            return score;
          };


          for (const c of courses) {
            let bestSkill = null;
            let bestScore = 0;

            for (const sr of skillRegexes) {
              const s = getSkillScoreForCourse(c, sr);
              if (s > bestScore) {
                bestScore = s;
                bestSkill = sr.skill;
              }
            }

            if (bestSkill && bestScore > 0) {
              courseSuggestions.push({
                skill: bestSkill,
                courseId: c._id,
                title: c.title,
                category: c.category,
                _score: bestScore,
              });
            }
          }

          courseSuggestions.sort((a, b) => (b._score || 0) - (a._score || 0));

          const seen = new Set();
          const deduped = [];
          for (const cs of courseSuggestions) {
            const key = String(cs.courseId);
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(cs);
          }

          courseSuggestions.length = 0;
          courseSuggestions.push(
            ...deduped.map((cs) => ({
              skill: cs.skill,
              courseId: cs.courseId,
              title: cs.title,
              category: cs.category,
            }))
          );
        }
      }
    }






    const recommendations = buildRecommendations({ missingSkills, score });

    if (courseSuggestions.length > 0) {
      recommendations.push('Suggested courses based on your skill gaps:');
      for (const cs of courseSuggestions.slice(0, 6)) {
        recommendations.push(`- ${cs.title} (${cs.category}) for ${cs.skill}`);
      }
    }

    const analysis = await ResumeAnalysis.create({
      user: userId,
      job: career?._id || null,
      score,
      matchedSkills,
      missingSkills,
      skillExplanations,
      recommendations,
      jobRequirements: requiredSkills,
      resumeSkills,
    });

    return res.status(201).json({
      analysisId: analysis._id,
      jobId: analysis.job,
      score: analysis.score,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      skillExplanations: analysis.skillExplanations || skillExplanations,
      recommendations: analysis.recommendations,
      resumeSkills: analysis.resumeSkills,
      jobRequirements: analysis.jobRequirements,
      analyzedAt: analysis.createdAt,
    });
  } catch (err) {
    logger.logError(err, { operation: 'analyzeResume' });
    next(err);
  }
}

async function getAnalysisHistory(req, res, next) {
  try {
    const userId = req.user.id;

    const history = await ResumeAnalysis.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ history });
  } catch (err) {
    next(err);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const analysis = await ResumeAnalysis.findOne({ _id: id, user: userId }).lean();
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    res.json({
      analysisId: analysis._id,
      recommendations: analysis.recommendations || [],
      score: analysis.score,
      matchedSkills: analysis.matchedSkills || [],
      missingSkills: analysis.missingSkills || [],
      skillExplanations: analysis.skillExplanations || [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeResume,
  getAnalysisHistory,
  getRecommendations,
};

