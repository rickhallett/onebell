import { describe, it, expect } from "vitest"
import { escapeHtml } from "./html"

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("A & B")).toBe("A &amp; B")
  })

  it("escapes less-than signs", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;")
  })

  it("escapes greater-than signs", () => {
    expect(escapeHtml("a > b")).toBe("a &gt; b")
  })

  it("escapes double quotes", () => {
    expect(escapeHtml('say "hello"')).toBe("say &quot;hello&quot;")
  })

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s")
  })

  it("handles combined injection attempt", () => {
    expect(escapeHtml('"><script>alert(1)</script>')).toBe(
      "&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;"
    )
  })

  it("passes through safe strings unchanged", () => {
    expect(escapeHtml("Richard")).toBe("Richard")
  })

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("")
  })
})
