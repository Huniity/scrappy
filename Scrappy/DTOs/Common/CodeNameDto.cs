namespace Scrappy.DTOs.Common;

/// <summary>
/// Represents a controlled-vocabulary value using its stable code and readable label.
/// </summary>
public sealed record CodeNameDto(string Code, string Name);
