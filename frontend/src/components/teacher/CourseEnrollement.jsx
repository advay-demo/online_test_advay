import React from 'react';
import useManageCourseStore from '../../store/manageCourseStore';

const CourseEnrollment = () => {
    const {
        enrollments,
        loadingEnrollments,
        handleApproveEnrollment,
        handleRejectEnrollment,
        handleRemoveEnrollment,
    } = useManageCourseStore();

    
    return (
        <div>
            <div className="text-cyan-400 text-sm sm:text-base font-medium mb-6 flex items-center gap-2">
                COURSE ENROLLMENTS<span>&rarr;</span>
            </div>

            {loadingEnrollments ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Pending Requests */}
                    {enrollments.pending_requests.length > 0 && (
                        <div>
                            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                Pending Requests ({enrollments.pending_requests.length})
                            </h3>
                            <div className="space-y-3">
                                {enrollments.pending_requests.map((student) => (
                                    <div
                                        key={student.user_id}
                                        className="card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-base sm:text-lg">{student.first_name} {student.last_name}</h4>
                                            <p className="text-xs sm:text-sm muted">{student.username} • {student.email}</p>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => handleApproveEnrollment(student.user_id)}
                                                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm font-medium"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRejectEnrollment(student.user_id)}
                                                className="px-3 py-1.5 sm:px-4 sm:py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-xs sm:text-sm font-medium"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enrolled Students */}
                    <div>
                        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Enrolled Students ({enrollments.enrolled.length})
                        </h3>
                        {enrollments.enrolled.length > 0 ? (
                            <div className="space-y-3">
                                {enrollments.enrolled.map((student) => (
                                    <div
                                        key={student.user_id}
                                        className="card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                                    >
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                                                <h4 className="font-semibold text-base sm:text-lg">{student.first_name} {student.last_name}</h4>
                                                {student.grade && (
                                                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                        Grade: {student.grade}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm muted">
                                                <span>{student.username} • {student.email}</span>
                                                <span>Progress: {student.progress}%</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveEnrollment(student.user_id)}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition text-xs sm:text-sm font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted">
                                No enrolled students yet
                            </div>
                        )}
                    </div>

                    {/* Rejected Students */}
                    {enrollments.rejected.length > 0 && (
                        <div>
                            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Rejected ({enrollments.rejected.length})
                            </h3>
                            <div className="space-y-3">
                                {enrollments.rejected.map((student) => (
                                    <div
                                        key={student.user_id}
                                        className="card p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
                                    >
                                        <div>
                                            <h4 className="font-semibold text-base sm:text-lg">{student.first_name} {student.last_name}</h4>
                                            <p className="text-xs sm:text-sm muted">{student.username} • {student.email}</p>
                                        </div>
                                        <button
                                            onClick={() => handleApproveEnrollment(student.user_id)}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No Data */}
                    {enrollments.pending_requests.length === 0 &&
                        enrollments.enrolled.length === 0 &&
                        enrollments.rejected.length === 0 && (
                            <div className="text-center py-12 text-muted">
                                <p>No enrollment requests or enrolled students</p>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default CourseEnrollment;