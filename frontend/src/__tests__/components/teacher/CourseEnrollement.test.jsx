import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseEnrollment from "../../../components/teacher/CourseEnrollement";

const approveEnrollmentsMock = vi.fn();
const rejectEnrollmentsMock = vi.fn();
const removeEnrollmentsMock = vi.fn();

vi.mock("../../../store/manageCourseStore", () => ({
  default: () => ({
    loadingEnrollments: false,

    enrollments: {
      pending_requests: [
        {
          id: 1,
          user_id: 1,
          first_name: "John",
          last_name: "Doe",
          username: "john123",
          email: "john@test.com",
        },
      ],

      enrolled: [
        {
          id: 2,
          user_id: 2,
          first_name: "Jane",
          last_name: "Smith",
          username: "jane123",
          email: "jane@test.com",
          progress: 75,
          grade: "A",
        },
      ],

      rejected: [
        {
          id: 3,
          user_id: 3,
          first_name: "Bob",
          last_name: "Brown",
          username: "bob123",
          email: "bob@test.com",
        },
      ],
    },

    approveEnrollments: approveEnrollmentsMock,
    rejectEnrollments: rejectEnrollmentsMock,
    removeEnrollments: removeEnrollmentsMock,
  }),
}));

vi.mock("react-icons/fa", () => ({
  FaUserPlus: () => <div>UserPlus</div>,
  FaUserCheck: () => <div>UserCheck</div>,
  FaUserTimes: () => <div>UserTimes</div>,
  FaUsers: () => <div>Users</div>,
}));

describe("CourseEnrollment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders enrollment title", () => {
    render(<CourseEnrollment courseId={1} />);

    expect(
      screen.getByText("Course Enrollments")
    ).toBeInTheDocument();
  });

  it("renders pending requests", () => {
    render(<CourseEnrollment courseId={1} />);

    expect(
      screen.getByText(/Pending Requests/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("John Doe")
    ).toBeInTheDocument();
  });

  it("renders enrolled students", () => {
    render(<CourseEnrollment courseId={1} />);

    expect(
      screen.getByText(/Enrolled Students/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Jane Smith")
    ).toBeInTheDocument();
  });

  it("renders rejected students", () => {
    render(<CourseEnrollment courseId={1} />);

    expect(
      screen.getByText(/Rejected/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("Bob Brown")
    ).toBeInTheDocument();
  });

  it("approves pending student", () => {
    render(<CourseEnrollment courseId={1} />);

    fireEvent.click(
      screen.getAllByText("Approve")[0]
    );

    expect(
      approveEnrollmentsMock
    ).toHaveBeenCalled();
  });

  it("rejects pending student", () => {
    render(<CourseEnrollment courseId={1} />);

    fireEvent.click(
      screen.getByText("Reject")
    );

    expect(
      rejectEnrollmentsMock
    ).toHaveBeenCalled();
  });

  it("removes enrolled student", () => {
    render(<CourseEnrollment courseId={1} />);

    fireEvent.click(
      screen.getByText("Remove")
    );

    expect(
      removeEnrollmentsMock
    ).toHaveBeenCalled();
  });

  it("search filters students", () => {
    render(<CourseEnrollment courseId={1} />);

    fireEvent.change(
      screen.getByPlaceholderText(
        /Search by name/i
      ),
      {
        target: { value: "Jane" },
      }
    );

    expect(
      screen.getByText("Jane Smith")
    ).toBeInTheDocument();
  });

  it("clears search", () => {
    render(<CourseEnrollment courseId={1} />);

    const input = screen.getByPlaceholderText(
      /Search by name/i
    );

    fireEvent.change(input, {
      target: { value: "Jane" },
    });

    fireEvent.click(
      screen.getByLabelText("Clear search")
    );

    expect(input.value).toBe("");
  });

  it("shows grade and progress", () => {
    render(<CourseEnrollment courseId={1} />);

    expect(
      screen.getByText("Grade: A")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Progress: 75%")
    ).toBeInTheDocument();
  });
});