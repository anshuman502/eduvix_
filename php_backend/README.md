# PHP Backend (XAMPP + phpMyAdmin)

## 1) Create DB + tables
1. Start **Apache** and **MySQL** in XAMPP.
2. Open **phpMyAdmin**: `http://localhost/phpmyadmin`
3. Click **New** database and create: `focus_forge`
4. Click the new database → **SQL** tab → run:
   - `php_backend/database.sql`

## 2) Configure MySQL credentials
Open:
- `php_backend/config.php`

Default is:
- host: `localhost`
- user: `root`
- pass: *(empty)*
- db: `focus_forge`

Update `$db_user` / `$db_pass` if yours differs.

## 3) Endpoints
Your PHP endpoint is:
- `php_backend/auth.php?action=send_otp`
- `php_backend/auth.php?action=verify_otp`
- `php_backend/auth.php?action=register`
- `php_backend/auth.php?action=login`

All endpoints expect JSON POST body (except `action` in querystring).

### Example (send OTP)
`POST http://localhost/focus-forge-os-main/php_backend/auth.php?action=send_otp`

Body:
```json
{
  "phone": "+919999999999"
}
```

### Note on OTP sending
`auth.php` currently returns the OTP in the response (Development mode). Replace the mock section with real Twilio `curl` when ready.

## 4) phpMyAdmin “panel”
This project uses phpMyAdmin that comes with XAMPP.
- URL: `http://localhost/phpmyadmin`

No additional files are required to use it.

