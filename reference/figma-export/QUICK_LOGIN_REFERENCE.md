# Quick Login Reference Card

## 🔐 Default Test Credentials

### User Login (`/login/user`)
```
Mobile: 0412 345 678
Password: password
→ Redirects to: /user
```

### Nominated Contact Login (`/login/contact`)
```
Mobile: 0423 567 890
Password: password
→ Redirects to: /nominated-contact
```

### Responder Login (`/login/responder`)
```
Default: Mobile (toggle available)
Mobile: 0412 789 456
Email: james.mitchell@legacywolf.com
Password: password
→ Redirects to: /responder
```

### Admin Login (`/login/admin`)
```
Default: Email (toggle available)
Mobile: 0400 000 000
Email: admin@legacywolf.com
Password: password
→ Redirects to: /admin
```

---

## 🎨 Role Color Guide

| Role | Color | Hex | Theme | Login Method |
|------|-------|-----|-------|-------------|
| User | Green | `#B5C42C` | Protective, Guardian | Phone only |
| Nominated Contact | Blue | `#3B82F6` | Trust, Support | Phone only |
| Responder | Orange | `#F97316` | Action, Energy | Phone or Email (toggle) |
| Admin | Purple | `#A855F7` | Authority, Security | Phone or Email (toggle) |

---

## 🗺️ Route Map

| URL | Screen | Access | Login Method |
|-----|--------|--------|-------------|
| `/` | Role Selection Landing | Public | - |
| `/login/user` | User Login | Public | Phone |
| `/login/contact` | Nominated Contact Login | Public | Phone |
| `/login/responder` | Responder Login | Public | Phone/Email |
| `/login/admin` | Admin Login | Public | Phone/Email |
| `/user/*` | User App | Protected | - |
| `/nominated-contact/*` | Nominated Contact App | Protected | - |
| `/responder/*` | Responder App | Protected | - |
| `/admin/*` | Admin App | Protected | - |
| `/role-selector` | Role Switcher (dev) | Protected | - |

---

## 💬 Success Toast Messages

- **User**: "Welcome back — You're protected. Your motion timer is active."
- **Contact**: "Welcome — You're here for someone who matters. Thank you."
- **Responder**: "Clocked in — Ready for dispatch. Stay safe out there."
- **Admin**: "Access granted — Welcome to the admin dashboard."

---

## 🔄 Login Method Toggle (Responder & Admin Only)

**How it works:**
1. See toggle buttons at top of form: "Mobile" | "Email"
2. Click to switch between methods
3. Form field updates automatically:
   - Phone: Shows "Mobile Number" field with tel input
   - Email: Shows "Work Email" or "Admin Email" field with email input
4. Default credentials update when switching
5. Toggle color matches role color (orange for responder, purple for admin)

**Visual Design:**
- Active tab: Colored background (orange/purple) with white text
- Inactive tab: Muted text with hover effect
- Smooth transitions between states

---

## ⚡ Quick Test Commands

```bash
# Start dev server
npm run dev

# Test user login (phone only)
1. Open http://localhost:5173
2. Click "User" card
3. See phone number field: "0412 345 678"
4. Click "Sign In"
5. ✅ Should see User home screen

# Test responder login (phone/email toggle)
1. Click "Responder" card
2. Toggle starts on "Mobile"
3. Click "Email" toggle
4. Field changes to email input
5. Click "Sign In"
6. ✅ Should see Responder home screen

# Test admin login (phone/email toggle)
1. Click "Admin" card
2. Toggle starts on "Email"
3. Click "Mobile" toggle
4. Field changes to phone input
5. Click "Sign In"
6. ✅ Should see Admin dashboard

# Test all roles
Click each role card → See themed login → Test login method → See role view
```

---

## 🎯 Key Features

✅ **Phone-first for Users & Contacts** - Mobile number required  
✅ **Flexible login for Staff** - Responders & Admins can choose phone or email  
✅ **Smooth toggle UI** - Color-coded, instant field updates  
✅ **Auto-updating defaults** - Credentials change with login method  
✅ **Form validation** - Phone: 10+ digits, Email: valid format  
✅ **Australian format** - Phone placeholders show "04XX XXX XXX"  
✅ **Beautiful landing page** with clickable role cards  
✅ **On-brand copy** for each user type  
✅ **Protected route guards** redirect to landing  
✅ **Auto-navigation** after successful login  
✅ **Notification permissions** requested after login  

---

## 🐛 Common Issues & Fixes

### "Phone number validation failing"
- Ensure 10+ characters (including spaces)
- Format: "04XX XXX XXX" or "0412345678"
- Spaces are allowed but not required

### "Toggle not switching field"
- Check React state is updating (`loginMethod` state)
- Check `setValue()` is being called correctly
- Verify form re-renders when state changes

### "Email validation failing on responder/admin"
- Must be valid email format (has @ and domain)
- Example: "name@legacywolf.com"
- Minimum 6 characters total

### "Login button not working"
- Check password is 6+ characters
- Check browser console for errors
- Ensure form validation is passing

---

## 📋 Checklist: "Is Login Working?"

- [ ] Landing page shows at `/`
- [ ] 4 role cards are clickable
- [ ] **User login**: Phone field only
- [ ] **Contact login**: Phone field only
- [ ] **Responder login**: Toggle between Mobile/Email
- [ ] **Admin login**: Toggle between Mobile/Email (defaults to Email)
- [ ] Toggle buttons change color when active
- [ ] Field label updates when toggling
- [ ] Input type changes (tel vs email)
- [ ] Placeholder updates when toggling
- [ ] Pre-filled credentials update when toggling
- [ ] Submit button shows loading state
- [ ] Success toast appears with role-specific message
- [ ] Redirects to correct role view
- [ ] Notification permission requested (User/Contact/Responder)
- [ ] Back button returns to landing
- [ ] Protected routes redirect to `/` when not logged in

---

**All green? You're ready to demo! 🎉**