

namespace Scrappy.Exceptions;


public class DuplicateEntityException : Exception
{
    public DuplicateEntityException()
        : base("An entity with the same unique details already exists.") { }

    public DuplicateEntityException(string message)
        : base(message) { }

    public DuplicateEntityException(string message, Exception innerException)
        : base(message, innerException) { }
}