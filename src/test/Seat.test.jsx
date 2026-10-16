
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Seat } from "../components/UI";

describe("Seat Component", () => {
  it("displays the seat number", () => {
    render(
      <Seat seat="A1" selected={false} onClick={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: "Seat A1" })
    ).toBeInTheDocument();
  });

  it("shows the seat as selected", () => {
    render(
      <Seat seat="A1" selected={true} onClick={() => {}} />
    );

    expect(
      screen.getByRole("button", { name: "Seat A1" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onClick when the seat is clicked", () => {
    const handleClick = vi.fn();

    render(
      <Seat seat="A1" selected={false} onClick={handleClick} />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Seat A1" })
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
