import React, { useState, useRef } from 'react';
import { FaUpload, FaDownload, FaFileArchive, FaFileAlt, FaCheckCircle, FaExclamationCircle, FaTrash } from 'react-icons/fa';
import TeacherSidebar from '../../components/layout/TeacherSidebar';
import Header from '../../components/layout/Header';
import useQuestionsStore from '../../store/questionsStore';
import QuestionActionButtons from '../../components/teacher/QuestionActionButtons';

const UploadQuestion = () => {
  const { bulkUploadQuestions, downloadQuestionTemplate, loading, uploadProgress, error } = useQuestionsStore();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (['zip', 'yaml', 'yml'].includes(extension)) {
        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(null);
      } else {
        setUploadError('Please select a valid file (.zip, .yaml, or .yml)');
        setSelectedFile(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      const result = await bulkUploadQuestions(selectedFile);
      setUploadSuccess(result.message);
      setUploadError(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setUploadError(err.message);
      setUploadSuccess(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadQuestionTemplate();
    } catch (err) {
      setUploadError('Failed to download template');
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    return extension === 'zip' ? <FaFileArchive className="w-6 h-6 text-purple-500" /> : <FaFileAlt className="w-6 h-6 text-blue-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="flex min-h-screen relative grid-texture">
      <TeacherSidebar />
      <main className="flex-1 w-full lg:w-auto">
        <Header isAuth />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Upload Questions</h1>
            <p className="text-sm muted">Bulk upload questions from YAML or ZIP files</p>
          </div>

          {/* Action Buttons */}
          <QuestionActionButtons activeButton="upload" />

          {/* Upload Section */}
          <div className="card-strong p-4 sm:p-5 lg:p-6">
            {/* Instructions Section */}
            <div className="mb-6 p-6 border-b border-[var(--border-color)] bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                Upload Instructions
              </h2>
              <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                <p>You can upload question files in the following ways:</p>
                
                {/* YAML File */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileAlt className="text-blue-500" />
                    <h3 className="font-semibold text-[var(--text-primary)]">YAML File</h3>
                  </div>
                  <p className="text-xs mb-2">
                    Upload YAML files with extensions <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-blue-600 dark:text-blue-400">.yaml</code> or <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-blue-600 dark:text-blue-400">.yml</code>
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Note: You cannot upload files associated with questions using YAML. YAML files can have any name.
                  </p>
                </div>

                {/* ZIP File */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileArchive className="text-purple-500" />
                    <h3 className="font-semibold text-[var(--text-primary)]">ZIP File</h3>
                  </div>
                  <p className="text-xs mb-3">
                    Upload ZIP files with the following structure:
                  </p>
                  <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
{`.zip
|-- .yaml or .yml
|-- .yaml or .yml
|-- folder1
|   |-- Files required by questions
|-- folder2
|   |-- Files required by questions`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="mb-6 p-6 border-b border-[var(--border-color)] bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    Download Template
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Get a sample YAML template to understand the question format
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:shadow-cyan-600/30 whitespace-nowrap"
                >
                  <FaDownload className="w-4 h-4" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Upload File
              </h3>

              {/* Success Message */}
              {uploadSuccess && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">Upload Successful!</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">{uploadSuccess}</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {(uploadError || error) && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                  <FaExclamationCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900 dark:text-red-100">Upload Failed</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">{uploadError || error}</p>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center hover:border-blue-500 transition-colors duration-200">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".yaml,.yml,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <FaUpload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        YAML, YML or ZIP files (Max 10MB)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {getFileIcon()}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 flex-shrink-0"
                        title="Remove file"
                      >
                        <FaTrash className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    !selectedFile || loading
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {uploadProgress || 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-5 h-5" />
                      Upload Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadQuestion;