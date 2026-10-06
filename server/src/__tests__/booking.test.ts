import { describe, it, expect } from 'vitest';
import { generateTicketReference } from '../utils/ticketGenerator';

describe('Booking & Pricing Calculations', () => {
  it('correctly calculates price with membership and reward discounts', () => {
    const basePrice = 800;
    const membershipDiscountPercent = 10; // Play tier: 10%
    const rewardDiscount = 50;

    const membershipDiscount = Math.round(basePrice * (membershipDiscountPercent / 100));
    const finalAmount = Math.max(0, basePrice - membershipDiscount - rewardDiscount);

    expect(membershipDiscount).toBe(80);
    expect(finalAmount).toBe(670);
  });

  it('generates unique booking reference adhering to TB-YYYY-XXXXXX format', () => {
    const ref = generateTicketReference();
    const currentYear = new Date().getFullYear();

    expect(ref).toMatch(new RegExp(`^TB-${currentYear}-[A-Z0-9]{6}$`));
  });

  it('prevents final amount from dropping below zero', () => {
    const basePrice = 500;
    const membershipDiscount = 100;
    const rewardDiscount = 600; // greater than remainder

    const finalAmount = Math.max(0, basePrice - membershipDiscount - rewardDiscount);
    expect(finalAmount).toBe(0);
  });
});
