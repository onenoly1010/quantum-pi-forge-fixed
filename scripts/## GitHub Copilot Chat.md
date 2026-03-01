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
- DNS ipv4 Lookup: 140.82.114.5 (71 ms)
- DNS ipv6 Lookup: Error (50 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (9 ms)
- Electron fetch (configured): HTTP 200 (331 ms)
- Node.js https: HTTP 200 (372 ms)
- Node.js fetch: HTTP 200 (151 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (73 ms)
- DNS ipv6 Lookup: Error (59 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (10 ms)
- Electron fetch (configured): HTTP 200 (395 ms)
- Node.js https: HTTP 200 (923 ms)
- Node.js fetch: HTTP 200 (430 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 138.91.182.224 (53 ms)
- DNS ipv6 Lookup: Error (102 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (14 ms)
- Electron fetch (configured): HTTP 200 (292 ms)
- Node.js https: HTTP 200 (467 ms)
- Node.js fetch: HTTP 200 (1157 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (231 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (524 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (470 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (667 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (296 ms)

Number of system certificates: 70

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).