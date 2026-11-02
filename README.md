# Shafin's Virtual Gift
Run locally (QR/Web Share need http, not file://):  `python3 -m http.server 8000`  then open http://localhost:8000
Login: ksshafin18 / 1111

Static demo limits: gifts, login and 24h expiry live in this browser's LocalStorage. A QR scanned on another phone
will show "Gift Not Found". Reliable cross-device sharing, secure auth and global expiry need a backend
(Firebase/Supabase). Only storage.js touches data, so replace its methods with async DB calls and set BASE_URL.
