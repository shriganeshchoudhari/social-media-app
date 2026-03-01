# Page snapshot

```yaml
- generic [ref=e3]:
  - main [ref=e4]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - button "Go back" [ref=e8] [cursor=pointer]:
          - img [ref=e9]
        - heading "Post" [level=1] [ref=e11]
      - paragraph [ref=e12]: Post not found
  - navigation "Main navigation" [ref=e13]:
    - link "Home" [ref=e14] [cursor=pointer]:
      - /url: /
      - img [ref=e16]
      - text: Home
    - link "Search" [ref=e19] [cursor=pointer]:
      - /url: /search
      - img [ref=e21]
      - text: Search
    - link "DMs" [ref=e24] [cursor=pointer]:
      - /url: /messages
      - img [ref=e26]
      - text: DMs
    - link "Alerts" [ref=e28] [cursor=pointer]:
      - /url: /notifications
      - img [ref=e30]
      - text: Alerts
    - link "Profile" [ref=e33] [cursor=pointer]:
      - /url: /profile/alice
      - img [ref=e35]
      - text: Profile
  - button "Open Spark AI assistant" [ref=e38] [cursor=pointer]:
    - generic [ref=e39]: ⚡
    - generic [ref=e40]: Ask Spark
```