

namespace Scrappy.Exceptions;

public class ValidationException : Exception
{
    public ValidationException()
        : base ("Not valid format") {}

    public ValidationException(string message)
        : base(message) {}

    public ValidationException(string message, Exception innerException)
        : base(message, innerException) {}
}