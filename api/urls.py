from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from api import views

app_name = 'api'

urlpatterns = [
    # Authentication endpoints
    url(r'auth/register/$', views.register_user, name='register'),
    url(r'auth/login/$', views.login_user, name='login'),
    url(r'auth/logout/$', views.logout_user, name='logout'),
    url(r'auth/profile/$', views.get_user_profile, name='get_user_profile'),
    url(r'auth/profile/update/$', views.update_user_profile, name='update_user_profile'),
    
    # Student Dashboard & Stats
    url(r'student/dashboard/$', views.student_dashboard, name='student_dashboard'),
    url(r'student/stats/$', views.student_stats, name='student_stats'),
    
    # Course Catalog & Enrollment
    url(r'student/courses/catalog/$', views.course_catalog, name='course_catalog'),
    url(r'student/courses/enrolled/$', views.enrolled_courses, name='enrolled_courses'),
    url(r'student/courses/(?P<course_id>[0-9]+)/enroll/$', views.enroll_course, name='enroll_course'),
    
    # Course Modules & Lessons
    url(r'student/courses/(?P<course_id>[0-9]+)/modules/$', views.course_modules, name='course_modules'),
    url(r'student/modules/(?P<module_id>[0-9]+)/$', views.module_detail, name='module_detail'),
    url(r'student/lessons/(?P<lesson_id>[0-9]+)/$', views.lesson_detail, name='lesson_detail'),
    url(r'student/lessons/(?P<lesson_id>[0-9]+)/complete/$', views.complete_lesson, name='complete_lesson'),
    
    # Badges & Insights
    url(r'student/insights/badges/$', views.user_badges, name='user_badges'),
    url(r'student/insights/achievements/$', views.user_achievements, name='user_achievements'),
    
    # Existing endpoints
    url(r'^questions/$', views.QuestionList.as_view(), name='questions'),
    url(r'questions/(?P<pk>[0-9]+)/$', views.QuestionDetail.as_view(),
        name='question'),
    url(r'get_courses/$', views.CourseList.as_view(), name='get_courses'),
    url(r'start_quiz/(?P<course_id>[0-9]+)/(?P<quiz_id>[0-9]+)/$', views.StartQuiz.as_view(),
        name='start_quiz'),
    url(r'quizzes/$', views.QuizList.as_view(), name='quizzes'),
    url(r'quizzes/(?P<pk>[0-9]+)/$', views.QuizDetail.as_view(), name='quiz'),
    url(r'questionpapers/$', views.QuestionPaperList.as_view(),
        name='questionpapers'),
    url(r'questionpapers/(?P<pk>[0-9]+)/$',
        views.QuestionPaperDetail.as_view(), name='questionpaper'),
    url(r'answerpapers/$', views.AnswerPaperList.as_view(),
        name='answerpapers'),
    url(r'validate/(?P<answerpaper_id>[0-9]+)/(?P<question_id>[0-9]+)/$',
        views.AnswerValidator.as_view(), name='validators'),
    url(r'validate/(?P<uid>[0-9]+)/$',
        views.AnswerValidator.as_view(), name='validator'),
    url(r'course/(?P<pk>[0-9]+)/$',
        views.GetCourse.as_view(), name='get_course'),
    url(r'quit/(?P<answerpaper_id>\d+)/$', views.QuitQuiz.as_view(),
        name="quit_quiz"),
    url(r'student/answerpapers/(?P<answerpaper_id>[0-9]+)/submission/$', views.quiz_submission_status,
        name='quiz_submission_status'),


    # Forum API endpoints
    url(r'^forum/courses/(?P<course_id>\d+)/posts/$', views.ForumPostListCreateView.as_view(), name='api_forum_post_list_create'),
    url(r'^forum/courses/(?P<course_id>\d+)/posts/(?P<id>\d+)/$', views.ForumPostDetailView.as_view(), name='api_forum_post_detail'),
    url(r'^forum/courses/(?P<course_id>\d+)/posts/(?P<post_id>\d+)/comments/$', views.ForumCommentListCreateView.as_view(), name='api_forum_comment_list_create'),
    url(r'^forum/courses/(?P<course_id>\d+)/comments/(?P<comment_id>\d+)/$', views.ForumCommentDetailView.as_view(), name='api_forum_comment_detail'),

    # For lessons forum
    url(r'^forum/lessons/(?P<lesson_id>\d+)/posts/$', views.LessonForumPostListCreateView.as_view(), name='api_lesson_forum_post_list_create'),
    url(r'^forum/lessons/(?P<lesson_id>\d+)/posts/(?P<post_id>\d+)/$', views.LessonForumPostDetailView.as_view(), name='api_lesson_forum_post_detail'),
    url(r'^forum/lessons/(?P<lesson_id>\d+)/posts/(?P<post_id>\d+)/comments/$', views.LessonForumCommentListCreateView.as_view(), name='api_lesson_forum_comment_list_create'),
    url(r'^forum/lessons/(?P<lesson_id>\d+)/comments/(?P<comment_id>\d+)/$', views.LessonForumCommentDetailView.as_view(), name='api_lesson_forum_comment_detail'),   
    



    # Teacher APIs
    url(r'teacher/dashboard/$', views.teacher_dashboard, name='teacher_dashboard'),
    url(r'teacher/courses/$', views.teacher_courses_list, name='teacher_courses_list'),
    url(r'teacher/courses/create/$', views.teacher_create_course, name='teacher_create_course'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/$', views.teacher_get_course, name='teacher_get_course'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/update/$', views.teacher_update_course, name='teacher_update_course'),
    url(r'teacher/courses/create_demo_course/$', views.CreateDemoCourseAPIView.as_view(), name="api_create_demo_course"),
    url(r'^teacher/grading-systems/$', views.GradingSystemListCreateView.as_view(), name='grading-system-list-create'),
    url(r'^teacher/grading-systems/(?P<pk>[0-9]+)/$', views.GradingSystemDetailView.as_view(), name='grading-system-detail'),

    url(r'teacher/courses/(?P<course_id>[0-9]+)/enrollments/$', views.teacher_get_course_enrollments, name='teacher_get_course_enrollments'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/enrollments/approve/$', views.teacher_approve_enrollment, name='teacher_approve_enrollment'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/enrollments/reject/$', views.teacher_reject_enrollment, name='teacher_reject_enrollment'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/enrollments/remove/$', views.teacher_remove_enrollment, name='teacher_remove_enrollment'),


    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/$', views.teacher_get_course_modules, name='teacher_get_course_modules'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/create/$', views.teacher_create_module, name='teacher_create_module'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/update/$', views.teacher_update_module, name='teacher_update_module'),
    
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/lessons/$', views.api_lesson_handler, name='api_lesson_handler'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/lessons/(?P<lesson_id>[0-9]+)/$', views.api_lesson_handler, name='api_lesson_handler'),

    url(r'teacher/modules/(?P<module_id>[0-9]+)/design/$', views.api_design_module, name='api_design_module'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/design/(?P<course_id>[0-9]+)/$', views.api_design_module, name='api_design_module'),

    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/exercises/$', views.api_exercise_handler, name='api_exercise_handler'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/exercises/(?P<quiz_id>[0-9]+)/$', views.api_exercise_handler, name='api_exercise_handler'),

    url(r'teacher/courses/(?P<course_id>\d+)/modules/(?P<module_id>\d+)/quizzes/$', views.teacher_create_quiz, name='teacher_create_quiz_handler'),
    url(r'teacher/courses/(?P<course_id>\d+)/modules/(?P<module_id>\d+)/quizzes/(?P<quiz_id>\d+)/$', views.teacher_update_quiz, name='teacher_update_quiz_handler'),


    url(r'teacher/courses/(?P<course_id>\d+)/designcourse/$', views.api_design_course, name='api_design_course'),

    url(r'teacher/courses/(?P<course_id>[0-9]+)/analytics/$', views.teacher_get_course_analytics, name='teacher_get_course_analytics'),


    url(r'teacher/questions/$', views.teacher_questions_list, name='teacher_questions_list'), #ok 
    url(r'teacher/questions/(?P<question_id>[0-9]+)/$', views.teacher_get_question, name='teacher_get_question'),#ok
    url(r'teacher/questions/files/(?P<file_id>[0-9]+)/delete/$', views.delete_question_file, name='delete_question_file'), #ok
    url(r'teacher/questions/(?P<question_id>[0-9]+)/files/upload/$', views.upload_question_file, name='upload_question_file'), #ok 
    url(r'teacher/questions/(?P<question_id>[0-9]+)/update/$', views.teacher_update_question, name='teacher_update_question'), #ok
    url(r'teacher/questions/(?P<question_id>[0-9]+)/delete/$', views.teacher_delete_question, name='teacher_delete_question'), #ok
    url(r'teacher/questions/create/$', views.teacher_create_question, name='teacher_create_question'), #ok
    
    url(r'teacher/questions/bulk-upload/$', views.bulk_upload_questions, name='bulk_upload_questions'),
    url(r'teacher/questions/template/$', views.download_question_template, name='download_question_template'),


    




    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/(?P<module_id>[0-9]+)/delete/$', views.teacher_delete_module, name='teacher_delete_module'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/lessons/create/$', views.teacher_create_lesson, name='teacher_create_lesson'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/lessons/(?P<lesson_id>[0-9]+)/update/$', views.teacher_update_lesson, name='teacher_update_lesson'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/lessons/(?P<lesson_id>[0-9]+)/delete/$', views.teacher_delete_lesson, name='teacher_delete_lesson'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/lessons/(?P<lesson_id>[0-9]+)/$', views.teacher_get_lesson, name='teacher_get_lesson'),
    url(r'teacher/lessons/(?P<lesson_id>[0-9]+)/files/upload/$', views.teacher_upload_lesson_files, name='teacher_upload_lesson_files'),
    url(r'teacher/modules/(?P<module_id>[0-9]+)/quizzes/create/$', views.teacher_create_quiz, name='teacher_create_quiz'), #have to check if this is correct
    url(r'teacher/modules/(?P<module_id>[0-9]+)/quizzes/(?P<quiz_id>[0-9]+)/update/$', views.teacher_update_quiz, name='teacher_update_quiz'), #///////// done till here

    url(r'teacher/modules/(?P<module_id>[0-9]+)/quizzes/(?P<quiz_id>[0-9]+)/delete/$', views.teacher_delete_quiz, name='teacher_delete_quiz'),
    
    url(r'teacher/quizzes/(?P<quiz_id>[0-9]+)/questions/$', views.teacher_get_quiz_questions, name='teacher_get_quiz_questions'), #have to check if this is correct
    url(r'teacher/quizzes/(?P<quiz_id>[0-9]+)/questions/add/$', views.teacher_add_question_to_quiz, name='teacher_add_question_to_quiz'), #have to check if this is correct
    url(r'teacher/quizzes/(?P<quiz_id>[0-9]+)/questions/(?P<question_id>[0-9]+)/remove/$', views.teacher_remove_question_from_quiz, name='teacher_remove_question_from_quiz'),
    url(r'teacher/quizzes/(?P<quiz_id>[0-9]+)/questions/reorder/$', views.teacher_reorder_quiz_questions, name='teacher_reorder_quiz_questions'),
    url(r'teacher/quizzes/grouped/$', views.teacher_quizzes_grouped, name='teacher_quizzes_grouped'),
    
    url(r'teacher/modules/(?P<module_id>[0-9]+)/units/reorder/$', views.teacher_reorder_module_units, name='teacher_reorder_module_units'),
    url(r'teacher/courses/(?P<course_id>[0-9]+)/modules/reorder/$', views.teacher_reorder_course_modules, name='teacher_reorder_course_modules'),
    

    
]

urlpatterns = format_suffix_patterns(urlpatterns)
