namespace Ewallet.Application.DTOs;

public sealed record TotalTransaction
(
  decimal TopUp,
  decimal Income,
  decimal Expense
);