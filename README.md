![Image](https://github.com/user-attachments/assets/cfbea1c4-f2a7-4913-806a-b5fdba9255bf)
![Image](https://github.com/user-attachments/assets/47b07ec3-1b78-41c2-85aa-386044e7e75f)
![Image](https://github.com/user-attachments/assets/71f776b2-cc32-4080-9b80-b0a09ce8bbd3)
![Image](https://github.com/user-attachments/assets/e97dc91a-41d9-400b-84f5-d77115232509)

# Run the app

To open the weather app correctly in the browser, use a local web server instead of opening the raw HTML file directly.

1. Open a terminal in the project folder.
2. Run:

```bash
python -m http.server 8000
```

3. Open this page in the browser:

```text
http://localhost:8000/weatherApp_JS/
```

This is the correct URL for the project because the app is served from the project folder and loaded as a browser module app.

Note: Search and weather updates work correctly when the app is served through the local server. Opening the raw file directly may not load the app correctly.
