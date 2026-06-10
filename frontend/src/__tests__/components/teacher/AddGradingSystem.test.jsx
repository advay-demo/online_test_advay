import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddGradingSystem from "../../../components/teacher/AddGradingSystem";

const addMock = vi.fn();
const updateMock = vi.fn();

vi.mock("react-icons/fa", () => ({
  FaBookOpen: () => <div>BookIcon</div>,
  FaTimes: () => <div>CloseIcon</div>,
  FaPlus: () => <div>PlusIcon</div>,
  FaMinus: () => <div>MinusIcon</div>,
}));

vi.mock("react-icons/md", () => ({
  MdGrading: () => <div>MdGrading</div>,
}));

vi.mock("../../../store/teacherGradeStore", () => {
  const store = () => ({
    addGradingSystem: addMock,
    updateGradingSystem: updateMock,
    loading: false,
    error: null,
  });

  store.setState = vi.fn();

  return {
    default: store,
  };
});

describe("AddGradingSystem", () => {
  const onCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add grading system modal", () => {
    render(<AddGradingSystem onCancel={onCancel} />);

    expect(screen.getByText("Add Grading System")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(
  screen.getAllByPlaceholderText("Description") 
).toHaveLength(2);
  });

  it("calls onCancel when cancel button clicked", () => {
    render(<AddGradingSystem onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("updates form input values", () => {
    render(<AddGradingSystem onCancel={onCancel} />);

    const nameInput = screen.getByPlaceholderText("Name");
    const descInput =
  screen.getAllByPlaceholderText("Description")[0];

    fireEvent.change(nameInput, {
      target: { value: "Semester System" },
    });

    fireEvent.change(descInput, {
      target: { value: "Grade Description" },
    });

    expect(nameInput.value).toBe("Semester System");
    expect(descInput.value).toBe("Grade Description");
  });

  it("adds new grade range", () => {
    render(<AddGradingSystem onCancel={onCancel} />);

    expect(screen.getAllByPlaceholderText("Lower")).toHaveLength(1);

    fireEvent.click(screen.getByText("Add Range"));

    expect(screen.getAllByPlaceholderText("Lower")).toHaveLength(2);
  });

  it("removes grade range", () => {
    render(<AddGradingSystem onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Add Range"));

    const removeButtons = screen.getAllByLabelText(
      "Remove grade range"
    );

    fireEvent.click(removeButtons[1]);

    expect(screen.getAllByPlaceholderText("Lower")).toHaveLength(1);
  });

  it("saves grading system successfully", async () => {
    addMock.mockResolvedValue({});

    render(<AddGradingSystem onCancel={onCancel} />);

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "CGPA System" },
    });

    fireEvent.change(screen.getByPlaceholderText("Lower"), {
      target: { value: "0" },
    });

    fireEvent.change(screen.getByPlaceholderText("Upper"), {
      target: { value: "100" },
    });

    fireEvent.change(screen.getByPlaceholderText("Grade"), {
      target: { value: "A" },
    });

    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(addMock).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it("loads and updates grading system in edit mode", async () => {
    updateMock.mockResolvedValue({});

    const gradingSystem = {
      id: 1,
      name: "Old System",
      description: "Old Description",
      grade_ranges: [
        {
          lower_limit: 80,
          upper_limit: 100,
          grade: "A",
          description: "Excellent",
        },
      ],
    };

    render(
      <AddGradingSystem
        isEdit={true}
        gradingSystem={gradingSystem}
        onCancel={onCancel}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Old System")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalled();
    });
  });
});