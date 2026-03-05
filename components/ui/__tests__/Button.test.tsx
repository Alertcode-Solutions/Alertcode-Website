import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("renders properly", () => {
    render(<Button>Primary Action</Button>);

    expect(screen.getByRole("button", { name: "Primary Action" })).toBeInTheDocument();
  });

  it("applies outline variant styles", () => {
    render(<Button variant="outline">Outline Action</Button>);

    const button = screen.getByRole("button", { name: "Outline Action" });
    expect(button).toHaveClass("border-border");
    expect(button).toHaveClass("bg-transparent");
  });

  it("calls click handler when clicked", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click Action</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Click Action" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
