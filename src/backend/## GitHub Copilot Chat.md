## GitHub Copilot Chat

- Extension Version: 0.23.2 (prod)
- VS Code: vscode/1.96.4
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (74 ms)
- DNS ipv6 Lookup: Error (257 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (14 ms)
- Electron fetch (configured): HTTP 200 (576 ms)
- Node.js https: HTTP 200 (382 ms)
- Node.js fetch: HTTP 200 (182 ms)
- Helix fetch: HTTP 200 (371 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 146.112.61.104 (60 ms)
- DNS ipv6 Lookup: Error (170 ms): getaddrinfo ENOENT api.individual.githubcopilot.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): Error (376 ms): net::ERR_SSL_VERSION_OR_CIPHER_MISMATCH
- Node.js https: Error (398 ms): write EPROTO 280960:error:10000410:SSL routines:OPENSSL_internal:SSLV3_ALERT_HANDSHAKE_FAILURE:..\..\third_party\boringssl\src\ssl\tls_record.cc:592:SSL alert number 40
- Node.js fetch: Error (397 ms): fetch failed
  280960:error:10000410:SSL routines:OPENSSL_internal:SSLV3_ALERT_HANDSHAKE_FAILURE:..\..\third_party\boringssl\src\ssl\tls_record.cc:592:SSL alert number 40
- Helix fetch: Error (1403 ms): 280960:error:10000410:SSL routines:OPENSSL_internal:SSLV3_ALERT_HANDSHAKE_FAILURE:..\..\third_party\boringssl\src\ssl\tls_record.cc:592:SSL alert number 40

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).