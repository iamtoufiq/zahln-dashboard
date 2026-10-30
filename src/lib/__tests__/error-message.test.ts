import { expect, test } from "vitest";

import { ApiError } from "@/api/errors";

import { errorMessage } from "../error-message";

test("a missing payment says so and offers no retry", () => {
  expect(errorMessage(new ApiError(404, "not_found", false, "rejected"))).toEqual({
    key: "error.not_found",
    canRetry: false,
  });
});

test("a payment of another scope says so and offers no retry", () => {
  expect(errorMessage(new ApiError(403, "forbidden", false, "rejected"))).toEqual({
    key: "error.forbidden",
    canRetry: false,
  });
});

test("a lost connection says so and can be retried", () => {
  for (const code of ["network", "timeout", "connection_dropped", "unavailable"]) {
    expect(errorMessage(new ApiError(null, code, true, "unknown"))).toEqual({
      key: "error.network",
      canRetry: true,
    });
  }
});

test("anything else is generic and can be retried", () => {
  expect(errorMessage(new ApiError(500, "internal", false, "unknown"))).toEqual({
    key: "error.generic",
    canRetry: true,
  });
  expect(errorMessage(new Error("boom"))).toEqual({ key: "error.generic", canRetry: true });
});
