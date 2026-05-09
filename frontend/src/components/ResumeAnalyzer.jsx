import React, { useMemo, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../AuthContext';
import { toast } from 'react-toastify';
import AnalysisResults from './AnalysisResults';

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [jobId, setJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const canAnalyze = useMemo(() => {
    return Boolean(resumeText.trim()) && (Boolean(jobId) || Boolean(jobDescription.trim()));
  }, [resumeText, jobId, jobDescription]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to analyze your resume');
      return;
    }

    if (!canAnalyze) {
      toast.error('Provide resume text and a jobId or job description');
      return;
    }

    try {
      setLoading(true);
      setAnalysis(null);

      const payload = {
        resumeText,
        jobId: jobId ? jobId : null,
        jobDescription: jobDescription.trim() ? jobDescription.trim() : '',
        // jobSkills: optional in v1
      };

      const res = await apiClient.post('/resume-analyzer', payload);
      setAnalysis(res.data);
      toast.success('Resume analyzed successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Resume analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analyze My Resume</h1>
        <p className="text-gray-600 mt-2">
          Upload/paste your resume and compare it against job requirements. This version uses keyword matching and skill gap analysis.
        </p>
      </div>

      <div className="bg-white shadow-sm border rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Job ID (optional)</label>
            <input
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Paste Career _id (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">Leave empty if you prefer to paste a job description below.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Job Description (optional)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job posting text (required if jobId is empty)"
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Resume Text</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text here (skills/projects/experience)."
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !canAnalyze}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>

          <p className="text-xs text-gray-500">
            Tip: Add your skills/projects as clearly as possible to improve keyword matching.
          </p>
        </form>
      </div>

      {analysis && (
        <div className="mt-8">
          <AnalysisResults analysis={analysis} />
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;

