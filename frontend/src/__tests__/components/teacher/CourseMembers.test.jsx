import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import CourseMembers from "../../../components/teacher/CourseMembers";

const getCourseTeachersMock = vi.fn();
const removeTeachersFromCourseMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({
    courseId: "1",
  }),
}));

vi.mock("../../../api/api", () => ({
  getCourseTeachers: (...args) =>
    getCourseTeachersMock(...args),

  removeTeachersFromCourse: (...args) =>
    removeTeachersFromCourseMock(...args),
}));

vi.mock("react-icons/fa", () => ({
  FaUser: () => <div>UserIcon</div>,
  FaTrash: () => <div>TrashIcon</div>,
  FaCheck: () => <div>CheckIcon</div>,
  FaUsers: () => <div>UsersIcon</div>,
}));

describe("CourseMembers", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.confirm = vi.fn(() => true);

    getCourseTeachersMock.mockResolvedValue({
      teachers: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john@test.com",
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane@test.com",
        },
      ],
    });
  });

  it("renders title", async () => {
    render(<CourseMembers />);

    expect(
      screen.getByText("Course Members")
    ).toBeInTheDocument();
  });

  it("loads teachers on mount", async () => {
    render(<CourseMembers />);

    await waitFor(() => {
      expect(
        getCourseTeachersMock
      ).toHaveBeenCalledWith("1");
    });
  });

  it("renders teachers list", async () => {
    render(<CourseMembers />);

    expect(
      await screen.findByText("John Doe")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Jane Smith")
    ).toBeInTheDocument();
  });

  it("selects a single teacher", async () => {
    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    expect(
      checkboxes[1]
    ).toBeChecked();
  });

  it("selects all teachers", async () => {
    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[0]);

    expect(
      checkboxes[1]
    ).toBeChecked();

    expect(
      checkboxes[2]
    ).toBeChecked();
  });

  it("unselects all teachers", async () => {
    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[0]);

    expect(
      checkboxes[1]
    ).not.toBeChecked();

    expect(
      checkboxes[2]
    ).not.toBeChecked();
  });

  it("shows empty state", async () => {
    getCourseTeachersMock.mockResolvedValue({
      teachers: [],
    });

    render(<CourseMembers />);

    expect(
      await screen.findByText(
        "No Teacher(s) added"
      )
    ).toBeInTheDocument();
  });

  it("shows loading state", () => {
    getCourseTeachersMock.mockImplementation(
      () =>
        new Promise(() => {})
    );

    render(<CourseMembers />);

    expect(
      document.querySelector(
        ".animate-spin"
      )
    ).toBeInTheDocument();
  });

  it("removes selected teachers successfully", async () => {
    removeTeachersFromCourseMock.mockResolvedValue({
      success: true,
      message:
        "Teachers removed successfully",
    });

    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    fireEvent.click(
      screen.getByText(
        "Remove Teachers"
      )
    );

    await waitFor(() => {
      expect(
        removeTeachersFromCourseMock
      ).toHaveBeenCalledWith(
        "1",
        [1]
      );
    });

    expect(
      await screen.findByText(
        /Teachers removed successfully/i
      )
    ).toBeInTheDocument();
  });

  it("shows warning when no teacher selected", async () => {
    render(<CourseMembers />);

    await screen.findByText("John Doe");

    expect(
      screen.getByText(
        "Remove Teachers"
      )
    ).toBeDisabled();
  });

  it("handles remove API error", async () => {
    removeTeachersFromCourseMock.mockRejectedValue({
      response: {
        data: {
          error:
            "Failed to remove teachers",
        },
      },
    });

    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    fireEvent.click(
      screen.getByText(
        "Remove Teachers"
      )
    );

    expect(
      await screen.findByText(
        "Failed to remove teachers"
      )
    ).toBeInTheDocument();
  });

  it("handles load teachers error", async () => {
    getCourseTeachersMock.mockRejectedValue(
      new Error("Load failed")
    );

    render(<CourseMembers />);

    expect(
      await screen.findByText(
        "Failed to load teachers"
      )
    ).toBeInTheDocument();
  });

  it("does not remove when confirm is cancelled", async () => {
    window.confirm = vi.fn(() => false);

    render(<CourseMembers />);

    await screen.findByText("John Doe");

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    fireEvent.click(
      screen.getByText(
        "Remove Teachers"
      )
    );

    expect(
      removeTeachersFromCourseMock
    ).not.toHaveBeenCalled();
  });
});