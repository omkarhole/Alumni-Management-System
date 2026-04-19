# 🚀 Backend Quick Start Guide - MongoDB

## ⚡ Quick Setup (3 Steps)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Environment
Create `.env` file in the `backend/` directory:
```env
MONGODB_URI=mongodb://localhost:27017/alumni_db
PORT=5000
# Add other required env variables (JWT_SECRET, etc.)
```

**Option: Use MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/alumni_db
```

### 3️⃣ Start the Server
```bash
npm start          # Production mode
npm run dev        # Development mode (with Nodemon)
```

Server runs at: `http://localhost:5000`

**Verify it works:**
```bash
curl http://localhost:5000
# Should see: "server is running fine"
```

---

## 📊 Current Database: MongoDB

**Environment:**
- ✅ **MongoDB 7.0+** - Document database
- ✅ **Mongoose 8.x** - ODM for schema & validation
- ✅ **Node.js + Express** - Backend framework
- ✅ **7 Collections** - Optimized document structure

## 📚 Collections

The system uses these MongoDB collections:

| Collection | Purpose |
|-----------|---------|
| **users** | Alumni, admins, students with embedded bio |
| **courses** | Course/degree programs |
| **careers** | Career profiles and opportunities |
| **events** | Events and reunions |
| **forumtopics** | Forum discussions with embedded comments |
| **galleries** | Image galleries |
| **systemsettings** | App configuration |

---

## 🔄 Key MongoDB Concepts

---

## 🆘 Troubleshooting

**MongoDB connection failed?**
- Ensure MongoDB is running: `mongod` or use MongoDB Atlas
- Check `MONGODB_URI` in `.env`

**Port already in use?**
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9` (macOS/Linux)

**Dependencies issues?**
- Clean install: `rm -rf node_modules package-lock.json && npm install`

---

## 📚 Resources

- [API_CHANGES.md](./API_CHANGES.md) - API response structure changes
- [MongoDB Docs](https://docs.mongodb.com/) - Official documentation
- [Mongoose Docs](https://mongoosejs.com/) - ODM documentation
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for viewing data

---

**Ready to go! 🎉**
