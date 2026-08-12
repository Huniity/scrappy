

namespace Scrappy.Models;

/// <summary>
/// Represents the settings for connecting to a MongoDB database, including the connection URI, database name, and collection name.
/// </summary>
public class MongoDBSettings
{
    /// <summary> Gets or sets the connection URI for the MongoDB database. </summary>
    public string ConnectionUri { get; set; } = null!;

    /// <summary> Gets or sets the name of the MongoDB database. </summary>
    public string DatabaseName { get; set; } = null!;

    /// <summary> Gets or sets the name of the collection within the MongoDB database. </summary>
    public string CollectionName { get; set; } = null!;
    
}