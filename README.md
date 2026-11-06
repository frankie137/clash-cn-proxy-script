<div align="center">

# 🌐 clash-cn-proxy-script

**Mainland China and local networks go direct. Everything else uses your proxy.**

[![CI](https://github.com/frankie137/clash-cn-proxy-script/actions/workflows/ci.yml/badge.svg)](https://github.com/frankie137/clash-cn-proxy-script/actions/workflows/ci.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](#license)
[![Client: Clash Verge Rev](https://img.shields.io/badge/client-Clash%20Verge%20Rev-6366f1.svg)](https://www.clashverge.dev/)

[Download the script](https://raw.githubusercontent.com/frankie137/clash-cn-proxy-script/main/clash-cn-proxy-script.js) · [Quick start](#quick-start) · [Report a bug](https://github.com/frankie137/clash-cn-proxy-script/issues/new?template=bug_report.md)

</div>

A subscription extension script for **Clash Verge Rev with the Mihomo core**. Apply a small, predictable routing policy to your existing subscription without editing its nodes or credentials.

## Routing policy

Rules are evaluated in this order; the first match wins.

| Destination | Action |
| --- | --- |
| Loopback, private networks, link-local addresses, and the shared `100.64.0.0/10` range | `DIRECT` |
| Domains in the mainland China domain rule set | `DIRECT` |
| Addresses in the mainland China IP rule set | `DIRECT` |
| Everything else | Your configured proxy group |

The local rules include IPv4 and IPv6 ranges. The script preserves your subscription's IPv6 setting.

China domain and IP data come from [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat). Mihomo downloads the compact MRS rule sets through your proxy group and checks for updates every **24 hours**. Classification depends on these community-maintained lists.

## Quick start

1. Import and activate **your own working subscription** in Clash Verge Rev.
2. Open the **Proxies** page and note the exact name of the proxy group you want to use.
3. [Download `clash-cn-proxy-script.js`](https://raw.githubusercontent.com/frankie137/clash-cn-proxy-script/main/clash-cn-proxy-script.js) and edit the setting near the top:

   ```js
   const PROXY_GROUP = "PROXY";
   ```

   Replace `PROXY` with your group name. Names are case-sensitive and may contain non-English characters. Use a proxy group name, rather than an individual node name. The script reports an error if the group does not exist.

4. Open **Subscriptions**, right-click your subscription card, and open its **Extension Script** editor. Labels may vary by version or language; in Chinese, look for **扩展脚本**.
5. Paste the entire script into that editor, save it, and reactivate the subscription.
6. Select **Rule** mode in the client. In your chosen proxy group, select the node you want to use.

Clash Verge Rev reapplies the subscription extension when regenerating the configuration, so subscription updates retain the routing policy. See the [official extension documentation](https://www.clashverge.dev/guide/extend.html).

> The script **replaces the subscription's routing rules**. Existing ad-blocking rules, application-specific routes, and other routing exceptions are not retained. Back up any existing extension script before replacing it.

## DNS behavior

- China-listed domains use AliDNS and DNSPod DNS-over-HTTPS resolvers.
- Direct connections also use these domestic resolvers, with DNS policy following enabled.
- Bootstrap resolvers are `223.5.5.5` and `119.29.29.29`.
- Existing default nameservers, DNS enablement, enhanced mode, and unrelated DNS policies are preserved.

The script adds or replaces the `cn-domain` and `cn-ip` rule providers. It does not change proxy node definitions, proxy group membership, proxy credentials, subscription URLs, listening ports, or TUN settings. Select a working proxy node in your group; choosing `DIRECT` in that group would make fallback traffic direct too.

## Verify the result

After applying the script, create **new** connections and inspect them on the client's **Connections** page:

- A mainland China domain should show `DIRECT`, usually through `cn-domain`.
- A mainland China IP should show `DIRECT` through `cn-ip` when no earlier rule matches.
- Other traffic should show your proxy group and its selected node through the final `MATCH` rule.

Also check that both rule providers have loaded. On first use, they require a working proxy connection to download their data. Existing connections may continue using the route selected before the script was applied.

This script supplies a routing policy, not a proxy service or a bandwidth guarantee. It requires your own nodes. Clients without subscription JavaScript support or a Mihomo core supporting MRS rule providers cannot use this file directly.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| `Proxy group ... was not found` | Set `PROXY_GROUP` to an exact group name from your active subscription. |
| All traffic still uses one route | Select Rule mode, reactivate the subscription, and inspect a new connection. |
| Rule providers fail to load | Check your selected proxy node and access to `raw.githubusercontent.com`. |
| A particular site takes an unexpected route | Inspect its matched rule, refresh the providers, and check the upstream domain/IP classification. |

To remove the policy, restore your previous extension script or replace this script with the following, then reactivate your subscription:

```js
function main(config) {
  return config;
}
```

## Development

No packages or build step are required. With Node.js 22 or later:

```sh
node --check clash-cn-proxy-script.js
node --test
```

The tests check routing precedence, custom proxy group names, preservation of subscription data, DNS behavior, and invalid group handling. They do not measure live network performance.

## Contributing

Bug reports and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a change. Please omit credentials and subscription URLs from reports.

See [CHANGELOG.md](CHANGELOG.md) for project changes.

## Acknowledgments

- [Mihomo](https://github.com/MetaCubeX/mihomo) and [Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev) provide the configuration and extension mechanisms.
- [MetaCubeX/meta-rules-dat](https://github.com/MetaCubeX/meta-rules-dat) provides the external rule data, subject to its own upstream terms.
- Repository structure and community-file conventions were adapted from [frankie137/opensource-template](https://github.com/frankie137/opensource-template), originally an Embark Studios open-source template.

## License

Licensed under either the [MIT License](LICENSE-MIT) or the [Apache License, Version 2.0](LICENSE-APACHE), at your option.

Unless explicitly stated otherwise, contributions submitted for inclusion are provided under the same dual license.
