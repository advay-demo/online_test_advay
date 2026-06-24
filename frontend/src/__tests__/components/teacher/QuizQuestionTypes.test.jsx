import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddQuestionModal from "../../../components/teacher/AddQuestionModal";

describe("Quiz Question Types", () => {

  it("renders assignment upload question type", () => {
    render(<AddQuestionModal onCancel={() => {}} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "assignment_upload" },
    });

    expect(screen.getAllByRole("combobox")[0].value)
      .toBe("assignment_upload");
  });

  it("renders MCC question type", () => {
    render(<AddQuestionModal onCancel={() => {}} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "mcc" },
    });

    expect(screen.getAllByRole("combobox")[0].value)
      .toBe("mcc");
  });

  it("renders Arrange question type", () => {
    render(<AddQuestionModal onCancel={() => {}} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], {
      target: { value: "arrange" },
    });

    expect(screen.getAllByRole("combobox")[0].value)
      .toBe("arrange");
  });

});