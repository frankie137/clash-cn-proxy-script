const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const { runInNewContext } = require("node:vm");

const source = readFileSync(join(__dirname, "..", "clash-cn-proxy-script.js"), "utf8");

function apply(config, group = "PROXY") {
  const customized = source.replace('const PROXY_GROUP = "PROXY";', `const PROXY_GROUP = ${JSON.stringify(group)};`);
  const main = runInNewContext(customized + "\nmain;");
  // Normalize VM-created objects before comparing with this test's realm.
  return JSON.parse(JSON.stringify(main(config, "test-profile")));
}

function profile(group = "PROXY") {
  return {
    proxies: [{ name: "example-node", type: "vless", server: "example.invalid" }],
    "proxy-groups": [{ name: group, type: "select", proxies: ["example-node"] }],
    rules: ["DOMAIN,old.example,REJECT", "MATCH,DIRECT"],
  };
}

test("local exceptions precede China rules and the final proxy fallback", () => {
  const result = apply(profile());
  assert.equal(result.mode, "rule");
  assert.equal(result.rules.length, 12);
  assert.equal(result.rules[0], "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve");
  assert.ok(result.rules.slice(0, 9).every(rule => rule.endsWith(",DIRECT,no-resolve")));
  assert.deepEqual(result.rules.slice(-3), [
    "RULE-SET,cn-domain,DIRECT",
    "RULE-SET,cn-ip,DIRECT,no-resolve",
    "MATCH,PROXY",
  ]);
  assert.ok(!result.rules.some(rule => rule.includes("old.example")));
});

test("custom group names control fallback and rule-provider downloads", () => {
  const group = "My proxy group";
  const result = apply(profile(group), group);
  assert.equal(result.rules.at(-1), "MATCH," + group);
  for (const name of ["cn-domain", "cn-ip"]) {
    const provider = result["rule-providers"][name];
    assert.equal(provider.proxy, group);
    assert.equal(provider.interval, 86400);
    assert.equal(provider.format, "mrs");
    assert.match(provider.url, /^https:\/\/raw\.githubusercontent\.com\/MetaCubeX\/meta-rules-dat\//);
  }
  assert.equal(result["rule-providers"]["cn-domain"].behavior, "domain");
  assert.equal(result["rule-providers"]["cn-ip"].behavior, "ipcidr");
});

test("node definitions, groups, and unrelated settings are retained", () => {
  const config = profile();
  config["mixed-port"] = 7897;
  config.tun = { enable: true, stack: "gvisor" };
  config.ipv6 = false;
  config["rule-providers"] = { existing: { type: "inline", behavior: "domain", payload: ["example.org"] } };
  const original = JSON.parse(JSON.stringify(config));
  const result = apply(config);
  for (const key of ["proxies", "proxy-groups", "mixed-port", "tun", "ipv6"]) {
    assert.deepEqual(result[key], original[key]);
  }
  assert.deepEqual(result["rule-providers"].existing, original["rule-providers"].existing);
});

test("domestic DNS is added without replacing unrelated DNS policies", () => {
  const config = profile();
  config.dns = {
    enable: true,
    "enhanced-mode": "fake-ip",
    nameserver: ["https://1.1.1.1/dns-query"],
    "proxy-server-nameserver": ["192.0.2.53"],
    "nameserver-policy": { "+.example.org": ["192.0.2.53"] },
  };
  const result = apply(config);
  assert.equal(result.dns.enable, true);
  assert.equal(result.dns["enhanced-mode"], "fake-ip");
  assert.deepEqual(result.dns.nameserver, config.dns.nameserver);
  assert.deepEqual(result.dns["nameserver-policy"]["+.example.org"], ["192.0.2.53"]);
  assert.deepEqual(result.dns["nameserver-policy"]["rule-set:cn-domain"], [
    "https://dns.alidns.com/dns-query", "https://doh.pub/dns-query",
  ]);
  assert.equal(result.dns["direct-nameserver-follow-policy"], true);
  assert.equal(result.dns["respect-rules"], true);
  assert.equal(result.dns["follow-rule"], true);
  assert.deepEqual(result.dns["proxy-server-nameserver"], ["192.0.2.53"]);
});

test("missing and empty proxy-server DNS settings get independent bootstrap resolvers", () => {
  for (const dns of [undefined, {}, { "proxy-server-nameserver": [] }]) {
    const config = profile();
    config.dns = dns;
    const result = apply(config);
    assert.deepEqual(result.dns["default-nameserver"], ["223.5.5.5", "119.29.29.29"]);
    assert.deepEqual(result.dns["proxy-server-nameserver"], ["223.5.5.5", "119.29.29.29"]);
  }
});

test("missing or incorrect proxy groups fail before altering the config", () => {
  for (const config of [{}, profile("Other group")]) {
    const original = JSON.parse(JSON.stringify(config));
    assert.throws(() => apply(config), /Proxy group "PROXY" was not found/);
    assert.deepEqual(config, original);
  }
});
