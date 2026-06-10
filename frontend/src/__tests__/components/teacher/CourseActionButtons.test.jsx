import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CourseActionButtons from "../../../components/teacher/CourseActionButtons";

vi.mock("react-icons/vsc", () => ({
  VscLibrary: () => <div>LibraryIcon</div>,
}));

vi.mock("react-icons/bs", () => ({
  BsFileEarmarkSpreadsheet: () => <div>GradingIcon</div>,
}));

const renderComponent = (activeButton = null) =>
  render(
    <MemoryRouter>
      <CourseActionButtons activeButton={activeButton} />
    </MemoryRouter>
  );

describe("CourseActionButtons", () => {
  it("renders both action buttons", () => {
    renderComponent();

    expect(screen.getByText(/Course Library/i)).toBeInTheDocument();
    expect(screen.getByText(/Grading System/i)).toBeInTheDocument();
  });

  it("renders links", () => {
    renderComponent();

    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("shows library active state", () => {
    renderComponent("library");

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows grading active state", () => {
    renderComponent("grading");

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders icons", () => {
    renderComponent();

    expect(screen.getByText("LibraryIcon")).toBeInTheDocument();
    expect(screen.getByText("GradingIcon")).toBeInTheDocument();
  });

  it("renders without active indicator by default", () => {
    renderComponent();

    expect(document.querySelector(".animate-pulse")).not.toBeInTheDocument();
  });
});