import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotificationsStore } from "../../store/notificationsStore";

vi.mock("../../api/api", () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationsCount: vi.fn(),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markBulkNotificationsRead: vi.fn(),
}));

import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationRead,
  markAllNotificationsRead,
  markBulkNotificationsRead,
} from "../../api/api";

describe("notificationsStore", () => {
  beforeEach(() => {
    useNotificationsStore.getState().resetStore();
    vi.clearAllMocks();
  });

  it("should have initial state", () => {
    const state = useNotificationsStore.getState();

    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });

  it("fetchNotifications success", async () => {
    getNotifications.mockResolvedValue({
      notifications: [
        { message_uid: "1", read: false },
        { message_uid: "2", read: true },
      ],
      count: 1,
    });

    const result =
      await useNotificationsStore.getState().fetchNotifications();

    expect(result.success).toBe(true);

    const state = useNotificationsStore.getState();

    expect(state.notifications.length).toBe(2);
    expect(state.unreadCount).toBe(1);
  });

  it("fetchNotifications failure", async () => {
    getNotifications.mockRejectedValue({
      response: {
        data: {
          error: "API Failed",
        },
      },
    });

    const result =
      await useNotificationsStore.getState().fetchNotifications();

    expect(result.success).toBe(false);

    expect(useNotificationsStore.getState().error).toBe(
      "API Failed"
    );
  });

  it("fetchUnreadCount success", async () => {
    getUnreadNotificationsCount.mockResolvedValue({
      unread_count: 5,
    });

    await useNotificationsStore.getState().fetchUnreadCount();

    expect(
      useNotificationsStore.getState().unreadCount
    ).toBe(5);
  });

  it("markAsRead updates notification", async () => {
    markNotificationRead.mockResolvedValue({});

    useNotificationsStore.setState({
      notifications: [
        { message_uid: "1", read: false },
        { message_uid: "2", read: false },
      ],
    });

    await useNotificationsStore.getState().markAsRead("1");

    const state = useNotificationsStore.getState();

    expect(state.notifications[0].read).toBe(true);
    expect(state.unreadCount).toBe(1);
  });

  it("markAllAsRead updates all notifications", async () => {
    markAllNotificationsRead.mockResolvedValue({});

    useNotificationsStore.setState({
      notifications: [
        { message_uid: "1", read: false },
        { message_uid: "2", read: false },
      ],
    });

    await useNotificationsStore.getState().markAllAsRead();

    const state = useNotificationsStore.getState();

    expect(state.notifications.every(n => n.read)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it("markBulkAsRead updates selected notifications", async () => {
    markBulkNotificationsRead.mockResolvedValue({});

    useNotificationsStore.setState({
      notifications: [
        { message_uid: "1", read: false },
        { message_uid: "2", read: false },
        { message_uid: "3", read: false },
      ],
    });

    await useNotificationsStore.getState().markBulkAsRead([
      "1",
      "2",
    ]);

    const state = useNotificationsStore.getState();

    expect(state.notifications[0].read).toBe(true);
    expect(state.notifications[1].read).toBe(true);
    expect(state.notifications[2].read).toBe(false);
    expect(state.unreadCount).toBe(1);
  });

  it("clearError clears error state", () => {
    useNotificationsStore.setState({
      error: "Some Error",
    });

    useNotificationsStore.getState().clearError();

    expect(useNotificationsStore.getState().error).toBe(
      null
    );
  });

  it("resetStore resets everything", () => {
    useNotificationsStore.setState({
      notifications: [{ message_uid: "1" }],
      unreadCount: 5,
      isLoading: true,
      error: "Error",
    });

    useNotificationsStore.getState().resetStore();

    const state = useNotificationsStore.getState();

    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(null);
  });
});