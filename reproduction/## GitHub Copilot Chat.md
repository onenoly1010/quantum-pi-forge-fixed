## GitHub Copilot Chat

- Extension: 0.37.4 (prod)
- VS Code: 1.109.0 (bdd88df003631aaa0bcbe057cb0a940b80a476fa)
- OS: win32 10.0.19045 x64
- GitHub Account: onenoly1010

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.113.5 (182 ms)
- DNS ipv6 Lookup: Error (170 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (8 ms)
- Electron fetch (configured): HTTP 200 (874 ms)
- Node.js https: HTTP 200 (3322 ms)
- Node.js fetch: HTTP 200 (12779 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.112.21 (71 ms)
- DNS ipv6 Lookup: Error (263 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (106 ms)
- Electron fetch (configured): HTTP 200 (449 ms)
- Node.js https: HTTP 200 (416 ms)
- Node.js fetch: HTTP 200 (385 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 138.91.182.224 (57 ms)
- DNS ipv6 Lookup: Error (68 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (34 ms)
- Electron fetch (configured): HTTP 200 (325 ms)
- Node.js https: HTTP 200 (291 ms)
- Node.js fetch: HTTP 200 (263 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (810 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (318 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (425 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (408 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (305 ms)

Number of system certificates: 70

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).
