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

import CourseDesign from "../../../components/teacher/CourseDesign";

const loadDesignCourseMock = vi.fn();
const addModulesMock = vi.fn();
const removeModulesMock = vi.fn();
const changeOrderMock = vi.fn();
const prerequisiteCompletionMock = vi.fn();
const prerequisitePassingMock = vi.fn();

const storeData = {
  course: { id: 1 },
  designCourse: {
    added_learning_modules: [
      {
        id: 1,
        name: "Module A",
        description: "Desc A",
        order: 1,
        check_prerequisite: false,
        check_prerequisite_passes: false,
      },
      {
        id: 2,
        name: "Module B",
        description: "Desc B",
        order: 2,
        check_prerequisite: false,
        check_prerequisite_passes: false,
      },
    ],
    learning_modules: [
      {
        id: 3,
        name: "Module C",
        description: "Desc C",
      },
    ],
  },
  loadingDesignCourse: false,
  designCourseError: null,
  loadDesignCourse: loadDesignCourseMock,
  handleAddModulesToCourse: addModulesMock,
  handleRemoveModulesFromCourse: removeModulesMock,
  handleChangeCourseModuleOrder: changeOrderMock,
  handleChangeCourseModulePrerequisiteCompletion:
    prerequisiteCompletionMock,
  handleChangeCourseModulePrerequisitePassing:
    prerequisitePassingMock,
};

vi.mock(
  "../../../store/manageCourseStore",
  () => ({
    default: () => storeData,
  })
);

vi.mock("react-icons/fa", () => ({
  FaArrowUp: () => <div>UpIcon</div>,
  FaArrowDown: () => <div>DownIcon</div>,
  FaPlus: () => <div>PlusIcon</div>,
  FaTrash: () => <div>TrashIcon</div>,
  FaPuzzlePiece: () => <div>PuzzleIcon</div>,
}));

describe("CourseDesign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title", () => {
    render(<CourseDesign />);

    expect(
      screen.getByText("Course Design")
    ).toBeInTheDocument();
  });

  it("loads design course on mount", () => {
    render(<CourseDesign />);

    expect(
      loadDesignCourseMock
    ).toHaveBeenCalledWith(1);
  });

  it("renders selected modules", () => {
    render(<CourseDesign />);

    expect(
      screen.getByText("Module A")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Module B")
    ).toBeInTheDocument();
  });

  it("renders pool modules", () => {
    render(<CourseDesign />);

    expect(
      screen.getByText("Module C")
    ).toBeInTheDocument();
  });

  it("adds module", async () => {
    render(<CourseDesign />);

    fireEvent.click(
      screen.getByText("Module C")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /add/i,
      })
    );

    await waitFor(() => {
      expect(addModulesMock)
        .toHaveBeenCalledWith(
          1,
          [3]
        );
    });
  });

  it("removes module", async () => {
    render(<CourseDesign />);

    fireEvent.click(
      screen.getByText("Module A")
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove/i,
      })
    );

    await waitFor(() => {
      expect(removeModulesMock)
        .toHaveBeenCalledWith(
          1,
          [1]
        );
    });
  });

  it("moves module down", async () => {
    render(<CourseDesign />);

    fireEvent.click(
      screen.getByText("Module A")
    );

    const buttons =
      screen.getAllByRole("button");

    fireEvent.click(buttons[2]);

    await waitFor(() => {
      expect(changeOrderMock)
        .toHaveBeenCalled();
    });
  });

  it("changes prerequisite completion", async () => {
    render(<CourseDesign />);

    fireEvent.click(
      screen.getByText("Module A")
    );

    const checkbox =
      screen.getByLabelText(
        /Completion/i
      );

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(
        prerequisiteCompletionMock
      ).toHaveBeenCalled();
    });
  });

  it("changes prerequisite passing", async () => {
    render(<CourseDesign />);

    fireEvent.click(
      screen.getByText("Module A")
    );

    const checkbox =
      screen.getByLabelText(
        /Passing/i
      );

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(
        prerequisitePassingMock
      ).toHaveBeenCalled();
    });
  });

  it("shows loading state", () => {
    storeData.loadingDesignCourse =
      true;

    render(<CourseDesign />);

    expect(
      screen.getByText(
        /Loading course design/i
      )
    ).toBeInTheDocument();

    storeData.loadingDesignCourse =
      false;
  });

  it("shows error state", () => {
    storeData.designCourseError =
      "Failed";

    render(<CourseDesign />);

    expect(
      screen.getByText("Failed")
    ).toBeInTheDocument();

    storeData.designCourseError =
      null;
  });
});