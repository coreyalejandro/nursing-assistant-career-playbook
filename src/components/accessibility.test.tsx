/** @jest-environment jsdom */
/**
 * Automated accessibility audit (axe-core via jest-axe) for the new
 * monetization UI and a representative existing component. Runs in CI on every
 * push, giving the WCAG verification the DeepSeek report flagged as missing.
 */
import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import UpgradeModal from "./UpgradeModal";
import VerifiedClinicalBadge from "./VerifiedClinicalBadge";

expect.extend(toHaveNoViolations);

describe("accessibility (axe-core, WCAG 2.1 AA ruleset)", () => {
  it("UpgradeModal (paywall dialog) has no detectable violations", async () => {
    const { container } = render(
      <UpgradeModal open onClose={() => {}} upgradeUrl="https://buy.stripe.com/test" used={10} limit={10} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("VerifiedClinicalBadge has no detectable violations", async () => {
    const { container } = render(<VerifiedClinicalBadge metricType="falls" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
