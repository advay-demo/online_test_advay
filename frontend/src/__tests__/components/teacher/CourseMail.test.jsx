import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseMail from "../../../components/teacher/CourseMail";

const loadEnrollmentsMock = vi.fn();
const teacherSendMailMock = vi.fn();

vi.mock("@tinymce/tinymce-react", () => ({
  Editor: ({ onEditorChange }) => (
    <textarea
      data-testid="editor"
      onChange={(e) => onEditorChange(e.target.value)}
    />
  ),
}));

vi.mock("../../../store/manageCourseStore", () => ({
  default: () => ({
    loadingEnrollments: false,
    loadEnrollments: loadEnrollmentsMock,
    enrollments: {
      enrolled: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john@test.com",
          roll_number: "101",
          institute: "ABC College",
        },
        {
          id: 2,
          first_name: "Jane",
          last_name: "Smith",
          email: "jane@test.com",
          roll_number: "102",
          institute: "XYZ College",
        },
      ],
    },
  }),
}));

vi.mock("../../../api/api", () => ({
  teacherSendMail: (...args) => teacherSendMailMock(...args),
}));

vi.mock("react-icons/fa", () => ({
  FaPaperPlane: () => <div>PaperPlane</div>,
}));

describe("CourseMail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders compose email section", () => {
    render(<CourseMail courseId={1} />);

    expect(
      screen.getByText("Compose Email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Email Subject")
    ).toBeInTheDocument();
  });

  it("loads enrollments on mount", () => {
    render(<CourseMail courseId={1} />);

    expect(loadEnrollmentsMock).toHaveBeenCalled();
  });

  it("renders students list", () => {
    render(<CourseMail courseId={1} />);

    expect(
      screen.getByText("John Doe")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Jane Smith")
    ).toBeInTheDocument();
  });

  it("filters students by search", () => {
    render(<CourseMail courseId={1} />);

    fireEvent.change(
      screen.getByPlaceholderText("Search students…"),
      {
        target: { value: "Jane" },
      }
    );

    expect(
      screen.getByText("Jane Smith")
    ).toBeInTheDocument();
  });

  it("selects all students", () => {
    render(<CourseMail courseId={1} />);

    fireEvent.click(
      screen.getByLabelText("Select all")
    );

    expect(
      screen.getByText("(2 selected)")
    ).toBeInTheDocument();
  });

  it("selects individual student", () => {
    render(<CourseMail courseId={1} />);

    const checkboxes =
      screen.getAllByRole("checkbox");

    fireEvent.click(checkboxes[1]);

    expect(
      screen.getByText("(1 selected)")
    ).toBeInTheDocument();
  });

 it("send button is disabled initially", () => {
  render(<CourseMail courseId={1} />);

  expect(
    screen.getByRole("button", {
      name: /send mail/i,
    })
  ).toBeDisabled();
});

it("send button remains disabled without recipients", () => {
  render(<CourseMail courseId={1} />);

  fireEvent.change(
    screen.getByPlaceholderText("Email Subject"),
    {
      target: { value: "Test Subject" },
    }
  );

  fireEvent.change(
    screen.getByTestId("editor"),
    {
      target: { value: "Hello Students" },
    }
  );

  expect(
    screen.getByRole("button", {
      name: /send mail/i,
    })
  ).toBeDisabled();
});
 it("send button is disabled when no student selected", () => {
  render(<CourseMail courseId={1} />);

  fireEvent.change(
    screen.getByPlaceholderText("Email Subject"),
    {
      target: { value: "Test Subject" },
    }
  );

  fireEvent.change(
    screen.getByTestId("editor"),
    {
      target: { value: "Hello Students" },
    }
  );

  expect(
    screen.getByRole("button", {
      name: /send mail/i,
    })
  ).toBeDisabled();
});

  it("sends mail successfully", async () => {
  teacherSendMailMock.mockResolvedValue({
    message: "Mail sent successfully",
  });

  render(<CourseMail courseId={1} />);

  fireEvent.change(
    screen.getByPlaceholderText("Email Subject"),
    {
      target: { value: "Subject" },
    }
  );

  fireEvent.change(
    screen.getByTestId("editor"),
    {
      target: { value: "Message Body" },
    }
  );

  const checkboxes =
    screen.getAllByRole("checkbox");

  fireEvent.click(checkboxes[1]);

  const sendButton = screen.getByRole(
    "button",
    { name: /send mail/i }
  );

  fireEvent.click(sendButton);

  await waitFor(() => {
    expect(
      teacherSendMailMock
    ).toHaveBeenCalled();
  });
});
  it("shows API error", async () => {
  teacherSendMailMock.mockRejectedValue({
    response: {
      data: {
        error: "Failed to send mail",
      },
    },
  });

  render(<CourseMail courseId={1} />);

  fireEvent.change(
    screen.getByPlaceholderText("Email Subject"),
    {
      target: { value: "Subject" },
    }
  );

  fireEvent.change(
    screen.getByTestId("editor"),
    {
      target: { value: "Message Body" },
    }
  );

  const checkboxes =
    screen.getAllByRole("checkbox");

  fireEvent.click(checkboxes[1]);

  fireEvent.click(
    screen.getByRole("button", {
      name: /send mail/i,
    })
  );

  await waitFor(() => {
    expect(
      teacherSendMailMock
    ).toHaveBeenCalled();
  });
});
});