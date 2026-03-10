import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { baseUrl } from '../utils/globalurl';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [course, setCourse] = useState({
    title: '',
    description: '',
    description_short: '',
    category: '',
    level: 'beginner',
    isFree: true,
    price: 0,
    thumbnail: '',
    tags: [],
    learningOutcomes: [],
    requirements: [],
    modules: []
  });

  const [saving, setSaving] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'AI & Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Design',
    'Business'
  ];

  // Add new module
  const addModule = () => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: '',
        description: '',
        lessons: [],
        order: prev.modules.length
      }]
    }));
  };

  // Update module
  const updateModule = (idx, field, value) => {
    setCourse(prev => {
      const newModules = [...prev.modules];
      newModules[idx] = { ...newModules[idx], [field]: value };
      return { ...prev, modules: newModules };
    });
  };

  // Delete module
  const deleteModule = (idx) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== idx)
    }));
  };

  // Add lesson to module
  const addLessonToModule = (moduleIdx) => {
    setCourse(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIdx].lessons.push({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        resources: [],
        order: newModules[moduleIdx].lessons.length
      });
      return { ...prev, modules: newModules };
    });
  };

  // Update lesson
  const updateLesson = (moduleIdx, lessonIdx, field, value) => {
    setCourse(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIdx].lessons[lessonIdx] = {
        ...newModules[moduleIdx].lessons[lessonIdx],
        [field]: value
      };
      return { ...prev, modules: newModules };
    });
  };

  // Delete lesson
  const deleteLesson = (moduleIdx, lessonIdx) => {
    setCourse(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIdx].lessons = newModules[moduleIdx].lessons.filter((_, i) => i !== lessonIdx);
      return { ...prev, modules: newModules };
    });
  };

  // Add learning outcome
  const addLearningOutcome = () => {
    setCourse(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }));
  };

  const updateLearningOutcome = (idx, value) => {
    setCourse(prev => {
      const outcomes = [...prev.learningOutcomes];
      outcomes[idx] = value;
      return { ...prev, learningOutcomes: outcomes };
    });
  };

  const deleteLearningOutcome = (idx) => {
    setCourse(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== idx)
    }));
  };

  // Add requirement
  const addRequirement = () => {
    setCourse(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (idx, value) => {
    setCourse(prev => {
      const requirements = [...prev.requirements];
      requirements[idx] = value;
      return { ...prev, requirements: requirements };
    });
  };

  const deleteRequirement = (idx) => {
    setCourse(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx)
    }));
  };

  // Add tag
  const addTag = () => {
    if (newTag && !course.tags.includes(newTag)) {
      setCourse(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (idx) => {
    setCourse(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== idx)
    }));
  };

  // Save course
  const handleSaveCourse = async () => {
    // Validation
    if (!course.title || !course.description || !course.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await axios.post(`${baseUrl}/courses`, course, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      toast.success('Course created successfully!');
      navigate(`/instructor/my-courses`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const inputGroupClass = `mb-4`;
  const labelClass = `block text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const inputClass = `w-full px-3 py-2 rounded border outline-none transition ${
    isDark
      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
  }`;
  const buttonClass = `px-4 py-2 rounded font-semibold transition flex items-center gap-2`;

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 mb-4 text-blue-600 hover:text-blue-700`}
            >
              <FiArrowLeft /> Back
            </button>
            <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create New Course
            </h1>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
        >
          {/* Basic Info */}
          <section className="mb-8">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Basic Information
            </h2>

            <div className={inputGroupClass}>
              <label className={labelClass}>Course Title *</label>
              <input
                type="text"
                value={course.title}
                onChange={(e) => setCourse(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter course title"
                className={inputClass}
              />
            </div>

            <div className={inputGroupClass}>
              <label className={labelClass}>Description *</label>
              <textarea
                value={course.description}
                onChange={(e) => setCourse(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter detailed description"
                rows={4}
                className={inputClass}
              />
            </div>

            <div className={inputGroupClass}>
              <label className={labelClass}>Short Description</label>
              <textarea
                value={course.description_short}
                onChange={(e) => setCourse(prev => ({ ...prev, description_short: e.target.value }))}
                placeholder="Brief description for listing pages"
                rows={2}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={inputGroupClass}>
                <label className={labelClass}>Category *</label>
                <select
                  value={course.category}
                  onChange={(e) => setCourse(prev => ({ ...prev, category: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className={inputGroupClass}>
                <label className={labelClass}>Level</label>
                <select
                  value={course.level}
                  onChange={(e) => setCourse(prev => ({ ...prev, level: e.target.value }))}
                  className={inputClass}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-8 pb-8 border-b border-gray-700">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pricing
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={course.isFree}
                  onChange={(e) => setCourse(prev => ({ ...prev, isFree: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Free Course</span>
              </label>
            </div>

            {!course.isFree && (
              <div className={inputGroupClass}>
                <label className={labelClass}>Price ($)</label>
                <input
                  type="number"
                  value={course.price}
                  onChange={(e) => setCourse(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>
            )}
          </section>

          {/* Learning Outcomes */}
          <section className="mb-8 pb-8 border-b border-gray-700">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              What Students Will Learn
            </h2>

            <div className="space-y-2 mb-4">
              {course.learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => updateLearningOutcome(idx, e.target.value)}
                    placeholder="Enter learning outcome"
                    className={inputClass}
                  />
                  <button
                    onClick={() => deleteLearningOutcome(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addLearningOutcome}
              className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <FiPlus /> Add Outcome
            </button>
          </section>

          {/* Requirements */}
          <section className="mb-8 pb-8 border-b border-gray-700">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Course Requirements
            </h2>

            <div className="space-y-2 mb-4">
              {course.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateRequirement(idx, e.target.value)}
                    placeholder="Enter requirement"
                    className={inputClass}
                  />
                  <button
                    onClick={() => deleteRequirement(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addRequirement}
              className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
            >
              <FiPlus /> Add Requirement
            </button>
          </section>

          {/* Tags */}
          <section className="mb-8 pb-8 border-b border-gray-700">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tags
            </h2>

            <div className="flex gap-2 mb-4 flex-wrap">
              {course.tags.map((tag, idx) => (
                <div key={idx} className="bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  {tag}
                  <button
                    onClick={() => removeTag(idx)}
                    className="hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag"
                className={inputClass}
              />
              <button
                onClick={addTag}
                className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700`}
              >
                Add
              </button>
            </div>
          </section>

          {/* Course Modules */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Modules
              </h2>
              <button
                onClick={addModule}
                className={`${buttonClass} bg-green-600 text-white hover:bg-green-700`}
              >
                <FiPlus /> Add Module
              </button>
            </div>

            <div className="space-y-4">
              {course.modules.map((module, modIdx) => (
                <div key={modIdx} className={`rounded-lg border ${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
                  {/* Module Header */}
                  <button
                    onClick={() => setExpandedModule(expandedModule === modIdx ? null : modIdx)}
                    className={`w-full px-4 py-3 flex items-center justify-between font-semibold ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                  >
                    <span>Module {modIdx + 1}: {module.title || 'Untitled'}</span>
                    {expandedModule === modIdx ? <FiChevronUp /> : <FiChevronDown />}
                  </button>

                  {/* Module Details */}
                  {expandedModule === modIdx && (
                    <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                      <div className={inputGroupClass}>
                        <label className={labelClass}>Module Title</label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(modIdx, 'title', e.target.value)}
                          placeholder="Enter module title"
                          className={inputClass}
                        />
                      </div>

                      <div className={inputGroupClass}>
                        <label className={labelClass}>Module Description</label>
                        <textarea
                          value={module.description}
                          onChange={(e) => updateModule(modIdx, 'description', e.target.value)}
                          placeholder="Enter module description"
                          rows={2}
                          className={inputClass}
                        />
                      </div>

                      {/* Lessons */}
                      <div className="mb-4">
                        <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Lessons ({module.lessons.length})
                        </h3>

                        {module.lessons.map((lesson, lesIdx) => (
                          <div key={lesIdx} className={`p-3 rounded mb-2 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {lesson.title || `Lesson ${lesIdx + 1}`}
                              </span>
                              <button
                                onClick={() => deleteLesson(modIdx, lesIdx)}
                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                              >
                                <FiTrash2 />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(modIdx, lesIdx, 'title', e.target.value)}
                              placeholder="Lesson title"
                              className={`${inputClass} mb-2 text-sm`}
                            />

                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(modIdx, lesIdx, 'content', e.target.value)}
                              placeholder="Lesson content (markdown)"
                              rows={2}
                              className={`${inputClass} text-sm`}
                            />

                            <input
                              type="text"
                              value={lesson.videoUrl}
                              onChange={(e) => updateLesson(modIdx, lesIdx, 'videoUrl', e.target.value)}
                              placeholder="Video URL (YouTube embed or MP4)"
                              className={`${inputClass} mt-2 text-sm`}
                            />
                          </div>
                        ))}

                        <button
                          onClick={() => addLessonToModule(modIdx)}
                          className={`${buttonClass} text-blue-600 hover:bg-blue-50 justify-center w-full`}
                        >
                          <FiPlus /> Add Lesson
                        </button>
                      </div>

                      <button
                        onClick={() => deleteModule(modIdx)}
                        className="w-full px-3 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                      >
                        <FiTrash2 /> Delete Module
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FiSave /> {saving ? 'Saving...' : 'Save Course'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
