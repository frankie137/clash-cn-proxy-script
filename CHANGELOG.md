# Changelog

## Unreleased

- Enable DNS routing through rules with `respect-rules` and `follow-rule` in generated configurations.
- Supply independent proxy-server DNS when absent or empty, while retaining an existing nonempty resolver list.
- Add `no-resolve` to the China IP rule so domain requests can reach proxy fallback without an extra local DNS lookup.

## 0.1.0 - 2026-11-05

- Add a Clash Verge Rev subscription extension for mainland China and local-network direct routing.
- Route other traffic through a configurable existing proxy group.
- Refresh MetaCubeX domain and IP MRS rule providers every 24 hours.
- Configure domestic DNS for China-listed domains and direct connections.
- Add English documentation, contribution templates, and routing checks.
