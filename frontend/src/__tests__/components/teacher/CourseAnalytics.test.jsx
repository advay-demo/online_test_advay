import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CourseAnalytics from "../../../components/teacher/CourseAnalytics";

vi.mock("react-icons/fa", () => ({
  FaUsers: () => <div>FaUsers</div>,
  FaCheckCircle: () => <div>FaCheckCircle</div>,
  FaChartLine: () => <div>FaChartLine</div>,
  FaTrophy: () => <div>FaTrophy</div>,
  FaQuestionCircle: () => <div>FaQuestionCircle</div>,
  FaLayerGroup: () => <div>FaLayerGroup</div>,
  FaListOl: () => <div>FaListOl</div>,
}));

describe("CourseAnalytics", () => {
  const analytics = {
    total_students: 100,
    completion_rate: 80,
    average_score: 75,
    enrolled_students: 90,

    module_stats: [
      {
        module_id: 1,
        module_name: "Module 1",
        completion_rate: 85,
        students_completed: 85,
        total_units: 10,
      },
    ],

    quiz_stats: [
      {
        quiz_id: 1,
        quiz_name: "Quiz 1",
        total_attempts: 50,
        average_score: 78,
        pass_rate: 75,
        total_questions: 20,
      },
    ],

    top_students: [
      {
        user_id: 1,
        first_name: "John",
        last_name: "Doe",
        username: "john123",
        score: 95,
        completion: 100,
        grade: "A+",
      },
    ],

    question_statistics: [
      {
        summary: "Question 1",
        quiz_name: "Quiz 1",
        attempts: 50,
        correct_attempts: 40,
        average_score: 80,
      },
    ],
  };

  it("renders loading state", () => {
    const { container } = render(
      <CourseAnalytics loading={true} />
    );

    expect(
      container.querySelector(".animate-spin")
    ).toBeInTheDocument();
  });

  it("renders no analytics message", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={null}
      />
    );

    expect(
      screen.getByText("No analytics data available")
    ).toBeInTheDocument();
  });

  it("renders overview cards", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={analytics}
      />
    );

    expect(
      screen.getByText("Total Students")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Completion Rate")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Average Score")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Active Students")
    ).toBeInTheDocument();

   expect(screen.getByText("100")).toBeInTheDocument();

expect(
  screen.getAllByText(/80%/i)[0]
).toBeInTheDocument();

expect(
  screen.getAllByText(/75%/i)[0]
).toBeInTheDocument();

expect(screen.getByText("90")).toBeInTheDocument();
  });

  it("renders module statistics", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={analytics}
      />
    );

    expect(
      screen.getByText("Module Completion Statistics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Module 1")
    ).toBeInTheDocument();

    expect(
      screen.getByText("85 students completed")
    ).toBeInTheDocument();

    expect(
      screen.getByText("10 units")
    ).toBeInTheDocument();
  });

  it("renders quiz statistics", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={analytics}
      />
    );

    expect(
      screen.getByText("Quiz Performance")
    ).toBeInTheDocument();

    expect(
  screen.getAllByText("Quiz 1")[0]
).toBeInTheDocument();
    expect(
      screen.getByText("20")
    ).toBeInTheDocument();
  });

  it("renders top students", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={analytics}
      />
    );

    expect(
      screen.getByText("Top Students")
    ).toBeInTheDocument();

    expect(
      screen.getByText("John Doe")
    ).toBeInTheDocument();

    expect(
      screen.getByText("john123")
    ).toBeInTheDocument();

    expect(
      screen.getByText("A+")
    ).toBeInTheDocument();
  });

  it("renders question statistics", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={analytics}
      />
    );

    expect(
      screen.getByText("Question Statistics")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Question 1")
    ).toBeInTheDocument();
  });

  it("does not render module section when empty", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={{
          ...analytics,
          module_stats: [],
        }}
      />
    );

    expect(
      screen.queryByText("Module Completion Statistics")
    ).not.toBeInTheDocument();
  });

  it("does not render quiz section when empty", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={{
          ...analytics,
          quiz_stats: [],
        }}
      />
    );

    expect(
      screen.queryByText("Quiz Performance")
    ).not.toBeInTheDocument();
  });

  it("does not render top students section when empty", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={{
          ...analytics,
          top_students: [],
        }}
      />
    );

    expect(
      screen.queryByText("Top Students")
    ).not.toBeInTheDocument();
  });

  it("does not render question statistics section when empty", () => {
    render(
      <CourseAnalytics
        loading={false}
        analytics={{
          ...analytics,
          question_statistics: [],
        }}
      />
    );

    expect(
      screen.queryByText("Question Statistics")
    ).not.toBeInTheDocument();
  });
});