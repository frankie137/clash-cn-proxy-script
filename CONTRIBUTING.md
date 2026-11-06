# Contributing

Thanks for helping improve clash-cn-proxy-script. Keep changes focused on mainland China direct routing, local-network access, and proxy fallback.

## Reporting bugs

Include your operating system, Clash Verge Rev version, Mihomo version, reproduction steps, and the matched rule shown in Connections. Share a minimal, redacted configuration when necessary. Do not include node credentials, subscription URLs, private keys, or unrelated browsing history.

Rule classification comes from MetaCubeX/meta-rules-dat. If the script behaves correctly but an upstream domain or IP entry is inaccurate, report the classification issue upstream.

## Making changes

1. Fork the repository and create a branch.
2. Make your change and update the English documentation where behavior changes.
3. Run `node --check clash-cn-proxy-script.js` and `node --test` with Node.js 22 or later.
4. For routing or DNS changes, validate the generated configuration with a compatible Mihomo core and inspect actual connection routes in Clash Verge Rev.
5. Open a pull request describing the problem, resulting behavior, and validation.

Keep the runtime script dependency-free and compatible with Clash Verge Rev's extension environment. Do not add Node.js imports, filesystem access, or network calls to the runtime script; Mihomo downloads rule providers from the configuration it returns.

## Community

Be respectful, explain technical disagreements, and avoid harassment or disclosure of other people's private information. Maintainers may remove abusive content or close off-topic discussions.

## Licensing

By intentionally submitting a contribution, you agree to license it under MIT OR Apache-2.0, without additional restrictions. Identify any third-party material and preserve its required notices.
