import React from 'react';

const ProgressBar = ({ value }) => {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div
        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const SkillPills = ({ title, skills }) => {
  const list = Array.isArray(skills) ? skills : [];
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      {list.length === 0 ? (
        <p className="text-gray-500 text-sm">None detected.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.slice(0, 25).map((s, idx) => (
            <span
              key={`${s}-${idx}`}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 border border-gray-200 text-gray-800"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const SimpleBarChart = ({ matched, missing }) => {
  const m = Array.isArray(matched) ? matched.length : 0;
  const mi = Array.isArray(missing) ? missing.length : 0;
  const total = Math.max(1, m + mi);
  const mPct = Math.round((m / total) * 100);
  const miPct = 100 - mPct;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Matched skills</span>
        <span className="text-sm font-bold text-gray-900">{m}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-green-500"
          style={{ width: `${mPct}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Missing skills</span>
        <span className="text-sm font-bold text-gray-900">{mi}</span>
      </div>
      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full bg-red-500"
          style={{ width: `${miPct}%` }}
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">Visual summary (counts only).</p>
    </div>
  );
};

const AnalysisResults = ({ analysis }) => {
  if (!analysis) return null;

  const score = analysis.score ?? 0;
  const matchedSkills = analysis.matchedSkills || [];
  const missingSkills = analysis.missingSkills || [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];

  return (
    <div className="bg-white shadow-sm border rounded-2xl p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Results</h2>
          <p className="text-gray-600">Overall fit score based on keyword + skill gap matching.</p>
        </div>
        <div className="lg:min-w-[260px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Fit Score</span>
            <span className="text-2xl font-extrabold text-gray-900">{score}%</span>
          </div>
          <ProgressBar value={score} />
          <p className="text-xs text-gray-500 mt-2">
            Score increases with matched required skills.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <SimpleBarChart matched={matchedSkills} missing={missingSkills} />
        </div>
        <div>
          <SkillPills title="Matched Skills" skills={matchedSkills} />
          <div className="mt-6">
            <SkillPills title="Missing Skills" skills={missingSkills} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-gray-900 mb-3">Recommendations</h3>
        {recommendations.length === 0 ? (
          <p className="text-gray-500 text-sm">No recommendations available.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {recommendations.slice(0, 20).map((r, idx) => (
              <li key={`${idx}-${r}`}>
                {typeof r === 'string' ? r : r.text || JSON.stringify(r)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;

