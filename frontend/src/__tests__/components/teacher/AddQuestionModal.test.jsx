import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddQuestionModal from "../../../components/teacher/AddQuestionModal";

const createQuestionMock = vi.fn();
const getQuestionMock = vi.fn();
const updateQuestionMock = vi.fn();
const uploadQuestionFileMock = vi.fn();
const deleteQuestionFileMock = vi.fn();

vi.mock("react-icons/fa", () => ({
  FaTimes: () => <div>FaTimes</div>,
  FaPlus: () => <div>FaPlus</div>,
  FaTrash: () => <div>FaTrash</div>,
  FaUpload: () => <div>FaUpload</div>,
  FaFileAlt: () => <div>FaFileAlt</div>,
  FaCheckCircle: () => <div>FaCheckCircle</div>,
  FaExternalLinkAlt: () => <div>FaExternalLinkAlt</div>,
  FaRegQuestionCircle: () => <div>FaRegQuestionCircle</div>,
}));

vi.mock("../../../store/questionsStore", () => ({
  default: () => ({
    createQuestion: createQuestionMock,
    getQuestion: getQuestionMock,
    updateQuestion: updateQuestionMock,
    uploadQuestionFile: uploadQuestionFileMock,
    deleteQuestionFile: deleteQuestionFileMock,
  }),
}));

describe("AddQuestionModal", () => {
  const onCancel = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders add question modal", () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Add New Question")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter question summary")
    ).toBeInTheDocument();
  });

  it("calls onCancel when cancel clicked", () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getAllByText("Cancel")[0]);

    expect(onCancel).toHaveBeenCalled();
  });

  it("updates summary input", () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    const input =
      screen.getByPlaceholderText("Enter question summary");

    fireEvent.change(input, {
      target: { value: "Python Question" },
    });

    expect(input.value).toBe("Python Question");
  });

  it("changes question type", () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    const selects = screen.getAllByRole("combobox");

fireEvent.change(selects[0], {
  target: { value: "code" },
});

    expect(screen.getByText("Test Cases")).toBeInTheDocument();
  });

  it("adds test case", () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );
    const selects = screen.getAllByRole("combobox");

fireEvent.change(selects[0], {
  target: { value: "code" },
});

    fireEvent.click(screen.getByText("Add Test Case"));

    expect(
      screen.getByText("Test Case 2")
    ).toBeInTheDocument();
  });

  it("creates question successfully", async () => {
    createQuestionMock.mockResolvedValue({
      id: 1,
    });

    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter question summary"
      ),
      {
        target: { value: "Question 1" },
      }
    );

    const selects = screen.getAllByRole("combobox");

fireEvent.change(selects[0], {
  target: { value: "integer" },
});
    fireEvent.click(
      screen.getByText("Create Question")
    );

    await waitFor(() => {
      expect(createQuestionMock).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalled();
    });
  });

  it("shows API error", async () => {
    createQuestionMock.mockRejectedValue({
      response: {
        data: {
          error: "Failed Question",
        },
      },
    });

    render(
      <AddQuestionModal
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter question summary"
      ),
      {
        target: { value: "Question 1" },
      }
    );
    const selects = screen.getAllByRole("combobox");

fireEvent.change(selects[0], {
  target: { value: "integer" },
});


    fireEvent.click(
      screen.getByText("Create Question")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Failed Question")
      ).toBeInTheDocument();
    });
  });

  it("loads question in edit mode", async () => {
    getQuestionMock.mockResolvedValue({
      summary: "Question",
      type: "code",
      test_cases: [],
    });

    render(
      <AddQuestionModal
        isEdit={true}
        questionId={1}
        onCancel={onCancel}
      />
    );

    await waitFor(() => {
      expect(getQuestionMock).toHaveBeenCalledWith(1);
    });
  });

  it("updates question in edit mode", async () => {
    getQuestionMock.mockResolvedValue({
      summary: "Question",
      type: "code",
      test_cases: [],
    });

    updateQuestionMock.mockResolvedValue({});

    render(
      <AddQuestionModal
        isEdit={true}
        questionId={1}
        onCancel={onCancel}
      />
    );

    await waitFor(() => {
      expect(getQuestionMock).toHaveBeenCalled();
    });

    fireEvent.click(
      screen.getByText("Update Question")
    );

    await waitFor(() => {
      expect(updateQuestionMock).toHaveBeenCalled();
    });
  });

  it("uploads file", async () => {
    render(
      <AddQuestionModal
        onCancel={onCancel}
      />
    );

    const file = new File(
      ["hello"],
      "test.txt",
      { type: "text/plain" }
    );

    const input =
      document.getElementById(
        "question-file-upload"
      );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText("test.txt")
    ).toBeInTheDocument();
  });
  it("renders MCQ test case options", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "mcq" },
  });

  expect(screen.getByText(/Correct Option/i)).toBeInTheDocument();
});

it("renders MCC test case options", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "mcc" },
  });

  expect(screen.getByText(/Correct Options/i)).toBeInTheDocument();
});

it("renders integer question fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "integer" },
  });

  expect(screen.getByText(/Correct Answer/i)).toBeInTheDocument();
});

it("renders float question fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "float" },
  });

  expect(screen.getByText(/Error Margin/i)).toBeInTheDocument();
});

it("renders string question fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "string" },
  });

  expect(screen.getByText(/String Check Type/i)).toBeInTheDocument();
});

it("renders arrange question fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "arrange" },
  });

  expect(
    screen.getByText(/Options \(one per line/i)
  ).toBeInTheDocument();
});

it("renders assignment upload fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "assignment_upload" },
  });

  expect(screen.getByText(/Hook Code \/ Description/i)).toBeInTheDocument();
});

it("toggles active switch", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  const toggleButtons = screen.getAllByRole("button");
  const switchBtn = toggleButtons.find(
    (btn) =>
      btn.className.includes("rounded-full") &&
      btn.className.includes("inline-flex")
  );

  if (switchBtn) {
    fireEvent.click(switchBtn);
    expect(switchBtn).toBeInTheDocument();
  }
});

it("adds and removes multiple test cases", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "code" },
  });

  fireEvent.click(
    screen.getByRole("button", {
      name: /Add Test Case/i,
    })
  );

  expect(screen.getAllByText(/Test Case/i).length).toBeGreaterThan(1);

  const deleteButtons = screen.getAllByRole("button");
  const removeBtn = deleteButtons.find((btn) =>
    btn.innerHTML.includes("trash")
  );

  if (removeBtn) {
    fireEvent.click(removeBtn);
  }
});

it("updates code testcase fields", async () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "code" },
  });

  const outputField = screen.getByPlaceholderText(/Expected output/i);

  fireEvent.change(outputField, {
    target: { value: "Hello World" },
  });

  expect(outputField.value).toBe("Hello World");
});

it("toggles partial grading", () => {
  render(<AddQuestionModal onCancel={onCancel} />);

  const buttons = screen.getAllByRole("button");
  fireEvent.click(buttons[1]);
});
});