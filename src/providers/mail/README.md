# Mail providers

SIG-101 defines the normalized contract in this directory. SIG-102, SIG-301—303, and SIG-304—305 then implement mock, Microsoft, and Gmail adapters behind that contract.

Provider code is server-only and read-only. Do not import it into Client Components, expose tokens in return values, or pass provider-native payloads directly to UI code.
