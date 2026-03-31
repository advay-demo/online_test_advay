import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { FaPaperPlane } from 'react-icons/fa';
import useManageCourseStore from '../../store/manageCourseStore';
import { teacherSendMail } from '../../api/api';

const CourseMail = ({ courseId }) => {
    const { enrollments, loadingEnrollments, loadEnrollments } = useManageCourseStore();

    // Form state
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [sending, setSending] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
    const editorRef = useRef(null);

    // Load enrollments on mount
    useEffect(() => {
        loadEnrollments(courseId);
    }, [courseId, loadEnrollments]);

    // Clear status message after 5 seconds if success
    useEffect(() => {
        if (statusMessage?.type === 'success') {
            const timer = setTimeout(() => setStatusMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    // Handle Select All
    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (checked) {
            const allStudentIds = enrollments.enrolled.map(s => s.id || s.user_id);
            setSelectedStudents(allStudentIds);
        } else {
            setSelectedStudents([]);
        }
    };

    // Handle Individual Selection
    const handleSelectStudent = (studentId) => {
        if (selectedStudents.includes(studentId)) {
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
            setSelectAll(false);
        } else {
            const newSelected = [...selectedStudents, studentId];
            setSelectedStudents(newSelected);
            if (newSelected.length === enrollments.enrolled.length) {
                setSelectAll(true);
            }
        }
    };

    // Handle Send Mail
    const handleSendMail = async () => {
        setStatusMessage(null);

        if (!subject.trim()) {
            setStatusMessage({ type: 'error', text: 'Please enter a subject' });
            return;
        }
        if (!body.trim()) {
            setStatusMessage({ type: 'error', text: 'Please enter a message body' });
            return;
        }
        if (selectedStudents.length === 0) {
            setStatusMessage({ type: 'error', text: 'Please select at least one student' });
            return;
        }

        setSending(true);

        try {
            const result = await teacherSendMail(courseId, {
                subject,
                body,
                recipients: selectedStudents
            });
            setStatusMessage({ type: 'success', text: result.message || 'Mail sent successfully' });
            // Optional: Clear form
            // setSubject('');
            // setBody(''); // Need to clear editor too
            // setSelectedStudents([]);
            // setSelectAll(false);
        } catch (err) {
            setStatusMessage({ type: 'error', text: err.response?.data?.error || 'Failed to send mail' });
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    if (loadingEnrollments) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border-2 border-cyan-500/30 flex items-center justify-center ">
                    <FaPaperPlane className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Compose Email</h3>
                    <p className="text-xs muted">Send emails to enrolled students</p>
                </div>
            </div>

            {/* Status Message */}
            {statusMessage && (
                <div className={`p-4 rounded-md mb-4 flex justify-between items-center ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-700/50' : 'bg-red-900/50 text-red-200 border border-red-700/50'
                    }`}>
                    <span>{statusMessage.text}</span>
                    <button onClick={() => setStatusMessage(null)} className="text-white hover:text-gray-300">
                        &times;
                    </button>
                </div>
            )}

            {/* Subject Line */}
            <div className="card p-4">
                <input
                    type="text"
                    placeholder="Email Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder-gray-500 text-white"
                />
            </div>

            {/* TinyMCE Editor */}
            <div className="card p-1 overflow-hidden">
                <Editor
                    tinymceScriptSrc="http://127.0.0.1:8000/static/yaksh/js/tinymce/js/tinymce/tinymce.min.js"
                    onInit={(evt, editor) => editorRef.current = editor}
                    value={body}
                    onEditorChange={(newValue) => setBody(newValue)}
                    init={{
                        height: 300,
                        menubar: true,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                        toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: #f4f4f4; }',
                        skin: "oxide-dark",
                        content_css: "dark"
                    }}
                />
            </div>

            {/* Attachments (Visual Only as per user image) */}
            <div className="card p-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Attachments:</label>
                <div className="flex gap-2 items-center">
                    <button className="px-4 py-2 border-2 border-[var(--border-color)] bg-[var(--input-bg)] rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all duration-300 shadow-md">Choose Files</button>
                    <span className="text-sm text-gray-500 self-center">No file chosen</span>
                </div>
            </div>

            {/* Student Selection */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-gray-900"
                        id="select-all"
                    />
                    <label htmlFor="select-all" className="text-lg font-medium text-gray-200 cursor-pointer">
                        Select all
                    </label>
                    <span className="text-sm text-muted ml-2">
                        ({selectedStudents.length} selected)
                    </span>
                </div>

                <div className="card overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-3 bg-blue-900/30 text-xs font-bold text-blue-300 uppercase tracking-wider border-b border-blue-800/50">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-3">Full Name</div>
                        <div className="col-span-4">Email</div>
                        <div className="col-span-2">Roll Number</div>
                        <div className="col-span-2">Institute</div>
                    </div>

                    {/* Table Body */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {enrollments.enrolled.length > 0 ? (
                            enrollments.enrolled.map((student, index) => (
                                <div
                                    key={student.id || student.user_id}
                                    className={`grid grid-cols-12 gap-4 p-3 items-center border-b border-white/5 hover:bg-white/5 transition
                                        ${selectedStudents.includes(student.id || student.user_id) ? 'bg-blue-900/10' : ''}`}
                                >
                                    <div className="col-span-1 flex justify-center items-center gap-2">
                                        <span className="text-muted text-xs">{index + 1}.</span>
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id || student.user_id)}
                                            onChange={() => handleSelectStudent(student.id || student.user_id)}
                                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-offset-gray-900"
                                        />
                                    </div>
                                    <div className="col-span-3 font-medium truncate">
                                        {student.first_name} {student.last_name}
                                    </div>
                                    <div className="col-span-4 text-sm text-gray-400 truncate">
                                        {student.email}
                                    </div>
                                    <div className="col-span-2 text-sm text-gray-400 truncate">
                                        {student.roll_number || '-'}
                                    </div>
                                    <div className="col-span-2 text-sm text-gray-400 truncate">
                                        {student.institute || '-'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-muted">
                                No students enrolled yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Send Button */}
            <div className="pt-4">
                <button
                    onClick={handleSendMail}
                    disabled={sending || selectedStudents.length === 0}
                    className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2 justify-center
                        ${sending || selectedStudents.length === 0
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/20'}`}
                >
                    <FaPaperPlane className="w-4 h-4" />
                    {sending ? 'Sending...' : 'Send Mail'}
                </button>
            </div>

            <div className="h-10"></div> {/* Bottom spacer */}
        </div>
    );
};

export default CourseMail;
