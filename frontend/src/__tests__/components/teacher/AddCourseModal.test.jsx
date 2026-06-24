import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("react-icons/fa", () => ({
  FaBook: () => <div>FaBook</div>,
  FaTimes: () => <div>FaTimes</div>,
}));
import AddCourseModal from "../../../components/teacher/AddCourseModal";

vi.mock("../../../store/teacherGradeStore", () => ({
  default: () => ({
    gradingSystems: [
      { id: 1, name: "System A" },
      { id: 2, name: "System B" },
    ],
    loadGradingSystems: vi.fn(),
    loading: false,
  }),
}));

const createCourseMock = vi.fn();
const updateCourseMock = vi.fn();
const getTeacherCourseMock = vi.fn();

vi.mock("../../../api/api", () => ({
  createCourse: (...args) => createCourseMock(...args),
  updateCourse: (...args) => updateCourseMock(...args),
  getTeacherCourse: (...args) => getTeacherCourseMock(...args),
}));

describe("AddCourseModal", () => {
  const onCancel = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create course modal", () => {
    render(
      <AddCourseModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Add New Course")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter course title")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button clicked", () => {
    render(
      <AddCourseModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("updates input values", () => {
    render(
      <AddCourseModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    const titleInput = screen.getByPlaceholderText("Enter course title");

    fireEvent.change(titleInput, {
      target: { value: "React Course" },
    });

    expect(titleInput.value).toBe("React Course");
  });

  it("creates course successfully", async () => {
    createCourseMock.mockResolvedValue({});

    render(
      <AddCourseModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter course title"),
      { target: { value: "React Course" } }
    );

    fireEvent.click(screen.getByText("Create Course"));

    await waitFor(() => {
      expect(createCourseMock).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it("shows API error message", async () => {
    createCourseMock.mockRejectedValue({
      response: {
        data: {
          error: "Failed API",
        },
      },
    });

    render(
      <AddCourseModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText("Enter course title"),
      { target: { value: "Course" } }
    );

    fireEvent.click(screen.getByText("Create Course"));

    await waitFor(() => {
      expect(screen.getByText("Failed API")).toBeInTheDocument();
    });
  });

  it("loads course in edit mode", async () => {
    getTeacherCourseMock.mockResolvedValue({
      name: "DBMS",
      enrollment: "open",
      code: "CS101",
    });

    render(
      <AddCourseModal
        isEdit={true}
        courseId={1}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(getTeacherCourseMock).toHaveBeenCalledWith(1);
    });
  });

  it("updates course in edit mode", async () => {
    getTeacherCourseMock.mockResolvedValue({
      name: "DBMS",
    });

    updateCourseMock.mockResolvedValue({});

    render(
      <AddCourseModal
        isEdit={true}
        courseId={1}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    await waitFor(() => {
      expect(getTeacherCourseMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("Update Course"));

    await waitFor(() => {
      expect(updateCourseMock).toHaveBeenCalled();
    });
  });
  
});