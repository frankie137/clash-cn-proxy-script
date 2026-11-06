// SPDX-License-Identifier: MIT OR Apache-2.0
// Clash Verge Rev: direct for mainland China and local networks; proxy otherwise.
// Change PROXY_GROUP to the exact name of your existing proxy group.
// This file does not include proxy nodes, subscription URLs, or credentials.
const PROXY_GROUP = "PROXY";
function main(config, profileName) {
  const groups = config["proxy-groups"] || [];
  if (!groups.some(group => group.name === PROXY_GROUP)) {
    throw new Error('Proxy group "' + PROXY_GROUP + '" was not found. Set PROXY_GROUP to an existing proxy group name.');
  }
  config.mode = "rule";
  config["rule-providers"] = Object.assign({}, config["rule-providers"] || {}, {
    "cn-domain": {
      type: "http", behavior: "domain", format: "mrs",
      path: "./ruleset/cn-domain.mrs",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs",
      interval: 86400, proxy: PROXY_GROUP
    },
    "cn-ip": {
      type: "http", behavior: "ipcidr", format: "mrs",
      path: "./ruleset/cn-ip.mrs",
      url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs",
      interval: 86400, proxy: PROXY_GROUP
    }
  });
  config.rules = [
    "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,10.0.0.0/8,DIRECT,no-resolve",
    "IP-CIDR,172.16.0.0/12,DIRECT,no-resolve",
    "IP-CIDR,192.168.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,169.254.0.0/16,DIRECT,no-resolve",
    "IP-CIDR,100.64.0.0/10,DIRECT,no-resolve",
    "IP-CIDR6,::1/128,DIRECT,no-resolve",
    "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
    "IP-CIDR6,fe80::/10,DIRECT,no-resolve",
    "RULE-SET,cn-domain,DIRECT",
    "RULE-SET,cn-ip,DIRECT",
    "MATCH," + PROXY_GROUP
  ];
  const dns = config.dns || {};
  const domesticDns = ["https://dns.alidns.com/dns-query", "https://doh.pub/dns-query"];
  dns["default-nameserver"] = ["223.5.5.5", "119.29.29.29"];
  dns["nameserver-policy"] = Object.assign({}, dns["nameserver-policy"] || {}, {
    "rule-set:cn-domain": domesticDns
  });
  dns["direct-nameserver"] = domesticDns;
  dns["direct-nameserver-follow-policy"] = true;
  config.dns = dns;
  return config;
}
