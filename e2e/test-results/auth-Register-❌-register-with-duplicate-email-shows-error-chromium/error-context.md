# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "ConnectHub" [level=1] [ref=e6]
    - paragraph [ref=e7]: Join millions of people sharing what matters
  - generic [ref=e8]:
    - heading "Create account" [level=2] [ref=e9]
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Display name
        - textbox "Jane Smith" [ref=e13]: Unique User
      - generic [ref=e14]:
        - generic [ref=e15]: Username
        - textbox "janesmith" [ref=e16]: uniqueuser999
      - generic [ref=e17]:
        - generic [ref=e18]: Email
        - textbox "you@example.com" [ref=e19]: alice@demo.com
      - generic [ref=e20]:
        - generic [ref=e21]: Password
        - textbox "At least 8 characters" [ref=e22]: Password1!
      - paragraph [ref=e24]: "Email already registered: alice@demo.com"
      - button "Create account" [ref=e25] [cursor=pointer]
    - paragraph [ref=e26]:
      - text: Already have an account?
      - link "Log in" [ref=e27] [cursor=pointer]:
        - /url: /login
```