

using System;
using Scrappy.Models;

namespace Scrappy.Services;

public class EventQualityService
{    
    public static decimal ComputeQualityScore(string? description, DateTime? startDate, string? location, EventType? eventType)
        {
            int maxScore = 20;
            int earnedScore = 0;

            if (!string.IsNullOrEmpty(description) && description.Length >= 50)
                earnedScore += 5;

            if (startDate.HasValue)
                earnedScore += 5;

            if (!string.IsNullOrEmpty(location))
                earnedScore += 5;
            
            if (eventType.HasValue && Enum.IsDefined(eventType.Value))
                earnedScore += 5;

            return ((decimal)earnedScore / maxScore) * 100;
        }
}