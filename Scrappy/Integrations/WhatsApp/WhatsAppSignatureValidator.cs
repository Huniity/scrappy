

using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;


namespace Scrappy.Integrations.WhatsApp;

/// <summary>
/// Validates the signature of incoming WhatsApp webhook requests to ensure authenticity.
/// </summary>
public sealed class WhatsAppWebhookSignatureValidator
{
    private const string SignaturePrefix = "sha256=";
    private readonly byte[] _appSecret;

    /// <summary>
    /// Initializes a new instance of the <see cref="WhatsAppWebhookSignatureValidator"/> class.
    /// </summary>
    public WhatsAppWebhookSignatureValidator(
        IOptions<WhatsAppOptions> options)
    {
        _appSecret = Encoding.UTF8.GetBytes(
            options.Value.AppSecret);
    }

    /// <summary>
    /// Validates the signature of the incoming webhook request.
    /// </summary>
    /// <param name="payload">The raw payload of the webhook request.</param>
    /// <param name="signatureHeader">The value of the 'X-Hub-Signature-256' header from the request.</param>
    /// <returns>True if the signature is valid; otherwise, false.</returns>
    public bool IsValid(
        ReadOnlySpan<byte> payload,
        string? signatureHeader)
    {
        if (_appSecret.Length == 0 ||
            string.IsNullOrWhiteSpace(signatureHeader) ||
            !signatureHeader.StartsWith(
                SignaturePrefix,
                StringComparison.Ordinal))
        {
            return false;
        }

        byte[] receivedHash;

        try
        {
            receivedHash = Convert.FromHexString(
                signatureHeader[SignaturePrefix.Length..]);
        }
        catch (FormatException)
        {
            return false;
        }

        var expectedHash = HMACSHA256.HashData(
            _appSecret,
            payload);

        return receivedHash.Length == expectedHash.Length &&
                CryptographicOperations.FixedTimeEquals(
                    receivedHash,
                    expectedHash);
    }
}