import { render, screen, fireEvent } from "@testing-library/react";
import userEvents from "@testing-library/user-event";
import React from "react";
import { MainView } from "../view/MainView";

describe("MainView", () => {
  beforeEach(() => {
    window.parent.postMessage = jest.fn();
    render(<MainView />);
  });
  test("renders h2", () => {
    expect(screen.getByText("Rectangle Creator")).toBeInTheDocument();
  });
  test("sends cancel message to figma when clicking Cancel", async () => {
    await userEvents.click(screen.getByRole("button", { name: "Cancel" }));
    expect(window.parent.postMessage).toHaveBeenCalledTimes(1);
    expect(window.parent.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        pluginMessage: { type: "cancel" },
      }),
      "*"
    );
  });
  test("reacts to failure message sent from Figma", async () => {
    fireEvent(
      window,
      new MessageEvent("message", {
        data: {
          pluginMessage: {
            type: "created-nodes-result",
            success: false,
          },
        },
      })
    );
    expect(
      await screen.findByRole("button", { name: /❌/i })
    ).toBeInTheDocument();
  });
});
