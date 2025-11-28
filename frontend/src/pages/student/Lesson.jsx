import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaArrowRight, FaCheck, FaImage } from 'react-icons/fa';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';

const Lesson = () => {
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <div className="flex min-h-screen relative grid-texture">
      <Sidebar />

      <main className="flex-1">
        <Header isAuth />

        <div className="p-8">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Demo Module</h1>
            <p className="text-gray-400 text-sm mt-1">
              <Link to="/courses" className="hover:text-white transition">Yaksh Demo Course</Link> /
              <Link to="/module" className="hover:text-white transition"> Demo Module</Link> /
              <span className="text-white"> Lesson</span>
            </p>
          </div>

          {/* Lesson Content */}
          <div className="max-w-5xl mx-auto">
            <div className="card-strong p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20 border border-green-500/30">
                  <FaPlay className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Lesson Description</h2>
                  <p className="text-sm muted">Demo Lesson</p>
                </div>
              </div>

              <div className="mb-6">
                {/* Video Player */}
                <div className="aspect-video mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/rN0qRKjfX3s"
                    title="Keynote: SciPy 1.0 and Beyond: A Story of Code and Community"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen>
                  </iframe>
                </div>

                {/* Next Button */}
                <Link
                  to="/module"
                  className="bg-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition flex items-center gap-2 w-fit"
                >
                  Next Lesson
                  <FaArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Comments Section */}
            <div className="card p-8">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <h3 className="text-xl font-bold">Comments</h3>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 soft">Add your comment:</label>

                {/* Rich Text Editor Toolbar */}
                <div className="rounded-t-lg px-4 py-2 flex items-center gap-2 text-sm flex-wrap bg-white/[0.02] border border-white/[0.08]">
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>File</option>
                  </select>
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>Edit</option>
                  </select>
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>View</option>
                  </select>
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>Insert</option>
                  </select>
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>Format</option>
                  </select>
                  <select className="bg-white/[0.03] border border-white/[0.08] text-soft px-3 py-1.5 rounded text-sm">
                    <option>Tools</option>
                  </select>
                </div>

                <div className="px-4 py-2 flex items-center gap-2 flex-wrap bg-white/[0.02] border border-white/[0.08] border-t-0">
                  <button className="p-1.5 hover:bg-white/10 rounded">
                    <svg className="w-5 h-5 soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m6-6l6 6" />
                    </svg>
                  </button>
                  <button className="p-1.5 hover:bg-white/10 rounded">
                    <svg className="w-5 h-5 soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6 6l6-6" />
                    </svg>
                  </button>

                  <div className="h-6 mx-1 border-l border-white/10"></div>

                  <select className="bg-white/[0.03] border-0 text-soft px-2 py-1 rounded text-sm">
                    <option>Paragraph</option>
                  </select>

                  <div className="h-6 mx-1 border-l border-white/10"></div>

                  <button className="p-1.5 hover:bg-white/10 rounded font-bold soft">B</button>
                  <button className="p-1.5 hover:bg-white/10 rounded italic soft">I</button>

                  <div className="h-6 mx-1 border-l border-white/10"></div>

                  <button className="p-1.5 hover:bg-white/10 rounded">
                    <svg className="w-5 h-5 soft" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                </div>

                {/* Text Area */}
                <textarea
                  className="w-full px-4 py-3 min-h-[200px] rounded-b-lg border-t-0 border border-white/[0.08]"
                  placeholder="Enter your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>

                <p className="text-xs muted text-right mt-1">POWERED BY TINY</p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 soft">Attach Image (optional):</label>
                <div className="flex items-center gap-3">
                  <label className="px-6 py-2.5 rounded-lg cursor-pointer transition bg-white/[0.05] border border-white/10 hover:bg-white/[0.08]">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <FaImage className="w-4 h-4" />
                      Choose File
                    </span>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                  <span className="text-sm muted">No file chosen</span>
                </div>
              </div>

              {/* Anonymous Checkbox */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-600 bg-transparent text-indigo-500"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span className="text-sm soft">Post anonymously</span>
                </label>
              </div>

              {/* Submit Button */}
              <button className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition flex items-center gap-2">
                <FaCheck className="w-5 h-5" />
                Submit Comment
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;