namespace Ewallet.Application.Security;

public static class AppPolicies
{
  public const string CanManageUsers = "CanManageUsers";
  public const string CanViewAllTopUps = "CanViewAllTopUps";

  public const string CanTopUp = "CanTopUp";
  public const string CanTransfer = "CanTransfer";
  public const string CanViewOwnMutations = "CanViewOwnMutations";
  public const string CanViewOwnTransactions = "CanViewOwnTransactions";
  public const string CanManageOwnWallet = "CanManageOwnWallet";

  public const string CanAccessProfile = "CanAccessProfile";
}