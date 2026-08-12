

namespace Scrappy.DTOs.Common;

/// <summary>
/// Represents the result of an API operation, including success status, data, error messages, and validation errors. This class is used to standardize the response format for API endpoints.
/// </summary>
/// <typeparam name="T"></typeparam>
public class ApiResultDto<T>
{
    /// <summary> Gets or sets a value indicating whether the API operation was successful. </summary>
    public bool IsSuccess { get; set; }

    /// <summary> Gets or sets the data returned from the API operation, if successful. </summary>
    public T? Data { get; set; }

    /// <summary> Gets or sets the error message returned from the API operation, if unsuccessful. </summary>
    public string? ErrorMessage { get; set; }

    /// <summary> Gets or sets the list of validation errors returned from the API operation, if unsuccessful. </summary>
    public List<string> ValidationErrors { get; set; } = new();

    /// <summary> Creates a successful ApiResultDto with the specified data. </summary>
    public static ApiResultDto<T> Success(T data) => new() { IsSuccess = true, Data = data };

    /// <summary> Creates a failed ApiResultDto with the specified error message. </summary>
    public static ApiResultDto<T> Failure(string error) => new() { IsSuccess = false, ErrorMessage = error };
    
    /// <summary> Creates a failed ApiResultDto with the specified list of validation errors. </summary>
    public static ApiResultDto<T> Failure(List<string> errors) => new() { IsSuccess = false, ValidationErrors = errors };
}