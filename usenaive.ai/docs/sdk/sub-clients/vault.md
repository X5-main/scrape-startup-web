> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# vault

> Per-user encrypted key/value storage.

```ts theme={"theme":"css-variables"}
const client = naive.forUser(alice.id);

await client.vault.put("instantly.api_key", "key_xyz", { kind: "api_key", locked: false });
await client.vault.list();                       // values masked
const { value } = await client.vault.reveal("instantly.api_key");
await client.vault.rotate("instantly.api_key");  // re-wrap; { regenerateDek: true } for full
await client.vault.delete("instantly.api_key");
```

Envelope-encrypted with a managed KMS. See
[Vault encryption](/docs/architecture/vault-encryption).
