import { describe, it, expect, beforeEach, vi } from "vitest";
import useForumStore from "../../store/forumStore";

vi.mock("../../api/api", () => ({
  getCourseForumPosts: vi.fn(),
  createCourseForumPost: vi.fn(),
  deleteCourseForumPost: vi.fn(),
  getForumPostComments: vi.fn(),
  createForumPostComment: vi.fn(),
  deleteForumPostComment: vi.fn(),
  getCourseLessonForumPosts: vi.fn(),
  getLessonForumComments: vi.fn(),
  createLessonForumComment: vi.fn(),
  deleteLessonForumComment: vi.fn(),
  deleteLessonForumPost: vi.fn(),
}));

import {
  getCourseForumPosts,
  createCourseForumPost,
  deleteCourseForumPost,
  getForumPostComments,
  createForumPostComment,
  deleteForumPostComment,
  getCourseLessonForumPosts,
  getLessonForumComments,
  createLessonForumComment,
  deleteLessonForumComment,
  deleteLessonForumPost,
} from "../../api/api";

describe("forumStore", () => {
  beforeEach(() => {
    useForumStore.setState({
      coursePosts: [],
      lessonPosts: [],
      comments: [],
      loading: false,
      error: null,
    });

    vi.clearAllMocks();
  });

  it("loads course posts", async () => {
    getCourseForumPosts.mockResolvedValue({
      data: [{ id: 1, title: "Post" }],
    });

    await useForumStore.getState().loadCoursePosts(1);

    expect(useForumStore.getState().coursePosts).toEqual([
      { id: 1, title: "Post" },
    ]);
  });

  it("handles load course posts error", async () => {
    getCourseForumPosts.mockRejectedValue(new Error("API Error"));

    await useForumStore.getState().loadCoursePosts(1);

    expect(useForumStore.getState().error).toBe(
      "Failed to load course posts"
    );
  });

  it("adds course post", async () => {
    createCourseForumPost.mockResolvedValue({});
    getCourseForumPosts.mockResolvedValue({ data: [] });

    await useForumStore
      .getState()
      .addCoursePost(1, { title: "New Post" });

    expect(createCourseForumPost).toHaveBeenCalled();
  });

  it("handles add course post error", async () => {
    createCourseForumPost.mockRejectedValue(new Error());

    await useForumStore
      .getState()
      .addCoursePost(1, { title: "New Post" });

    expect(useForumStore.getState().error).toBe(
      "Failed to add course post"
    );
  });

  it("deletes course post", async () => {
    deleteCourseForumPost.mockResolvedValue({});
    getCourseForumPosts.mockResolvedValue({ data: [] });

    await useForumStore
      .getState()
      .deleteCoursePost(1, 10);

    expect(deleteCourseForumPost).toHaveBeenCalled();
  });

  it("handles delete course post error", async () => {
    deleteCourseForumPost.mockRejectedValue(new Error());

    await useForumStore
      .getState()
      .deleteCoursePost(1, 10);

    expect(useForumStore.getState().error).toBe(
      "Failed to delete course post"
    );
  });

  it("loads course comments", async () => {
    getForumPostComments.mockResolvedValue({
      data: [{ id: 1, text: "comment" }],
    });

    await useForumStore
      .getState()
      .loadCourseComments(1, 1);

    expect(useForumStore.getState().comments).toEqual([
      { id: 1, text: "comment" },
    ]);
  });

  it("adds course comment", async () => {
    createForumPostComment.mockResolvedValue({});
    getForumPostComments.mockResolvedValue({ data: [] });

    await useForumStore
      .getState()
      .addCourseComment(1, 1, { text: "hello" });

    expect(createForumPostComment).toHaveBeenCalled();
  });

  it("deletes course comment", async () => {
    deleteForumPostComment.mockResolvedValue({});
    getForumPostComments.mockResolvedValue({ data: [] });

    await useForumStore
      .getState()
      .deleteCourseComment(1, 1, 1);

    expect(deleteForumPostComment).toHaveBeenCalled();
  });

  it("loads lesson posts", async () => {
    getCourseLessonForumPosts.mockResolvedValue({
      data: [{ id: 100 }],
    });

    await useForumStore.getState().loadLessonPosts(1);

    expect(useForumStore.getState().lessonPosts).toEqual([
      { id: 100 },
    ]);
  });

  it("handles lesson posts error", async () => {
    getCourseLessonForumPosts.mockRejectedValue(new Error());

    await useForumStore.getState().loadLessonPosts(1);

    expect(useForumStore.getState().error).toBe(
      "Failed to load lesson posts"
    );
  });

  it("loads lesson comments", async () => {
    getLessonForumComments.mockResolvedValue({
      data: [{ id: 1 }],
    });

    await useForumStore
      .getState()
      .loadLessonComments(1, 5);

    expect(useForumStore.getState().comments).toEqual([
      { id: 1 },
    ]);
  });

  it("deletes lesson post", async () => {
    deleteLessonForumPost.mockResolvedValue({});
    getCourseLessonForumPosts.mockResolvedValue({
      data: [],
    });

    await useForumStore
      .getState()
      .deleteLessonPost(1, 5);

    expect(deleteLessonForumPost).toHaveBeenCalled();
  });

  it("adds lesson comment", async () => {
    createLessonForumComment.mockResolvedValue({});
    getLessonForumComments.mockResolvedValue({
      data: [],
    });

    await useForumStore
      .getState()
      .addLessonComment(1, 5, {
        text: "lesson comment",
      });

    expect(createLessonForumComment).toHaveBeenCalled();
  });

  it("deletes lesson comment", async () => {
    deleteLessonForumComment.mockResolvedValue({});
    getLessonForumComments.mockResolvedValue({
      data: [],
    });

    await useForumStore
      .getState()
      .deleteLessonComment(1, 5, 1);

    expect(deleteLessonForumComment).toHaveBeenCalled();
  });

  it("clears comments", () => {
    useForumStore.setState({
      comments: [{ id: 1 }],
    });

    useForumStore.getState().clearComments();

    expect(useForumStore.getState().comments).toEqual([]);
  });
});