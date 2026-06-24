import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseMDManager from "../../../components/teacher/CourseMDManager";

const downloadCourseMDMock = vi.fn();
const uploadCourseMDMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: () => ({
    courseId: "1",
  }),
}));

vi.mock("../../../api/api", () => ({
  downloadCourseMD: (...args) =>
    downloadCourseMDMock(...args),
  uploadCourseMD: (...args) =>
    uploadCourseMDMock(...args),
}));

vi.mock("react-icons/fa", () => ({
  FaDownload: () => <div>DownloadIcon</div>,
  FaUpload: () => <div>UploadIcon</div>,
  FaFileArchive: () => <div>ArchiveIcon</div>,
  FaInfoCircle: () => <div>InfoIcon</div>,
}));

describe("CourseMDManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders component title", () => {
    render(<CourseMDManager />);

    expect(
      screen.getByText("Upload / Download MD")
    ).toBeInTheDocument();
  });

  it("renders info section", () => {
    render(<CourseMDManager />);

    expect(
      screen.getByText(/About Course MD Files/i)
    ).toBeInTheDocument();
  });

  it("renders download section", () => {
    render(<CourseMDManager />);

    expect(
      screen.getByText("Download Course Structure")
    ).toBeInTheDocument();
  });

  it("renders upload section", () => {
    render(<CourseMDManager />);

    expect(
      screen.getByText("Upload Course Structure")
    ).toBeInTheDocument();
  });

  it("downloads successfully", async () => {
    downloadCourseMDMock.mockResolvedValue({});

    render(<CourseMDManager />);

    fireEvent.click(
      screen.getByText("Download MD")
    );

    await waitFor(() => {
      expect(
        downloadCourseMDMock
      ).toHaveBeenCalledWith("1");
    });

    expect(
      screen.getByText(
        "Course structure downloaded successfully!"
      )
    ).toBeInTheDocument();
  });

  it("shows download error", async () => {
    downloadCourseMDMock.mockRejectedValue({
      response: {
        data: {
          error: "Download failed",
        },
      },
    });

    render(<CourseMDManager />);

    fireEvent.click(
      screen.getByText("Download MD")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Download failed")
      ).toBeInTheDocument();
    });
  });

  it("rejects non zip file", async () => {
    render(<CourseMDManager />);

    const fileInput =
      document.querySelector(
        'input[type="file"]'
      );

    const file = new File(
      ["dummy"],
      "test.txt",
      {
        type: "text/plain",
      }
    );

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText(
        "Please select a ZIP file"
      )
    ).toBeInTheDocument();
  });

  it("accepts zip file", async () => {
    render(<CourseMDManager />);

    const fileInput =
      document.querySelector(
        'input[type="file"]'
      );

    const file = new File(
      ["dummy"],
      "course.zip",
      {
        type: "application/zip",
      }
    );

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

   expect(
  screen.getAllByText(/course\.zip/i).length
).toBeGreaterThan(0);
  });

  it("upload button is disabled without file", () => {
  render(<CourseMDManager />);

  const uploadButton = screen.getByRole(
    "button",
    {
      name: /upload md/i,
    }
  );

  expect(uploadButton).toBeDisabled();
});
  it("uploads successfully", async () => {
    uploadCourseMDMock.mockResolvedValue({
      message: "Upload successful",
    });

    render(<CourseMDManager />);

    const fileInput =
      document.querySelector(
        'input[type="file"]'
      );

    const file = new File(
      ["dummy"],
      "course.zip",
      {
        type: "application/zip",
      }
    );

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    fireEvent.click(
      screen.getByText("Upload MD")
    );

    await waitFor(() => {
      expect(
        uploadCourseMDMock
      ).toHaveBeenCalled();
    });

    expect(
      screen.getByText(
        "Upload successful"
      )
    ).toBeInTheDocument();
  });

  it("shows upload error", async () => {
    uploadCourseMDMock.mockRejectedValue({
      response: {
        data: {
          error: "Upload failed",
        },
      },
    });

    render(<CourseMDManager />);

    const fileInput =
      document.querySelector(
        'input[type="file"]'
      );

    const file = new File(
      ["dummy"],
      "course.zip",
      {
        type: "application/zip",
      }
    );

    fireEvent.change(fileInput, {
      target: {
        files: [file],
      },
    });

    fireEvent.click(
      screen.getByText("Upload MD")
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Upload failed"
        )
      ).toBeInTheDocument();
    });
  });
});