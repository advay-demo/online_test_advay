Yaksh
=====

|Build Status| |Documentation Status| |Version Status| |Coverage Status|

To get an overview of the Yaksh interface please refer to the user documentation at `Yaksh Docs <http://yaksh.readthedocs.io>`_

This is a Quickstart guide to help users setup a trial instance. If you wish to deploy Yaksh in a production environment here is a `Production Deployment Guide <https://github.com/Mohitranag18/online_test/blob/master/COMPLETE_DEPLOYMENT_GUIDE.md>`_

Introduction
============

This project provides an "exam" app that lets users take an online programming quiz. It has been modernized with a React (Vite) frontend and a Django REST Framework backend.

Features
========

-  Define fairly complicated programming problems and have users solve the problem.
-  Immediate verification of code solution.
-  Supports pretty much arbitrary coding questions in Python, C, C++, Java, R, Scilab and Bash.
-  Supports Multiple choice, Fill in the blanks, Arrange options and File upload based questions.
-  Since it runs on Python, you could technically test any Python based library.
-  Create course with lessons and quiz for online learning.
-  Almost real-time monitoring for quiz.
-  Supports automatic and manual grading, regrading of quiz.
-  Add grading system to the course.
-  Scales to over 500+ simultaneous users.
-  Distributed under the BSD license.
-  Modern UI with responsive Dashboard using React and Vite.

Requirements
============

Backend:
- Python 3.9+
- Django 4.x
- Celery 4.4.2+
- Redis Server (for Celery background tasks)

Frontend:
- Node.js 18+
- npm or yarn

Installation
============

**Note**: Currently, only Linux and MacOS are supported for the project. For Windows, we recommend using WSL (Windows Subsystem for Linux).

If Python 3.9+ is not available in the system, then we recommend using miniconda.

**Installing Miniconda**

1. Download miniconda from https://docs.conda.io/en/latest/miniconda.html according to the OS version.

2. Follow the installation instructions as given in https://conda.io/projects/conda/en/latest/user-guide/install/index.html#regular-installation

3. Restart the Terminal.

**Pre-Requisites**

* **Install redis server**

  Redis is required for celery. Celery runs a background task to re-evaluate the submissions.

  ::

      sudo apt install redis-server (Debian/Ubuntu)

      yum install redis (Centos)

* **Start redis server**

  ::
     
      systemctl start redis

* **Check redis server status**

  ::

      systemctl status redis

* **Install Node.js**

  Please install Node.js (v18 or above) from `https://nodejs.org <https://nodejs.org>`_.

**Installing Yaksh**

* **Clone the repository**

  ::

      git clone https://github.com/Mohitranag18/online_test.git

* **Go to the online_test directory**

  ::

      cd online_test

* **Set up the Backend**

  ::

      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements/requirements-common.txt
      python manage.py migrate

* **Set up the Frontend**

  ::

      cd frontend
      npm install

Quick Start
^^^^^^^^^^^

1. Start up the code server that executes the user code safely (optional for standard testing):

   -  To run the code server in a sandboxed docker environment, run the command:

      ::

          $ invoke start

   -  Make sure that you have Docker installed on your system beforehand.

   -  To run the code server without docker, locally use:

      ::

          $ invoke start --unsafe

2. Run the Django backend application (in a new terminal):

   ::

       $ source venv/bin/activate
       $ python manage.py runserver

3. Run the React frontend development server (in another terminal):

   ::

       $ cd frontend
       $ npm run dev

4. Run the celery worker for evaluating code submissions (in another terminal):
  
   ::
       
       $ source venv/bin/activate
       $ celery -A online_test worker -B

5. Open your browser and open the Frontend URL ``http://localhost:5173/``

6. Login as a teacher to edit the quiz or as a student to take the quiz.
   Default Credentials:

   -  Student - Username: student \| Password: student
   -  Teacher - Username: teacher \| Password: teacher

7. User can also login to the Default Django admin at ``http://localhost:8000/admin`` using:

   -  Admin - Username: admin \| Password: admin

History
=======

At FOSSEE, Nishanth had implemented a nice django based app to test for
multiple-choice questions. Prabhu Ramachandran was inspired by a
programming contest that he saw at PyCon APAC 2011. Chris Boesch, who
administered the contest, used a nice web application
`Singpath <http://singpath.com>`__ that he had built on top of GAE that
basically checked your Python code, live. This made it fun and
interesting.

Prabhu wanted an implementation that was not tied to GAE and hence wrote
the initial cut of what is now 'Yaksh'. The idea being that anyone can
use this to test students programming skills and not have to worry about
grading their answers manually and instead do so on their machines.

The application has since been refactored and maintained by FOSSEE Developers, and recently modernized with a beautiful React front-end.

Contact
=======

For further information and support you can contact

Python Team at FOSSEE: pythonsupport@fossee.in

License
=======

This is distributed under the terms of the BSD license. Copyright
information is at the bottom of this file.

Authors
=======

`FOSSEE Developers <https://github.com/FOSSEE/online_test/graphs/contributors>`_

Copyright (c) 2011-2017 `FOSSEE <https://fossee.in>`_


.. |Build Status| image:: https://travis-ci.org/FOSSEE/online_test.svg?branch=master
   :target: https://travis-ci.org/FOSSEE/online_test
.. |Documentation Status| image:: https://readthedocs.org/projects/yaksh/badge/?version=latest
   :target: http://yaksh.readthedocs.io/en/latest/?badge=latest
.. |Version Status| image:: https://badge.fury.io/gh/fossee%2Fonline_test.svg
    :target: https://badge.fury.io/gh/fossee%2Fonline_test
.. |Coverage Status| image:: https://codecov.io/gh/fossee/online_test/branch/master/graph/badge.svg
    :target: https://codecov.io/gh/fossee/online_test
