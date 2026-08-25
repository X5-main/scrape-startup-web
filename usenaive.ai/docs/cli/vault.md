> ## Documentation Index
> Fetch the complete documentation index at: https://usenaive.ai/docs/llms.txt
> Use this file to discover all available pages before exploring further.

# vault

> Per-user Credential Vault from the CLI.

```bash theme={"theme":"css-variables"}
naive vault list --user alice
naive vault put instantly.api_key key_xyz --user alice --kind api_key
naive vault reveal instantly.api_key --user alice
naive vault delete instantly.api_key --user alice
naive vault rotate instantly.api_key --user alice [--regenerate-dek]
```

`reveal` is a POST under the hood — secrets never appear in a URL. `--locked` entries
can be stored but not revealed back.
