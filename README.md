# Authentication & Database Module – Projector5  

## Module Purpose  
- Provide secure authentication for users and drivers.  
- Implement login, logout, register, reset password functionality.  
- Handle session management using tokens (valid for 24h).  
- Enable integration with other modules via API (not direct DB access).  
- Manage database tables required by multiple modules (e.g., paymentsHistory).  

---

## Technology Stack  
- **Language**: C++  
- **Database**: PostgreSQL  
- **Library**: libpqxx (PostgreSQL client for C++)  
- **Communication**: HTTP over TCP  
- **Deployment**: Docker  

---

## Authentication Functionality Levels  
### Level 1 (Mandatory)  
- Register  
- Login  
- Logout  
- Session Validation (`/auth/me`)  

### Level 2 (Optional / Later)  
- Forget Password  
- Reset Password  

### Level 3 (Future Enhancements)  
- Remember Me  
- Customer Support features  

---

## API Endpoints  

### Authentication  
- `POST /auth/register` → Create new account  
- `POST /auth/login` → Validate credentials, issue token  
- `POST /auth/logout` → Revoke token  
- `GET /auth/me` → Return current account info  
- `POST /auth/forget-password` → (Level 2) send reset link  
- `POST /auth/reset-password` → (Level 2) reset password  

### Database Service  
- Other modules will interact **via APIs** only (no direct DB access).  
- Planned tables:
  - `AccountIdentity` (for Authentication Module)
  - `AccountPassword` (for Authentication Module)
  - `TokenIdentity` (for Authentication Module)
  - `PaymentHistory` (for Payment Module)  
  - Additional tables → to be defined as needed  

---

## Data Structures 

### AccountIdentity  
- `account_id` (UUID, PK)  
- `username` (string, unique)  
- `email` (string, unique)  
- `role` (enum: user, driver)  

### AccountPassword  
- `account_id` (FK → AccountIdentity)  
- `password_hash` (string, securely hashed)  

### TokenIdentity  
- `token_id` (UUID, PK)  
- `account_id` (FK → AccountIdentity)  
- `issued_at` (timestamp)  
- `expires_at` (timestamp, 24h default)  
- `revoked_at` (nullable timestamp)

**Note:**  
- These 3 tables are part of the **Authentication Module** (internal use).  
- Additional tables for other modules (e.g., `PaymentHistory`) will be created **on request** and exposed **only through APIs**, never via direct DB access.

---

## Token Management  
- Tokens stored in `TokenIdentity` table  
- Validity: **24 hours**  
- On logout → token is revoked  
- API calls must include:  
- Authorization: Bearer <token>
  - `/auth/me` validates token and returns:  
  - `200 OK` if valid  
  - `401 Unauthorized` if invalid/expired  
  - `403 Forbidden` if account disabled  

---

## Integration  
- Other modules must:  
1. Use `/auth/register` + `/auth/login` to create accounts  
2. Call `/auth/me` before protected APIs  
3. Never access database directly  

---

## Testing Plan  
- **Sprint 1**: Manual testing with Postman  

---

## Current Progress (Sprint 1)  
- GitHub repo initialized  
- API endpoints designed  
- Database schema drafted  
- Documentation prepared (README + slides)  

---

## Release Notes  
### v0.1.0 – Sprint 1  
- Initial documentation added  
- Authentication API endpoints defined  
- Database schema drafted (4 core tables)  
- Token management strategy (24h validity)  

---

## Team Members  
- Joshua Salmons
- Andy Guest 
- Henil Jariwala
- Kuldeep Singh
- Thinh Nguyen
- Krunalkumar Maheshkumar Patel
