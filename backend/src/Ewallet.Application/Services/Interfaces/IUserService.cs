using Ewallet.Application.DTOs;

namespace Ewallet.Application.Services.Interfaces;

public interface IUserService
{
  Task<(bool Succeeded, UserResponse? User, IReadOnlyList<string> Errors)> UpdateUserAsync(
    long userId,
    UserUpdateRequest request,
    CancellationToken cancellationToken = default);
  Task<PagedResponse<TransactionResponse>?> GetMyTransactionsAsync(
    long userId,
    TransactionFilterRequest filter,
    CancellationToken cancellationToken = default);
  Task<PagedResponse<WalletMutationResponse>?> GetMyMutationsAsync(
    long userId,
    WalletMutationFilterRequest filter,
    CancellationToken cancellationToken = default);
  Task<PagedResponse<UserResponse>> GetAllUsersAsync(
    UserFilterRequest filter,
    CancellationToken cancellationToken = default);
  Task<UserResponse?> GetUserByIdAsync(
    long userId,
    CancellationToken cancellationToken = default);
  Task<(bool Succeeded, UserResponse? User, string? Error)> UpdateUserStatusAsync(
    long adminUserId,
    long targetUserId,
    UpdateUserStatusRequest request,
    string? correlationId,
    CancellationToken cancellationToken = default);
  Task<UserSummary?> GetUserSummaryAsync(CancellationToken cancellationToken);
}