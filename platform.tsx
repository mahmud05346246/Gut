################################################################################
#                   مجموعة الأكواد الإمرائية والبرمجية المتكاملة لمركز الرضوان                   #
#        COMPLETE INTEGRATED SOURCE CODE OF AL-RADWAN FULL-STACK PLATFORM       #
#  This file contains the complete source code for back-end, front-end, and config  #
#  You can copy any section or copy the whole file.                             #
################################################################################

================================================================================
الملف: package.json
================================================================================

{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^6.2.3",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3",
    "@types/express": "^4.17.21"
  }
}



================================================================================
الملف: vite.config.ts
================================================================================

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});



================================================================================
الملف: tsconfig.json
================================================================================

{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}



================================================================================
الملف: index.html
================================================================================

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Google AI Studio App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>




================================================================================
الملف: server.ts
================================================================================

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  Setting, 
  Category, 
  Product, 
  Banner, 
  Partner, 
  Ad, 
  Order, 
  User, 
  Admin,
  ProductReview,
  PaymentMethod,
  SocialLink
} from "./src/types";

// Define a local JSON database path inside workspace
const DB_PATH = path.join(process.cwd(), "db_persisted.json");

function hashPassword(password: string): string {
  if (!password) return "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

interface Database {
  settings: Record<string, string>;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  partners: Partner[];
  ads: Ad[];
  orders: Order[];
  users: User[];
  admins: Admin[];
  images: Record<string, { mimeType: string; data: string }>; // Key -> Base64 data
  reviews: ProductReview[];
  payment_methods: PaymentMethod[];
  social_links: SocialLink[];
  ai_conversations?: any[];
  ai_settings: {
    is_enabled: number;
    system_instruction: string;
    personality: string;
    welcome_message: string;
    usage_count: number;
    is_strict?: number;
    strict_commands?: string;
    voice_triggers?: {
      trigger_key: string;
      audio_base64: string;
      mime_type: string;
      filename: string;
      updated_at: number;
    }[];
  };
}

// Initial default seed data
const DEFAULT_DATABASE: Database = {
  ai_conversations: [],
  settings: {
    site_name: "مركز الرضوان لمواد البناء",
    header_announcement: "🔔 حسومات كبرى تصل لغاية 15% على أدوات تأسيس السباكة والكهرباء!",
    currency: "ل.س",
    whatsapp: "963955566778",
    phone: "0115432100",
    search_placeholder: "ابحث عن الاسمنت البورتلاندي، حديد التسليح، الأنابيب، الخلاطات...",
    site_description: "مركز الرضوان هو المنصة والموزع الأول لتأمين كافة مواد البناء الإنشائية والأدوات الصحية والكهربائية عالية القوام في دمشق وريفها. جودة معتمدة وخدمة تحميل متميزة."
  },
  categories: [
    { id: 1, name: "المواد الإنشائية الأساسية", slug: "basic-materials", sort_order: 1, is_visible: 1 },
    { id: 2, name: "الأدوات الصحية والسباكة", slug: "plumbing-sanitary", sort_order: 2, is_visible: 1 },
    { id: 3, name: "عدد البناء والمعدات", slug: "construction-tools", sort_order: 3, is_visible: 1 },
    { id: 4, name: "المواد العازلة والدهانات", slug: "insulation-paints", sort_order: 4, is_visible: 1 }
  ],
  products: [
    {
      id: 101,
      name: "إسمنت بورتلاندي مقاوم للأملاح (50كغ)",
      description: "إسمنت عالي المقوّية والمقاومة للكبريتات ورطوبة التربة، معتمد لتأسيس القواعد والخرسانة الإنشائية.",
      price: 185000,
      sale_price: 175000,
      quantity: 550,
      category_id: 1,
      image_key: null,
      status: "active",
      whatsapp: "963955566778"
    },
    {
      id: 102,
      name: "حديد تسليح مبروم مشرك (12 ملم)",
      description: "حديد تسليح مطاوع ذو جودة عالية ومرونة متميزة لمقاومة الزلازل، يباع بالطن أو السيخ المفرد حسب الطلب.",
      price: 9500000,
      sale_price: null,
      quantity: 40,
      category_id: 1,
      image_key: null,
      status: "active",
      whatsapp: "963955566778"
    },
    {
      id: 103,
      name: "أنابيب مياه خضراء مقاومة للحرارة (1 إنش)",
      description: "أنبوب بولي بروبلين (PPR) ألماني المنشأ مخصص لشبكات المياه الساخنة والباردة بعمر افتراضي يفوق 50 سنة.",
      price: 24000,
      sale_price: 21500,
      quantity: 1200,
      category_id: 2,
      image_key: null,
      status: "active",
      whatsapp: "963955566778"
    },
    {
      id: 104,
      name: "خلاط مجلى كروم ممتاز فخم",
      description: "خلاط مياه نحاسي مغطى بطبقة كروم لامعة مقاومة للتكلس، يدعم التحكم البارد والساخن بنظام ترشيد المياه.",
      price: 360000,
      sale_price: 320000,
      quantity: 65,
      category_id: 2,
      image_key: null,
      status: "active",
      whatsapp: "963955566778"
    },
    {
      id: 105,
      name: "عازل مائي سائل (دهان مطاطي - 20كغ)",
      description: "عازل إكريليكي مطاطي عالي المرونة لحماية الرطوبة ومقاومة وتصدع الأسطح وخزانات المياه بجودة مضمونة.",
      price: 480000,
      sale_price: null,
      quantity: 15,
      category_id: 4,
      image_key: null,
      status: "active",
      whatsapp: "963955566778"
    }
  ],
  banners: [],
  partners: [],
  ads: [
    {
      id: 501,
      user_id: null,
      user_name: "المهندس أسامة",
      title: "يتوفر بلوك مفرغ قياس 20 سم بحالة ممتازة للبيع",
      description: "عندي كمية فائضة من ورشة بناء حوالي 1200 بلوكة مفرغة ممتازة للبيع بسعر حرق لوجه السرعة. يرجى الاتصال للتنسيق.",
      contact: "963933112233",
      image_key: null,
      is_active: 1,
      is_pinned: 1,
      created_at: Date.now() - 3600000 * 24
    }
  ],
  orders: [],
  users: [
    { id: 1, name: "أحمد الفهد", email: "ahmad@gmail.com", is_active: 1, created_at: Date.now() }
  ],
  admins: [
    { id: 1001, name: "المشرف محمود", email: "m@gmail.gom", role: "super_admin", created_at: Date.now() }
  ],
  images: {},
  reviews: [],
  payment_methods: [
    {
      id: 1,
      type: "sham_cash",
      name: "شام كاش - مركز الرضوان الرئيسي",
      account_name: "شركة الرضوان للتجارة والمقاولات",
      account_number: "963955566778",
      qr_key: null,
      instructions: "يرجى تحويل القيمة الإجمالية للمواد مضافة إليها تفاصيل الحمولة إلى رقم حساب شام كاش الموضح، ثم رفع لقطة شاشة تدل على إتمام عملية التحويل لسرعة تعميدها وشحن حمولة الإسمنت والحديد بالكامل.",
      is_active: 1,
      sort_order: 1
    },
    {
      id: 2,
      type: "crypto",
      name: "USDT TRC20 (العملات الرقمية)",
      network_name: "TRC20",
      currency_name: "USDT",
      wallet_address: "TYG3j8ZfL6HnSwM7gBvXyPzYq36wK8p9tX",
      qr_key: null,
      instructions: "من فضلك قم بإرسال عملة USDT على شبكة TRC20 للعنوان المذكور والتحقق التام من الشبكة ومراعاة عمولة التحويل لضمان تطابق مدفوعات المعاملة.",
      is_active: 1,
      sort_order: 2
    }
  ],
  social_links: [
    { id: 1, platform: 'facebook', url: 'https://facebook.com', is_active: 1 },
    { id: 2, platform: 'whatsapp', url: 'https://wa.me/963955566778', is_active: 1 },
    { id: 3, platform: 'telegram', url: 'https://t.me/alradwan_center', is_active: 1 },
    { id: 4, platform: 'instagram', url: 'https://instagram.com', is_active: 1 },
    { id: 5, platform: 'tiktok', url: 'https://tiktok.com', is_active: 1 },
    { id: 6, platform: 'youtube', url: 'https://youtube.com', is_active: 1 },
    { id: 7, platform: 'x', url: 'https://x.com', is_active: 1 }
  ],
  ai_settings: {
    is_enabled: 1,
    system_instruction: "أنت مساعد ذكي ومتخصص لمركز الرضوان لمواد البناء والأدوات الصحية والكهربائية بدمشق وباقي المحافظات السورية. مهمتك هي إرشاد العملاء بخصوص الإسمنت، والحديد، والمواد العازلة، والدهانات، والتأسيسات المتكاملة والمقاولات وحساب الكميات. أجب بكلام لطيف وسوري مهني ومختصر ومقنع يخدم مصلحة العميل بوضوح.",
    personality: "خبير ومستشار فني محترف في حساب كميات مواد البناء والمقاولات الإنشائية بمركز الرضوان.",
    welcome_message: "مرحباً بك في مركز الرضوان لمواد البناء والأدوات الإنشائية! 🏗️ أنا مستشارك الذكي المدرب على حساب الكميات وفحص أسعار الكتالوج، كيف يمكنني مساعدتك في ورشة العمل الخاصة بك اليوم؟",
    usage_count: 5,
    is_strict: 0,
    strict_commands: "",
    voice_triggers: []
  }
};

// Database state accessor functions
function readDb(): Database {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      const db = JSON.parse(data);
      // Migrate and ensure arrays are initialized
      db.reviews = db.reviews || [];
      db.partners = db.partners || [];
      db.images = db.images || {};
      db.ai_conversations = db.ai_conversations || [];
      db.payment_methods = db.payment_methods || DEFAULT_DATABASE.payment_methods;
      db.social_links = db.social_links || DEFAULT_DATABASE.social_links;
      db.ai_settings = db.ai_settings || DEFAULT_DATABASE.ai_settings;
      db.ai_settings.is_strict = db.ai_settings.is_strict !== undefined ? db.ai_settings.is_strict : 0;
      db.ai_settings.strict_commands = db.ai_settings.strict_commands || "";
      db.ai_settings.voice_triggers = db.ai_settings.voice_triggers || [];
      
      // Hot-fix Migrate: replace admin@alradwan.com with m@gmail.gom
      if (db.admins) {
        db.admins = db.admins.filter((a: any) => a.email !== "admin@alradwan.com");
        if (!db.admins.some((a: any) => a.email === "m@gmail.gom" || a.email === "m@gmail.com")) {
          db.admins.push({
            id: 1001,
            name: "المشرف محمود",
            email: "m@gmail.gom",
            role: "super_admin",
            created_at: Date.now()
          });
        }
      }
      return db;
    }
  } catch (e) {
    console.error("Error reading database file", e);
  }
  return DEFAULT_DATABASE;
}

// ----------------------------------------------------------------------
// DATA PROTECTION, REDUNDANCY, & AT-REST AES-255-CBC ENCRYPTION SYSTEM
// ----------------------------------------------------------------------
const BACKUP_DIR = path.join(process.cwd(), "data_backups");
const REPLICA_DIR = path.join(process.cwd(), "data_redundancy_replicas");
const REPLICA_PATH = path.join(REPLICA_DIR, "db_replica.json");
const MANIFEST_PATH = path.join(BACKUP_DIR, "backup_manifest.json");

const ENCRYPTION_PASSWORD = "AlRadwan_DataProtection_StandardSecretK3y_2026!";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(ENCRYPTION_PASSWORD).digest(); // SHA256 stable key

function ensureDataProtectionDirectories() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(REPLICA_DIR)) {
      fs.mkdirSync(REPLICA_DIR, { recursive: true });
    }
    if (!fs.existsSync(MANIFEST_PATH)) {
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Failed to initialize folders for Data Protection:", err);
  }
}

function encryptData(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (e) {
    console.error("Encryption failed:", e);
    throw e;
  }
}

function decryptData(encryptedText: string): string {
  try {
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encryptedTextPart = parts[1];
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedTextPart, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (e) {
    console.error("Decryption failed:", e);
    throw e;
  }
}

function syncRedundantReplica() {
  try {
    ensureDataProtectionDirectories();
    if (fs.existsSync(DB_PATH)) {
      fs.copyFileSync(DB_PATH, REPLICA_PATH);
    }
  } catch (e) {
    console.error("Failed to mirror redundancy replica:", e);
  }
}

interface BackupItem {
  filename: string;
  timestamp: number;
  size: number;
  encrypted: boolean;
  checksum: string;
  type: "automatic" | "manual";
}

function readManifest(): BackupItem[] {
  try {
    ensureDataProtectionDirectories();
    if (fs.existsSync(MANIFEST_PATH)) {
      return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading backup manifest:", e);
  }
  return [];
}

function writeManifest(manifest: BackupItem[]) {
  try {
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing backup manifest:", e);
  }
}

function createSecureBackup(type: "automatic" | "manual" = "manual"): BackupItem | null {
  try {
    ensureDataProtectionDirectories();
    if (!fs.existsSync(DB_PATH)) {
      return null;
    }
    const dbContent = fs.readFileSync(DB_PATH, "utf-8");
    const encryptedContent = encryptData(dbContent);
    const timestamp = Date.now();
    const filename = `backup_${timestamp}.enc`;
    const fullPath = path.join(BACKUP_DIR, filename);
    
    fs.writeFileSync(fullPath, encryptedContent, "utf-8");
    
    // Checksum for security auditing
    const checksum = crypto.createHash("sha256").update(encryptedContent).digest("hex");
    const size = fs.statSync(fullPath).size;
    
    const manifest = readManifest();
    const newItem: BackupItem = {
      filename,
      timestamp,
      size,
      encrypted: true,
      checksum,
      type
    };
    
    manifest.unshift(newItem);
    
    // Keep max 10 backups
    if (manifest.length > 10) {
      const removed = manifest.splice(10);
      removed.forEach(item => {
        try {
          const p = path.join(BACKUP_DIR, item.filename);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch { /* ignore */ }
      });
    }
    
    writeManifest(manifest);
    return newItem;
  } catch (err) {
    console.error("Backup creation failed:", err);
    return null;
  }
}

function writeDb(db: Database) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    // Ensure hot redundant replication matches instantly
    syncRedundantReplica();
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

// Global active sessions (simulating session state securely in the express request framework)
let sessionUser: User | null = null;
let sessionAdmin: Admin | null = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON payload with 25MB limit to allow direct Base64 image transfers
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Initialize DB if not configured
  if (!fs.existsSync(DB_PATH)) {
    writeDb(DEFAULT_DATABASE);
  }

  // Ensure directories are created on startup & hot redundance mirrors are synced
  ensureDataProtectionDirectories();
  syncRedundantReplica();

  // Create an automatic backup if none exists
  const currentBackups = readManifest();
  if (currentBackups.length === 0) {
    createSecureBackup("automatic");
  }

  // Schedule background automatic archives every 12 hours (State Backup Persistence)
  setInterval(() => {
    try {
      createSecureBackup("automatic");
      console.log("Scheduled secure automatic encrypted backup saved in the background.");
    } catch (err) {
      console.error("Scheduled background backup failed:", err);
    }
  }, 12 * 60 * 60 * 1000);

  // ----------------------------------------------------------------------
  // REST API Endpoints
  // ----------------------------------------------------------------------

  // 1. Settings CMS
  app.get("/api/settings", (req, res) => {
    const db = readDb();
    res.json(db.settings);
  });

  app.post("/api/settings", (req, res) => {
    const db = readDb();
    db.settings = { ...db.settings, ...req.body };
    writeDb(db);
    res.json({ success: true, settings: db.settings });
  });

  // 2. Categories CRUD
  app.get("/api/categories", (req, res) => {
    const db = readDb();
    res.json(db.categories);
  });

  app.post("/api/categories", (req, res) => {
    const db = readDb();
    const newCat: Category = {
      id: Date.now(),
      name: req.body.name,
      slug: req.body.slug,
      sort_order: Number(req.body.sort_order || 0),
      is_visible: Number(req.body.is_visible ?? 1)
    };
    db.categories.push(newCat);
    writeDb(db);
    res.json(newCat);
  });

  app.put("/api/categories/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.categories = db.categories.map(c => 
      c.id === id 
        ? { ...c, ...req.body } 
        : c
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.delete("/api/categories/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.categories = db.categories.filter(c => c.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // 3. Products CRUD
  app.get("/api/products", (req, res) => {
    const db = readDb();
    // Resolve category and owner publisher details
    const resolved = db.products.map(p => {
      const cat = db.categories.find(c => c.id === p.category_id);
      const reviews = (db.reviews || []).filter(r => r.product_id === p.id && !r.parent_id);
      const rating_count = reviews.length;
      const total_rating = reviews.reduce((acc, r) => acc + r.rating, 0);
      const rating_avg = rating_count > 0 ? Number((total_rating / rating_count).toFixed(1)) : 0;
      
      const publisherId = p.owner_id || p.creator_id || p.user_id;
      const publisher = publisherId ? db.users.find(u => u.id === publisherId) : null;
      
      return {
        ...p,
        category_name: cat ? cat.name : "مواد أساسية",
        rating_avg,
        rating_count,
        user_name: publisher ? publisher.name : (p.user_name || "إشراف الرضوان"),
        user_avatar: publisher ? publisher.avatar_key : null,
        user_kycStatus: publisher ? publisher.kycStatus : "verified", // Seeding system accounts as verified
        user_is_verified: publisher ? (publisher.kycStatus === 'verified') : true
      };
    });
    res.json(resolved);
  });

  app.post("/api/products", (req, res) => {
    if (!sessionUser && !sessionAdmin) {
      return res.status(401).json({ error: "يجب تسجيل الدخول أولاً لتتمكن من إضافة سلع للمتجر." });
    }
    const db = readDb();
    
    const activeUserId = sessionUser ? sessionUser.id : (sessionAdmin ? sessionAdmin.id : 9999);
    const activeUserName = sessionUser ? sessionUser.name : (sessionAdmin ? sessionAdmin.name : "مشرف الرضوان");
    
    const newProduct: Product = {
      id: Date.now(),
      name: req.body.name,
      description: req.body.description || "",
      price: Number(req.body.price),
      sale_price: req.body.sale_price ? Number(req.body.sale_price) : null,
      quantity: Number(req.body.quantity || 0),
      category_id: req.body.category_id ? Number(req.body.category_id) : null,
      status: req.body.status || "active",
      whatsapp: req.body.whatsapp || null,
      image_key: req.body.image_key || null,
      video_key: req.body.video_key || null,
      video_url: req.body.video_url || null,
      user_id: activeUserId,
      user_name: activeUserName,
      owner_id: activeUserId,
      creator_id: activeUserId,
      created_at: Date.now()
    };

    db.products.push(newProduct);
    writeDb(db);
    res.json(newProduct);
  });

  app.put("/api/products/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const product = db.products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ error: "المادة غير موجودة بالمتجر." });
    }

    // Check ownership & admin permission
    const isOwner = sessionUser && (product.owner_id === sessionUser.id || product.creator_id === sessionUser.id || product.user_id === sessionUser.id);
    const isAdmin = !!sessionAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "عذراً، صلاحيات غير كافية لعمل هذا الإجراء. لا يمكنك تعديل سوى منشوراتك وسلعك الخاصة." });
    }

    db.products = db.products.map(p => 
      p.id === id 
        ? { 
            ...p, 
            ...req.body, 
            price: Number(req.body.price), 
            quantity: Number(req.body.quantity),
            // Ensure owner/creator ID CANNOT be overwritten by client-side requests (anti-impersonation)
            user_id: p.user_id,
            user_name: p.user_name,
            owner_id: p.owner_id,
            creator_id: p.creator_id
          } 
        : p
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const product = db.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: "المادة غير موجودة بالمتجر." });
    }

    // Check ownership & admin permission
    const isOwner = sessionUser && (product.owner_id === sessionUser.id || product.creator_id === sessionUser.id || product.user_id === sessionUser.id);
    const isAdmin = !!sessionAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "عذراً، صلاحيات غير كافية لعمل هذا الإجراء. لا يمكنك حذف سوى منشوراتك وسلعك الخاصة." });
    }

    db.products = db.products.filter(p => p.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // Product Reviews APIs
  app.get("/api/products/:productId/reviews", (req, res) => {
    const db = readDb();
    const productId = Number(req.params.productId);
    const reviews = (db.reviews || []).filter(r => r.product_id === productId);
    res.json(reviews);
  });

  app.post("/api/products/:productId/reviews", (req, res) => {
    const db = readDb();
    const productId = Number(req.params.productId);
    const newReview = {
      id: Date.now(),
      product_id: productId,
      user_name: req.body.user_name || "عميل مركز الرضوان",
      rating: Number(req.body.rating || 5),
      comment: req.body.comment || "",
      parent_id: req.body.parent_id ? Number(req.body.parent_id) : null,
      created_at: Date.now()
    };
    db.reviews = db.reviews || [];
    db.reviews.push(newReview);
    writeDb(db);
    res.json(newReview);
  });

  // 4. Banners Slider
  app.get("/api/banners", (req, res) => {
    const db = readDb();
    res.json(db.banners);
  });

  app.post("/api/banners", (req, res) => {
    const db = readDb();
    const newBanner: Banner = {
      id: Date.now(),
      title: req.body.title || null,
      image_key: req.body.image_key,
      link: req.body.link || null,
      sort_order: Number(req.body.sort_order || 0),
      banner_type: req.body.banner_type || "slider",
      is_active: Number(req.body.is_active ?? 1)
    };
    db.banners.push(newBanner);
    writeDb(db);
    res.json(newBanner);
  });

  app.delete("/api/banners/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.banners = db.banners.filter(b => b.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // 5. Partners
  app.get("/api/partners", (req, res) => {
    const db = readDb();
    res.json(db.partners);
  });

  app.post("/api/partners", (req, res) => {
    const db = readDb();
    const newPartner: Partner = {
      id: Date.now(),
      name: req.body.name || null,
      logo_key: req.body.logo_key,
      sort_order: Number(req.body.sort_order || 0),
      is_active: Number(req.body.is_active ?? 1)
    };
    db.partners.push(newPartner);
    writeDb(db);
    res.json(newPartner);
  });

  app.delete("/api/partners/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.partners = db.partners.filter(p => p.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // ----------------------------------------------------------------------
  // 5b. CONFIGURABLE PAYMENT METHODS CRUD
  // ----------------------------------------------------------------------
  app.get("/api/payment_methods", (req, res) => {
    const db = readDb();
    res.json(db.payment_methods || []);
  });

  app.post("/api/payment_methods", (req, res) => {
    const db = readDb();
    const newMethod: PaymentMethod = {
      id: Date.now(),
      type: req.body.type || "custom",
      name: req.body.name || "",
      account_name: req.body.account_name || null,
      account_number: req.body.account_number || null,
      qr_key: req.body.qr_key || null,
      instructions: req.body.instructions || null,
      network_name: req.body.network_name || null,
      currency_name: req.body.currency_name || null,
      wallet_address: req.body.wallet_address || null,
      is_active: Number(req.body.is_active ?? 1),
      sort_order: Number(req.body.sort_order || 0)
    };
    db.payment_methods.push(newMethod);
    writeDb(db);
    res.json(newMethod);
  });

  app.put("/api/payment_methods/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const index = db.payment_methods.findIndex(p => p.id === id);
    if (index !== -1) {
      db.payment_methods[index] = {
        ...db.payment_methods[index],
        ...req.body,
        id // enforce original id
      };
      writeDb(db);
      res.json(db.payment_methods[index]);
    } else {
      res.status(404).json({ error: "طريقة دفع غير متوفرة" });
    }
  });

  app.delete("/api/payment_methods/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.payment_methods = db.payment_methods.filter(p => p.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // ----------------------------------------------------------------------
  // 5c. SOCIAL CUSTOM CHANNELS CRUD
  // ----------------------------------------------------------------------
  app.get("/api/social_links", (req, res) => {
    const db = readDb();
    res.json(db.social_links || []);
  });

  app.post("/api/social_links", (req, res) => {
    const db = readDb();
    const newLink: SocialLink = {
      id: Date.now(),
      platform: req.body.platform,
      url: req.body.url,
      is_active: Number(req.body.is_active ?? 1)
    };
    db.social_links.push(newLink);
    writeDb(db);
    res.json(newLink);
  });

  app.put("/api/social_links/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const index = db.social_links.findIndex(s => s.id === id);
    if (index !== -1) {
      db.social_links[index] = {
        ...db.social_links[index],
        ...req.body,
        id
      };
      writeDb(db);
      res.json(db.social_links[index]);
    } else {
      res.status(404).json({ error: "الرابط غير موجود" });
    }
  });

  app.delete("/api/social_links/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.social_links = db.social_links.filter(s => s.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // ----------------------------------------------------------------------
  // 5d. AI ASSISTANT SETTINGS CRUD
  // ----------------------------------------------------------------------
  app.get("/api/ai_settings", (req, res) => {
    const db = readDb();
    res.json(db.ai_settings || { is_enabled: 1 });
  });

  app.put("/api/ai_settings", (req, res) => {
    const db = readDb();
    db.ai_settings = {
      ...db.ai_settings,
      ...req.body
    };
    writeDb(db);
    res.json(db.ai_settings);
  });

  // ----------------------------------------------------------------------
  // 5d-1. VOICE FILE / MIC TRIGGER CHANNELS (AUTOPLAY BACKEND)
  // ----------------------------------------------------------------------
  app.get("/api/ai/voice_triggers", (req, res) => {
    const db = readDb();
    const triggers = db.ai_settings.voice_triggers || [];
    res.json(triggers);
  });

  app.post("/api/ai/voice_triggers", (req, res) => {
    const db = readDb();
    const { trigger_key, audio_base64, mime_type, filename } = req.body;
    if (!trigger_key || !audio_base64) {
      return res.status(400).json({ error: "شحنة الصوت والرمز المفتاحي مفقودة." });
    }

    db.ai_settings.voice_triggers = db.ai_settings.voice_triggers || [];
    const idx = db.ai_settings.voice_triggers.findIndex((t: any) => t.trigger_key === trigger_key);
    
    const triggerData = {
      trigger_key,
      audio_base64,
      mime_type: mime_type || "audio/mp3",
      filename: filename || `${trigger_key}_audio.mp3`,
      updated_at: Date.now()
    };

    if (idx >= 0) {
      db.ai_settings.voice_triggers[idx] = triggerData;
    } else {
      db.ai_settings.voice_triggers.push(triggerData);
    }

    writeDb(db);
    res.json({ success: true, trigger: triggerData });
  });

  // ----------------------------------------------------------------------
  // 5d-2. NEURAL TTS GENERATOR (ADVANCED AI SPEECH WITH HUMAN CADENCING)
  // ----------------------------------------------------------------------
  app.post("/api/ai/tts", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "الرجاء إدخال النص لتحويله لصوت" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "مفتاح خادم الذكاء الاصطناعي غير متوفر حالياً لتجميع نبرة الصوت." });
    }

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const client = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      // Prompt model with exquisite phonetic directive for a cheerful, friendly, realistic 20yo girl
      const prompt = `أنت بنت سورية شابة لطيفة وودية للغاية عمرها عشرين سنة، صوتك بشري 100% ومثير للاهتمام وجذاب ومناسب جداً للترحيب بالعملاء وحل مشاكلهم بهدوء متزن. انطق النص المذكور تالياً بكامل الود والدقة دون كتابة أي كلام تمهيدي أو تفسير:
"${text}"`;

      const response = await client.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("خادم التوليد الصوتي لم يرجع شحنة صوتية.");
      }

      res.json({ audio: base64Audio });
    } catch (err: any) {
      console.error("Advanced TTS Engine failure:", err);
      res.status(500).json({ error: `فشل نظام التوليف العصبي المتقدم: ${err.message}` });
    }
  });

  // ----------------------------------------------------------------------
  // 5d-2. AI CONVERSATIONS PINNED HISTORY CRUD
  // ----------------------------------------------------------------------
  app.get("/api/ai/conversations", (req, res) => {
    const db = readDb();
    db.ai_conversations = db.ai_conversations || [];
    
    if (!sessionUser) {
      return res.json([]);
    }
    
    const userConvs = db.ai_conversations.filter((c: any) => c.user_id === sessionUser!.id);
    userConvs.sort((a: any, b: any) => (b.updated_at || 0) - (a.updated_at || 0));
    res.json(userConvs);
  });

  app.post("/api/ai/conversations", (req, res) => {
    const db = readDb();
    db.ai_conversations = db.ai_conversations || [];
    
    const { messages, title } = req.body;
    const newConv = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: sessionUser ? sessionUser.id : 0, 
      title: title || (messages && messages[0]?.parts?.[0]?.text ? messages[0].parts[0].text.substring(0, 30) : "محادثة جديدة"),
      messages: messages || [],
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    db.ai_conversations.push(newConv);
    writeDb(db);
    res.json(newConv);
  });

  app.put("/api/ai/conversations/:id", (req, res) => {
    const db = readDb();
    db.ai_conversations = db.ai_conversations || [];
    
    const convId = req.params.id;
    const index = db.ai_conversations.findIndex((c: any) => c.id === convId);
    
    if (index === -1) {
      return res.status(404).json({ error: "المحادثة غير موجودة" });
    }
    
    const conv = db.ai_conversations[index];
    if (sessionUser && conv.user_id !== sessionUser.id && conv.user_id !== 0) {
      return res.status(403).json({ error: "غير مصرح لك بتعديل هذه المحادثة" });
    }
    
    const { messages, title } = req.body;
    db.ai_conversations[index] = {
      ...conv,
      messages: messages || conv.messages,
      title: title || conv.title,
      user_id: sessionUser ? sessionUser.id : conv.user_id,
      updated_at: Date.now()
    };
    
    writeDb(db);
    res.json(db.ai_conversations[index]);
  });

  app.delete("/api/ai/conversations/:id", (req, res) => {
    const db = readDb();
    db.ai_conversations = db.ai_conversations || [];
    
    const convId = req.params.id;
    const index = db.ai_conversations.findIndex((c: any) => c.id === convId);
    
    if (index === -1) {
      return res.status(404).json({ error: "المحادثة غير موجودة" });
    }
    
    const conv = db.ai_conversations[index];
    if (sessionUser && conv.user_id !== sessionUser.id) {
      return res.status(403).json({ error: "غير مصرح لك بحذف هذه المحادثة" });
    }
    
    db.ai_conversations = db.ai_conversations.filter((c: any) => c.id !== convId);
    writeDb(db);
    res.json({ success: true });
  });

  app.get("/api/admin/ai_conversations", (req, res) => {
    const db = readDb();
    if (!sessionAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بمشاهدة سجلات المحادثات" });
    }
    const allConvs = db.ai_conversations || [];
    const detailedConvs = allConvs.map((conv: any) => {
      const user = db.users.find((u: any) => u.id === conv.user_id);
      return {
        ...conv,
        user_name: user ? user.name : "زائر",
        user_email: user ? user.email : "غير مسجل"
      };
    });
    detailedConvs.sort((a: any, b: any) => (b.updated_at || 0) - (a.updated_at || 0));
    res.json(detailedConvs);
  });

  // ----------------------------------------------------------------------
  // 5e. ADMIN CUSTOMERS PORTAL
  // ----------------------------------------------------------------------
  app.get("/api/admin/users", (req, res) => {
    const db = readDb();
    const extendedUsers = db.users.map(u => {
      const ordersCount = db.orders.filter(o => o.user_id === u.id).length;
      const adsCount = db.ads.filter(ad => ad.user_id === u.id).length;
      return {
        ...u,
        orders_count: ordersCount,
        ads_count: adsCount
      };
    });
    res.json(extendedUsers);
  });

  app.get("/api/admin/users/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const userMatch = db.users.find(u => u.id === id);
    if (!userMatch) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }
    const orders = db.orders.filter(o => o.user_id === id);
    const ads = db.ads.filter(ad => ad.user_id === id);
    const products = db.products.filter(p => p.user_id === id);
    
    // Find uploaded keys
    const uploadedMedia: { key: string; type: "image" | "video"; url: string }[] = [];
    // Scan products
    products.forEach(p => {
      if (p.image_key) {
        uploadedMedia.push({ key: p.image_key, type: "image", url: `/api/image/${p.image_key}` });
      }
      if (p.video_key) {
        uploadedMedia.push({ key: p.video_key, type: "video", url: `/api/image/${p.video_key}` });
      }
    });
    // Scan ads
    ads.forEach(ad => {
      if (ad.image_key) {
        uploadedMedia.push({ key: ad.image_key, type: "image", url: `/api/image/${ad.image_key}` });
      }
    });
    // Scan user avatar
    if (userMatch.avatar_key) {
      uploadedMedia.push({ key: userMatch.avatar_key, type: "image", url: `/api/image/${userMatch.avatar_key}` });
    }

    // Build Activity log
    const activities: string[] = [];
    if (userMatch.created_at) {
      activities.push(`سجل الدخول أو أنشأ الحساب في تاريخ ${new Date(userMatch.created_at).toLocaleDateString("ar-SA")}`);
    }
    if (orders.length > 0) {
      activities.push(`قام بتقديم ${orders.length} طلب مواد إنشائية بنجاح`);
    }
    if (ads.length > 0) {
      activities.push(`أدرج الإعلان المبوب الفردي عدد: ${ads.length}`);
    }
    if (userMatch.kycStatus) {
      activities.push(`حالة التحقق للهوية الهندسية الذاتية: ${userMatch.kycStatus === "verified" ? "معتمد وموثق" : userMatch.kycStatus === "pending" ? "قيد التدقيق" : "غير موثق"}`);
    }

    res.json({
      user: userMatch,
      orders,
      ads,
      products,
      media: uploadedMedia,
      activities
    });
  });

  app.put("/api/admin/users/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
      db.users[index] = {
        ...db.users[index],
        ...req.body,
        id // enforce id safety
      };
      writeDb(db);
      res.json(db.users[index]);
    } else {
      res.status(404).json({ error: "المستخدم غير متوفر" });
    }
  });

  app.post("/api/admin/users/:id/reset_password", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
      const { new_password, password } = req.body;
      const targetPass = new_password || password;
      if (!targetPass || targetPass.trim() === "") {
        return res.status(400).json({ error: "الرجاء توفير كلمة مرور فاعلة" });
      }
      (db.users[index] as any).password = hashPassword(targetPass);
      writeDb(db);
      res.json({ success: true, message: "تمت إعادة تعيين كلمة المرور بنجاح ومخرجاتها مشفرة" });
    } else {
      res.status(404).json({ error: "المستخدم غير موجود" });
    }
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    db.users = db.users.filter(u => u.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // ----------------------------------------------------------------------
  // 5f. CHAT AI ASSISTANT BACKEND (LAZY INITIALIZATION)
  // ----------------------------------------------------------------------
  app.post("/api/ai/chat", async (req, res) => {
    const db = readDb();
    const ai_config = (db.ai_settings || { is_enabled: 1 }) as any;
    
    if (Number(ai_config.is_enabled) === 0) {
      return res.status(400).json({ error: "تم تعطيل مساعد الذكاء الاصطناعي من قبل الإدارة حالياً." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "الرجاء ضبط مفتاح GEMINI_API_KEY في الإعدادات لتشغيل المساعد الذكي." });
    }

    try {
      const { message, imageBase64, imageMimeType, chatHistory } = req.body;

      // 1. Check for customer support intent (Intent Detection)
      const isSupportIntent = message && (
        /دعم( )?فني|مسؤول|بشري|مساعدة( )?بشرية|المشرف|تحدث( )?مع|تواصل( )?مع( )?المشرف|رقم( )?الدعم|احكي( )?مع|تواصل( )?مع( )?الدعم|دعم بشر|حدا حقيقي|تواصل( )?مع( )?الإدارة|تكلم( )?مع( )?شخص/i.test(message) ||
        message.includes("أريد دعم") ||
        message.includes("حولني") ||
        message.includes("محتاج مساعدة") ||
        message.includes("تكلم مع شخص")
      );

      if (isSupportIntent) {
        const triggers = ai_config.voice_triggers || [];
        const supportVoice = triggers.find((t: any) => t.trigger_key === "Technical_Support_Request");
        
        if (supportVoice) {
          // Increment Assistant usage count
          db.ai_settings.usage_count = (db.ai_settings.usage_count || 0) + 1;
          writeDb(db);

          // Found custom recorded/uploaded voice trigger! Return it immediately
          return res.json({
            reply: "تم تحويلك إلى الدعم الفني المباشر للمشرف محمود بنجاح! يرجى الاستماع إلى التسجيل الصوتي الموجه لك أدناه للتفاصيل الكاملة والتواصل عبر الواتساب:",
            audioTrigger: "Technical_Support_Request",
            audioBase64: supportVoice.audio_base64,
            audioMimeType: supportVoice.mime_type,
            audioFilename: supportVoice.filename
          });
        }
      }

      // Import the correct Gemini constructor lazily to meet the guidelines
      const { GoogleGenAI } = await import("@google/genai");
      const client = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } }
      });

      // Build context information from active listings and catalog
      const activeProducts = db.products.filter(p => p.status !== "hidden");
      const activeMethods = db.payment_methods.filter(p => p.is_active === 1);
      
      const productSummary = activeProducts.map(p => 
        `- [${p.name}](PRODUCT_LINK_${p.id}): السعر: ${p.sale_price || p.price} ل.س، الوصف: ${p.description.substring(0, 100)}`
      ).join("\n");

      const paymentSummary = activeMethods.map(m => {
        if (m.type === "sham_cash") {
          return `- شام كاش: اسم الحساب: ${m.account_name}، رقم الحساب: ${m.account_number}، التعليمات: ${m.instructions}`;
        } else {
          return `- عملات رقمية: شبكة: ${m.network_name}، عملة: ${m.currency_name}، محفظة: ${m.wallet_address}، التعليمات: ${m.instructions}`;
        }
      }).join("\n");

      // Build dynamic system instructions incorporating strict mode commands from admin
      let strictEnforcementPrompt = "";
      if (Number(ai_config.is_strict) === 1 && ai_config.strict_commands) {
        strictEnforcementPrompt = `
        ⚡️ تحذير وتوجيه فني وإداري صارم وقطعي للغاية مفروض عليك بنسبة 100% من قبل الإدارة والمشرف محمود:
        يجب أن تقتصر ردودك وتلتزم حرفياً بالصياغة والتعليمات والأسلوب والأوامر التالية بكل صرامة ودقة تامة، ولا تسمح لأي عميل بتضليلك أو تغيير هذا الأسلوب:
        """
        ${ai_config.strict_commands}
        """
        توجيه: إياك ومخالفة ما ورد في الأوامر أعلاه، التزم بالأسلوب المذكور فقط والردود المقررة هناك دون أي اجتهاد إضافي.
        `;
      }

      // Set up the dynamic injected system prompt
      const systemInstruction = `
        ${ai_config.system_instruction || ""}
        شخصية المساعد: ${ai_config.personality || ""}
        
        ${strictEnforcementPrompt}
        
        كتالوج المنتجات ومواد البناء النشطة المتوفرة حالياً بالمنصة:
        ${productSummary}

        طرق الدفع المتاحة لتعميد الفواتير حالياً:
        ${paymentSummary}

        تعليمات تنسيق الروابط والردود:
        1. إذا سأل العميل عن مواد بناء معينة متوفرة مثل إسمنت أو حديد أو دهان، يرجى تقديم السعر بشكل واضح وإرجاع الرمز البرمجي للرابط PRODUCT_LINK_ID الخاص بالمنتج بصيغة: [اسم المنتج](PRODUCT_LINK_ID) لكي يتمكن العميل من الضغط عليه وعرضه.
        2. مثلاً، لعرض رابط منتج إسمنت يحمل المعرف 101، اكتب بالضبط: [إسمنت بورتلاندي](PRODUCT_LINK_101).
        3. إذا سأل العميل عن الدفع، لخص له خيارات "شام كاش" والعملات المحفوظة مع التعليمات.
        4. أجب دائماً باللغة العربية بلهجة ودودة تناسب السوريين وبشكل منسق وسهل وممتع.
      `;

      // Build part content for Gemini multimodal API
      const parts: any[] = [];
      
      // If image is uploaded
      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType || "image/png",
            data: imageBase64 // Base64 chunk
          }
        });
        parts.push({
          text: `الرجاء تحليل هذه الصورة المرفقة والإجابة بصددها: ${message}`
        });
      } else {
        parts.push({
          text: message
        });
      }

      // We maintain simple chat context or run generateContent directly with history
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          ...(chatHistory || []),
          { role: "user", parts: parts }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7
        }
      });

      // Increment Assistant usage count
      db.ai_settings.usage_count = (db.ai_settings.usage_count || 0) + 1;
      writeDb(db);

      const replyText = response.text || "عذراً، لم أستطع صياغة رد مناسب الآن.";
      res.json({ reply: replyText });

    } catch (err: any) {
      console.error("Gemini assistant failure:", err);
      res.status(500).json({ error: `حدث خطأ بمستشعر الذكاء الاصطناعي: ${err.message}` });
    }
  });

  // 6. Classified Ads
  app.get("/api/ads", (req, res) => {
    const db = readDb();
    // Resolve user owner names and verification badge status
    const resolved = db.ads.map(ad => {
      const publisherId = ad.owner_id || ad.creator_id || ad.user_id;
      const creator = publisherId ? db.users.find(u => u.id === publisherId) : null;
      return {
        ...ad,
        owner_name: creator ? creator.name : (ad.user_name || "عضو مسجل دائم"),
        user_avatar: creator ? creator.avatar_key : null,
        user_kycStatus: creator ? creator.kycStatus : "verified",
        user_is_verified: creator ? (creator.kycStatus === 'verified') : true
      };
    });
    res.json(resolved);
  });

  app.post("/api/ads", (req, res) => {
    if (!sessionUser && !sessionAdmin) {
      return res.status(401).json({ error: "يجب تسجيل الدخول أولاً لنشر إعلان." });
    }
    const db = readDb();
    
    const activeUserId = sessionUser ? sessionUser.id : (sessionAdmin ? sessionAdmin.id : 9999);
    const activeUserName = sessionUser ? sessionUser.name : (sessionAdmin ? sessionAdmin.name : "مشرف الرضوان");

    const newAd: Ad = {
      id: Date.now(),
      user_id: activeUserId,
      user_name: activeUserName,
      owner_id: activeUserId,
      creator_id: activeUserId,
      title: req.body.title,
      description: req.body.description,
      contact: req.body.contact,
      image_key: req.body.image_key || null,
      is_active: 1,
      is_pinned: 0,
      created_at: Date.now()
    };
    db.ads.push(newAd);
    writeDb(db);
    res.json(newAd);
  });

  app.put("/api/ads/:id/pin", (req, res) => {
    if (!sessionAdmin) {
      return res.status(403).json({ error: "عذراً، تثبيت الإعلانات متاح فقط للمشرفين والمسؤولين." });
    }
    const db = readDb();
    const id = Number(req.params.id);
    db.ads = db.ads.map(ad => 
      ad.id === id 
        ? { ...ad, is_pinned: Number(req.body.is_pinned ?? 0) } 
        : ad
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.put("/api/ads/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const ad = db.ads.find(a => a.id === id);

    if (!ad) {
      return res.status(404).json({ error: "الإعلان غير موجود." });
    }

    // Check ownership & admin permission
    const isOwner = sessionUser && (ad.owner_id === sessionUser.id || ad.creator_id === sessionUser.id || ad.user_id === sessionUser.id);
    const isAdmin = !!sessionAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "عذراً، صلاحيات غير كافية لإجراء هذا التغيير. يمكنك فقط تعديل إعلاناتك الشخصية." });
    }

    db.ads = db.ads.map(a => 
      a.id === id 
        ? { 
            ...a, 
            title: req.body.title || a.title, 
            description: req.body.description || a.description, 
            contact: req.body.contact || a.contact,
            is_pinned: (isAdmin && req.body.is_pinned !== undefined) ? Number(req.body.is_pinned) : a.is_pinned,
            // Ensure owner/creator ID CANNOT be overwritten by client-side requests (anti-impersonation)
            user_id: a.user_id,
            user_name: a.user_name,
            owner_id: a.owner_id,
            creator_id: a.creator_id
          } 
        : a
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.delete("/api/ads/:id", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const ad = db.ads.find(a => a.id === id);

    if (!ad) {
      return res.status(404).json({ error: "الإعلان غير موجود." });
    }

    // Check ownership & admin permission
    const isOwner = sessionUser && (ad.owner_id === sessionUser.id || ad.creator_id === sessionUser.id || ad.user_id === sessionUser.id);
    const isAdmin = !!sessionAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "عذراً، صلاحيات غير كافية لعمل هذا الإجراء. لا يمكنك حذف سوى إعلاناتك الشخصية." });
    }

    db.ads = db.ads.filter(a => a.id !== id);
    writeDb(db);
    res.json({ success: true });
  });

  // 7. Orders / Invoices CRUD
  app.get("/api/orders", (req, res) => {
    const db = readDb();
    res.json(db.orders);
  });

  app.post("/api/orders", (req, res) => {
    const db = readDb();
    const numRandom = Math.floor(100000 + Math.random() * 900000);
    const orderNum = `ORD-${numRandom}`;

    const newOrder: Order = {
      id: Date.now(),
      order_number: orderNum,
      user_id: sessionUser ? sessionUser.id : null,
      customer_name: req.body.customerName,
      customer_email: req.body.customerEmail || "guest@alradwan.com",
      customer_phone: req.body.customerPhone,
      customer_address: req.body.customerAddress,
      items: JSON.stringify(req.body.items),
      total: Number(req.body.total),
      status: "pending",
      payment_method_id: req.body.paymentMethodId || 1,
      payment_method_name: req.body.paymentMethodId === 2 ? "حوالة مصرفية" : "نقدي عند التسليم",
      payment_account: null,
      notes: req.body.notes || null,
      created_at: Date.now()
    };

    db.orders.push(newOrder);
    writeDb(db);
    res.json(newOrder);
  });

  app.put("/api/orders/:id/status", (req, res) => {
    const db = readDb();
    const id = Number(req.params.id);
    const order = db.orders.find(o => o.id === id);
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const nextStatus = req.body.status;
    
    // Update order status in db
    db.orders = db.orders.map(o => 
      o.id === id 
        ? { ...o, status: nextStatus } 
        : o
    );

    // Dynamic alert notifications to the order's owner client profile
    const uIndex = db.users.findIndex(u => u.id === order.user_id);
    if (uIndex !== -1) {
      if (!db.users[uIndex].notifications) {
        db.users[uIndex].notifications = [];
      }

      let title = "تحديث حالة الفاتورة والطلبية 📦";
      let message = `تم تغيير حالة طلبيتك الموحدة رقم #${id} إلى ${nextStatus}`;

      if (nextStatus === 'confirmed') {
        title = "تم تأكيد طلبك ومباشرة تجهيز الفاتورة! ✅";
        message = `مرحباً ${db.users[uIndex].name || 'مستخدم'}، يسرنا إعلامكم بـ "تأكيد الطلب" للمواد رقم #${id} وتعميد الفاتورة بالكامل من قبل الإدارة بالمركز، وجاري ترحيل حمولة المواد وتنسيق التوصيل.`;
      } else if (nextStatus === 'delivered') {
        title = "تم التوصيل والتسليم لعنوانكم بنجاح! 🚚";
        message = `مرحباً ${db.users[uIndex].name || 'مستخدم'}، يسعدنا تأكيد اكتمال عملية "تم التوصيل" وتفريغ كافة عناصر فاتورتكم رقم #${id} بنجاح. نتمنى لكم دائماً كل التوفيق والإعمار!`;
      } else if (nextStatus === 'rejected') {
        title = "إلغاء الطلب: تم إلغاء طلبكم الإنشائي الحالي ❌";
        message = `مرحباً ${db.users[uIndex].name || 'مستخدم'}، نود إعلامكم بالاعتذار وتأكيد "إلغاء الطلب" رقم #${id} لعدم ملاءمة الشحن أو الحسابات. يرجى التواصل مع وكيل المبيعات مجدداً.`;
      }

      db.users[uIndex].notifications.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        title,
        message,
        status: 'unread',
        created_at: Date.now()
      });

      if (sessionUser && sessionUser.id === db.users[uIndex].id) {
        sessionUser = db.users[uIndex];
      }
    }

    writeDb(db);
    res.json({ success: true });
  });

  // 8. User Auth & History
  app.get("/api/user/orders", (req, res) => {
    const db = readDb();
    if (!sessionUser) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const userOrders = db.orders.filter(o => o.user_id === sessionUser!.id);
    res.json(userOrders);
  });

  app.get("/api/user/me", (req, res) => {
    res.json(sessionUser);
  });

  app.post("/api/user/login", (req, res) => {
    const db = readDb();
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    // 1. Check if login matches the supervisor credentials
    if ((cleanEmail === "m@gmail.gom" || cleanEmail === "m@gmail.com") && password === "Mahmod1234@") {
      let match = db.admins.find(a => a.email.toLowerCase() === "m@gmail.gom" || a.email.toLowerCase() === "m@gmail.com");
      if (!match) {
        match = { id: 1001, name: "المشرف محمود", email: "m@gmail.gom", role: "super_admin", created_at: Date.now() };
        db.admins.push(match);
      }
      sessionAdmin = match;

      let uMatch = db.users.find(u => u.email.toLowerCase() === "m@gmail.gom");
      if (!uMatch) {
        uMatch = {
          id: 9999,
          name: "المشرف محمود",
          email: "m@gmail.gom",
          kycStatus: "verified",
          created_at: Date.now()
        };
        db.users.push(uMatch);
      }
      sessionUser = uMatch;
      writeDb(db);

      return res.json({ ...uMatch, isAdmin: true, adminProfile: match });
    }

    // 2. Reject if they try logging into the supervisor account with some other password
    if (cleanEmail === "m@gmail.gom" || cleanEmail === "m@gmail.com") {
      return res.status(401).json({ error: "كلمة المرور الخاصة بالمشرف غير صحيحة" });
    }

    // 3. Standard customer login
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail) as (User & { password?: string }) | undefined;
    if (existing) {
      if (existing.is_active === 0) {
        return res.status(403).json({ error: "عذراً، هذا الحساب معطل حالياً من قبل الإدارة. يرجى مراجعة الدعم الفني." });
      }

      const inputHash = hashPassword(password);
      
      if (existing.password) {
        // Can be plaintext or hashed
        if (existing.password !== password && existing.password !== inputHash) {
          return res.status(401).json({ error: "كلمة المرور غير صحيحة، يرجى إعادة المحاولة." });
        }
        // Upgrade password to hash if matched with plaintext
        if (existing.password === password && password !== inputHash) {
          existing.password = inputHash;
          writeDb(db);
        }
      } else {
        // If user had no password saved yet, save it as hashed
        existing.password = inputHash;
        writeDb(db);
      }
      
      sessionUser = existing;
      sessionAdmin = null; // Clear admin session for general clients
      res.json(existing);
    } else {
      res.status(404).json({ error: "الحساب غير متوفر، يرجى التسجيل أولاً." });
    }
  });

  app.post("/api/user/register", (req, res) => {
    const db = readDb();
    const { name, email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    
    // Prevent registering with supervisor's email address
    if (cleanEmail === "m@gmail.gom" || cleanEmail === "m@gmail.com") {
      return res.status(400).json({ error: "البريد الإلكتروني هذا محجوز لخدمات الإشراف" });
    }

    const exists = db.users.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً." });
    }

    const newUser: User & { password?: string } = {
      id: Date.now(),
      name,
      email: cleanEmail,
      is_active: 1, // active by default
      password: hashPassword(password || ""),
      created_at: Date.now()
    };

    db.users.push(newUser);
    writeDb(db);
    sessionUser = newUser;
    sessionAdmin = null; // Clear admin session
    res.json(newUser);
  });

  app.post("/api/user/logout", (req, res) => {
    sessionUser = null;
    res.json({ success: true });
  });

  // Submit user KYC verification request
  app.post("/api/user/kyc", (req, res) => {
    const db = readDb();
    if (!sessionUser) {
      return res.status(401).json({ error: "يجب تسجيل الدخول لتوثيق حسابك." });
    }

    const { fullName, country, idType, idFrontImage, idBackImage } = req.body;
    if (!fullName || !country || !idType || !idFrontImage || !idBackImage) {
      return res.status(400).json({ error: "يرجى تعبئة جميع معلومات الهوية وإرفاق الصور المطلوبة بشكل صحيح." });
    }

    // Direct Image keys generated and loaded into local memory storage
    const frontKey = `kyc_front_${sessionUser.id}_${Date.now()}`;
    const backKey = `kyc_back_${sessionUser.id}_${Date.now()}`;

    // Store in our base64 json DB
    db.images[frontKey] = {
      mimeType: "image/jpeg",
      data: idFrontImage.replace(/^data:image\/\w+;base64,/, "")
    };
    db.images[backKey] = {
      mimeType: "image/jpeg",
      data: idBackImage.replace(/^data:image\/\w+;base64,/, "")
    };

    // Update matching user profile
    const uIndex = db.users.findIndex(u => u.id === sessionUser!.id);
    if (uIndex !== -1) {
      db.users[uIndex].kycStatus = 'pending';
      db.users[uIndex].kycData = {
        fullName,
        country,
        idType,
        idFrontImage: frontKey,
        idBackImage: backKey,
        kycRejectionReason: undefined
      };
      
      // Post an internal user alert notification
      if (!db.users[uIndex].notifications) {
        db.users[uIndex].notifications = [];
      }
      db.users[uIndex].notifications!.push({
        id: Date.now(),
        title: "تم استلام مستندات توثيق الهوية ⏳",
        message: "لقد تم استلام ملفاتك بنجاح. سنقوم بمراجعة الطلب والمستندات بدقة خلال لحظات وتفعيل شارة التوثيق بنجاح.",
        status: "unread",
        created_at: Date.now()
      });

      writeDb(db);
      sessionUser = db.users[uIndex];
      res.json({ success: true, user: db.users[uIndex] });
    } else {
      res.status(404).json({ error: "حساب المستخدم غير متوفر حالياً." });
    }
  });

  // Get all users who have kycStatus === 'pending'
  app.get("/api/admin/kyc-pending", (req, res) => {
    if (!sessionAdmin) {
      return res.status(401).json({ error: "غير مصرح لك بالوصول للوحة التحكم." });
    }
    const db = readDb();
    const pending = db.users.filter(u => u.kycStatus === 'pending');
    res.json(pending);
  });

  // Approve KYC request
  app.post("/api/admin/kyc-approve/:userId", (req, res) => {
    if (!sessionAdmin) {
      return res.status(401).json({ error: "غير مصرح لك بالعملية الإدارية." });
    }
    const db = readDb();
    const targetId = Number(req.params.userId);
    const uIndex = db.users.findIndex(u => u.id === targetId);
    if (uIndex !== -1) {
      db.users[uIndex].kycStatus = 'verified';
      
      // Append success alert push notifications
      if (!db.users[uIndex].notifications) {
        db.users[uIndex].notifications = [];
      }
      db.users[uIndex].notifications!.push({
        id: Date.now(),
        title: "تم توثيق الحساب وتفعيل الشارة الزرقاء بنجاح! 🎉",
        message: "مبروك! تمت مراجعة مستنداتك والموافقة عليها. تم تفعيل الشارة الموثقة الفاخرة على حسابك الشخصي.",
        status: "unread",
        created_at: Date.now()
      });

      writeDb(db);
      if (sessionUser && sessionUser.id === targetId) {
        sessionUser = db.users[uIndex];
      }
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "العميل المستهدف غير موجود بقاعدة البيانات." });
    }
  });

  // Reject KYC request
  app.post("/api/admin/kyc-reject/:userId", (req, res) => {
    if (!sessionAdmin) {
      return res.status(401).json({ error: "غير مصرح لك بالعملية الإدارية." });
    }
    const db = readDb();
    const targetId = Number(req.params.userId);
    const { reason } = req.body;

    const uIndex = db.users.findIndex(u => u.id === targetId);
    if (uIndex !== -1) {
      db.users[uIndex].kycStatus = 'rejected';
      if (db.users[uIndex].kycData) {
        db.users[uIndex].kycData!.kycRejectionReason = reason || "المستند المرفق غير مقروء أو غير مكتمل المواصفات";
      }

      // Appending warning error inbox push notification
      if (!db.users[uIndex].notifications) {
        db.users[uIndex].notifications = [];
      }
      db.users[uIndex].notifications!.push({
        id: Date.now(),
        title: "تم رفض طلب التوثيق المقبول ⚠️",
        message: `تم رفض التحقق لطلبك لسبب: ${reason || "الملفات المرفوعة غير صالحة"}. يرجى المحاولة بصور أوضح للمستندات.`,
        status: "unread",
        created_at: Date.now()
      });

      writeDb(db);
      if (sessionUser && sessionUser.id === targetId) {
        sessionUser = db.users[uIndex];
      }
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "العميل المستهدف غير موجود بقاعدة البيانات." });
    }
  });

  // ----------------------------------------------------------------------
  // UNIFIED DATA PROTECTION, AT-REST CRYPTO, & DATA REDUNDANCY API
  // ----------------------------------------------------------------------
  app.get("/api/storage/backups", (req, res) => {
    if (!sessionAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بنظام حماية البيانات" });
    }
    const backups = readManifest();
    
    // Calculate DB sizing & storage info
    let dbSize = 0;
    try {
      if (fs.existsSync(DB_PATH)) {
        dbSize = fs.statSync(DB_PATH).size;
      }
    } catch {}
    
    // Check redundancy hot-replica sync status
    let replicaSynced = false;
    try {
      if (fs.existsSync(REPLICA_PATH)) {
        const replicaSize = fs.statSync(REPLICA_PATH).size;
        replicaSynced = (replicaSize > 0 && Math.abs(replicaSize - dbSize) < 100);
      }
    } catch {}

    res.json({
      success: true,
      backups,
      dbSize,
      encryptionType: "AES-256-CBC (نشط وآمن)",
      redundantReplicasActive: true,
      replicaSynced,
      lastAutoSave: Date.now()
    });
  });

  app.post("/api/storage/backup/trigger", (req, res) => {
    if (!sessionAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بنظام حماية البيانات" });
    }
    const type = req.body.type === "automatic" ? "automatic" : "manual";
    const backup = createSecureBackup(type);
    if (backup) {
      res.json({ success: true, backup });
    } else {
      res.status(500).json({ error: "فشل إنشاء نسخة الأرشفة الأمنية الموثقة" });
    }
  });

  app.post("/api/storage/backup/restore/:filename", (req, res) => {
    if (!sessionAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بنظام حماية البيانات" });
    }
    const filename = req.params.filename;
    if (!filename.match(/^backup_\d+\.enc$/)) {
      return res.status(400).json({ error: "اسم نسخة الحفظ غير صالح" });
    }
    const backupFilePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupFilePath)) {
      return res.status(404).json({ error: "نسخة الحفظ المطلوبة غير موجودة على الخادم" });
    }
    
    try {
      const encryptedContent = fs.readFileSync(backupFilePath, "utf-8");
      const decryptedContent = decryptData(encryptedContent);
      
      // Safety validation
      const testDb = JSON.parse(decryptedContent);
      if (!testDb.users || !testDb.admins || !testDb.products) {
        throw new Error("قاعدة البيانات المسترجعة تالفة أو ينقصها مكونات رئيسية");
      }
      
      // Overwrite database
      fs.writeFileSync(DB_PATH, JSON.stringify(testDb, null, 2), "utf-8");
      syncRedundantReplica();
      
      res.json({ success: true, message: "تمت استعادة حالة المنصة وقاعدة البيانات بنجاح 🚀" });
    } catch (err: any) {
      console.error("Backups restore failed:", err);
      res.status(500).json({ error: `فشل استرجاع البيانات: ${err.message}` });
    }
  });

  app.delete("/api/storage/backup/delete/:filename", (req, res) => {
    if (!sessionAdmin) {
      return res.status(403).json({ error: "غير مصرح لك بنظام حماية البيانات" });
    }
    const filename = req.params.filename;
    if (!filename.match(/^backup_\d+\.enc$/)) {
      return res.status(400).json({ error: "اسم نسخة الحفظ غير صالح" });
    }
    const backupFilePath = path.join(BACKUP_DIR, filename);
    
    try {
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
      }
      const manifest = readManifest();
      const updated = manifest.filter(item => item.filename !== filename);
      writeManifest(updated);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: `فشل حذف نسخة الأرشفة: ${err.message}` });
    }
  });

  // Notifications status controller
  app.post("/api/user/notifications/clear", (req, res) => {
    if (!sessionUser) return res.status(401).json({ error: "Unauthorized" });
    const db = readDb();
    const uIndex = db.users.findIndex(u => u.id === sessionUser!.id);
    if (uIndex !== -1) {
      db.users[uIndex].notifications = [];
      writeDb(db);
      sessionUser = db.users[uIndex];
      res.json({ success: true, user: db.users[uIndex] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // 9. Admin Auth
  app.get("/api/auth/me", (req, res) => {
    if (sessionAdmin && (sessionAdmin.email === 'm@gmail.com' || sessionAdmin.email === 'm@gmail.gom' || sessionUser?.email === 'm@gmail.com' || sessionUser?.email === 'm@gmail.gom')) {
      res.json(sessionAdmin);
    } else {
      res.json(null);
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const db = readDb();
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();

    // Enforce Mahmod's administrator supervisor credentials
    const isSupervisor = cleanEmail === "m@gmail.gom" || cleanEmail === "m@gmail.com";
    if (isSupervisor && password === "Mahmod1234@") {
      let match = db.admins.find(a => a.email.toLowerCase() === "m@gmail.gom" || a.email.toLowerCase() === "m@gmail.com");
      if (!match) {
        match = { id: 1001, name: "المشرف محمود", email: "m@gmail.gom", role: "super_admin", created_at: Date.now() };
        db.admins.push(match);
        writeDb(db);
      }
      sessionAdmin = match;
      res.json(match);
    } else {
      res.status(401).json({ error: "البريد الإلكتروني للإدارة أو كلمة المرور غير صحيحة" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    sessionAdmin = null;
    res.json({ success: true });
  });

  // 9b. Profile User Avatar Upload
  app.post("/api/user/avatar", express.json({ limit: "25mb" }), (req, res) => {
    if (!sessionUser) {
      return res.status(401).json({ error: "يجب تسجيل الدخول أولاً لتعديل صورتك الشخصية" });
    }
    const db = readDb();
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "لم يتم استلام ملف الصورة بشكل صحيح" });
    }

    const key = `avatar_${sessionUser.id}_${Date.now()}`;
    db.images[key] = {
      mimeType: "image/jpeg",
      data: imageBase64.replace(/^data:image\/\w+;base64,/, "")
    };

    const uIndex = db.users.findIndex(u => u.id === sessionUser!.id);
    if (uIndex !== -1) {
      db.users[uIndex].avatar_key = key;
      writeDb(db);
      sessionUser = db.users[uIndex];
      res.json({ success: true, user: db.users[uIndex] });
    } else {
      res.status(404).json({ error: "المستخدم غير موجود" });
    }
  });

  // Track product views
  app.post("/api/products/:id/view", (req, res) => {
    const db = readDb();
    const productId = Number(req.params.id);
    const product = db.products.find(p => p.id === productId);
    if (product) {
      product.view_count = (product.view_count || 0) + 1;
      writeDb(db);
      return res.json({ success: true, view_count: product.view_count });
    }
    res.status(404).json({ error: "المنتج غير موجود" });
  });

  // Track ad views
  app.post("/api/ads/:id/view", (req, res) => {
    const db = readDb();
    const adId = Number(req.params.id);
    const ad = db.ads.find(a => a.id === adId);
    if (ad) {
      ad.view_count = (ad.view_count || 0) + 1;
      writeDb(db);
      return res.json({ success: true, view_count: ad.view_count });
    }
    res.status(404).json({ error: "الإعلان غير موجود" });
  });

  // 9c. Public User Profile and Updates
  app.get("/api/user/profile/:id", (req, res) => {
    const db = readDb();
    const userId = Number(req.params.id);
    
    // Find user by id
    const targetUser = db.users.find(u => u.id === userId);
    if (!targetUser) {
      return res.status(404).json({ error: "عذراً، هذا الحساب غير موجود" });
    }

    // Find their products & ads (match user_id, owner_id or creator_id)
    const userProducts = db.products.filter(p => p.owner_id === userId || p.creator_id === userId || p.user_id === userId);
    const userAds = db.ads.filter(a => a.owner_id === userId || a.creator_id === userId || a.user_id === userId);

    // Dynamic but persistent profile views
    let currentViews = (targetUser as any).profile_views || (12 + (userId % 37));
    currentViews += 1;
    (targetUser as any).profile_views = currentViews;
    
    // Auto-seed bio if not present
    if (!(targetUser as any).bio) {
      (targetUser as any).bio = "عضو نشط وموثق بمجتمع حراج الرضوان لمواد البناء والأدوات الصحية.";
    }

    writeDb(db);

    res.json({
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        avatar_key: targetUser.avatar_key || null,
        kycStatus: targetUser.kycStatus || 'unverified',
        created_at: targetUser.created_at || Date.now(),
        bio: (targetUser as any).bio
      },
      stats: {
        products_count: userProducts.length,
        ads_count: userAds.length,
        posts_count: userProducts.length + userAds.length,
        profile_views: currentViews,
        orders_count: db.orders.filter(o => o.user_id === userId).length
      },
      products: userProducts,
      ads: userAds
    });
  });

  app.post("/api/user/profile/update", (req, res) => {
    if (!sessionUser) {
      return res.status(401).json({ error: "يجب تسجيل الدخول أولاً لتعديل ملفك الشخصي" });
    }
    const db = readDb();
    const { bio, name } = req.body;
    const uIndex = db.users.findIndex(u => u.id === sessionUser!.id);
    if (uIndex !== -1) {
      if (bio !== undefined) (db.users[uIndex] as any).bio = bio;
      if (name !== undefined && name.trim() !== "") db.users[uIndex].name = name;
      writeDb(db);
      sessionUser = db.users[uIndex];
      res.json({ success: true, user: db.users[uIndex] });
    } else {
      res.status(404).json({ error: "لم يتم العثور على الحساب" });
    }
  });

  // 10. Image Upload & Streaming via Base64 JSON
  app.post("/api/image/upload", express.json({ limit: "25mb" }), (req, res) => {
    // We can support binary content if posted directly as payload, or simple JSON Base64 form
    const db = readDb();
    const key = `img_${Date.now()}`;
    
    // Fallback if not standard JSON encoding
    const imageBase64 = req.body.image || req.body.data;
    if (imageBase64) {
      db.images[key] = {
        mimeType: req.body.mimeType || "image/png",
        data: imageBase64
      };
      writeDb(db);
      return res.json({ key });
    }

    res.status(400).json({ error: "No image file details detected in payload" });
  });

  app.get("/api/image/:key", (req, res) => {
    const db = readDb();
    const img = db.images[req.params.key];
    if (img) {
      const buffer = Buffer.from(img.data, "base64");
      res.writeHead(200, {
        "Content-Type": img.mimeType,
        "Content-Length": buffer.length
      });
      res.end(buffer);
    } else {
      res.status(404).send("Image not found");
    }
  });

  // ----------------------------------------------------------------------
  // Vite Integration & Serve Frontend SPAs
  // ----------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();



================================================================================
الملف: worker.js
================================================================================

// Cloudflare Worker: Complete Self-Contained Deployment of Al-Radwan Construction Materials Center
// Combines a Serverless Node/Express-Like REST Backend API and a high-fidelity fully responsive SPA Frontend.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // --- WORKER IN-MEMORY DATABASE BACKUP / STATE SIMULATION ---
    // Since workers are serverless and stateless unless using KV/D1, we use an in-memory/localStorage-synced architecture
    // with a rich default store. Any changes sent to the API are reflected, and persisted to client-side localStorage.
    
    const db = {
      settings: {
        site_name: "مركز الرضوان لمواد البناء",
        header_announcement: "🔔 حسومات كبرى تصل لغاية 15% على أدوات تأسيس السباكة والكهرباء!",
        currency: "ل.س",
        whatsapp: "963955566778",
        phone: "0115432100",
        search_placeholder: "ابحث عن الاسمنت البورتلاندي، حديد التسليح، الأنابيب، الخلاطات...",
        site_description: "مركز الرضوان هو المنصة والموزع الأول لتأمين كافة مواد البناء الإنشائية والأدوات الصحية والكهربائية عالية القوام في دمشق وريفها. جودة معتمدة وخدمة تحميل متميزة."
      },
      categories: [
        { id: 1, name: "المواد الإنشائية الأساسية", slug: "basic-materials", sort_order: 1, is_visible: 1 },
        { id: 2, name: "الأدوات الصحية والسباكة", slug: "plumbing-sanitary", sort_order: 2, is_visible: 1 },
        { id: 3, name: "عدد البناء والمعدات", slug: "construction-tools", sort_order: 3, is_visible: 1 },
        { id: 4, name: "المواد العازلة والدهانات", slug: "insulation-paints", sort_order: 4, is_visible: 1 }
      ],
      products: [
        {
          id: 101,
          name: "إسمنت بورتلاندي مقاوم للأملاح (50كغ)",
          description: "إسمنت عالي المقوّية والمقاومة للكبريتات ورطوبة التربة، معتمد لتأسيس القواعد والخرسانة الإنشائية.",
          price: 185000,
          sale_price: 175000,
          quantity: 550,
          category_id: 1,
          image_key: null,
          status: "active",
          whatsapp: "963955566778"
        },
        {
          id: 102,
          name: "حديد تسليح مبروم مشرك (12 ملم)",
          description: "حديد تسليح مطاوع ذو جودة عالية ومرونة متميزة لمقاومة الزلازل، يباع بالطن أو السيخ المفرد حسب الطلب.",
          price: 9500000,
          sale_price: null,
          quantity: 40,
          category_id: 1,
          image_key: null,
          status: "active",
          whatsapp: "963955566778"
        },
        {
          id: 103,
          name: "أنابيب مياه خضراء مقاومة للحرارة (1 إنش)",
          description: "أنبوب بولي بروبلين (PPR) ألماني المنشأ مخصص لشبكات المياه الساخنة والباردة بعمر افتراضي يفوق 50 سنة.",
          price: 24000,
          sale_price: 21500,
          quantity: 1200,
          category_id: 2,
          image_key: null,
          status: "active",
          whatsapp: "963955566778"
        },
        {
          id: 104,
          name: "خلاط مجلى كروم ممتاز فخم",
          description: "خلاط مياه نحاسي مغطى بطبقة كروم لامعة مقاومة للتكلس، يدعم التحكم البارد والساخن بنظام ترشيد المياه.",
          price: 360000,
          sale_price: 320000,
          quantity: 65,
          category_id: 2,
          image_key: null,
          status: "active",
          whatsapp: "963955566778"
        },
        {
          id: 105,
          name: "عازل مائي سائل (دهان مطاطي - 20كغ)",
          description: "عازل إكريليكي مطاطي عالي المرونة لحماية الرطوبة ومقاومة وتصدع الأسطح وخزانات المياه بجودة مضمونة.",
          price: 480000,
          sale_price: null,
          quantity: 15,
          category_id: 4,
          image_key: null,
          status: "active",
          whatsapp: "963955566778"
        }
      ],
      ads: [
        {
          id: 501,
          user_id: null,
          user_name: "المهندس أسامة",
          title: "يتوفر بلوك مفرغ قياس 20 سم بحالة ممتازة للبيع",
          description: "عندي كمية فائضة من ورشة بناء حوالي 1200 بلوكة مفرغة ممتازة للبيع بسعر حرق لوجه السرعة. يرجى الاتصال للتنسيق.",
          contact: "963933112233",
          image_key: null,
          is_active: 1,
          is_pinned: 1,
          created_at: Date.now() - 3600000 * 24
        }
      ],
      orders: [],
      payment_methods: [
        {
          id: 1,
          type: "sham_cash",
          name: "شام كاش - مركز الرضوان الرئيسي",
          account_name: "شركة الرضوان للتجارة والمقاولات",
          account_number: "963955566778",
          instructions: "يرجى تحويل القيمة الإجمالية للمواد مضافة إليها تفاصيل الحمولة إلى رقم حساب شام كاش الموضح، ثم رفع لقطة شاشة تدل على إتمام عملية التحويل لسرعة تعميدها وشحن حمولة الإسمنت والحديد بالكامل.",
          is_active: 1,
          sort_order: 1
        },
        {
          id: 2,
          type: "crypto",
          name: "USDT TRC20 (العملات الرقمية)",
          network_name: "TRC20",
          currency_name: "USDT",
          wallet_address: "TYG3j8ZfL6HnSwM7gBvXyPzYq36wK8p9tX",
          instructions: "من فضلك قم بإرسال عملة USDT على شبكة TRC20 للعنوان المذكور والتحقق التام من الشبكة ومراعاة عمولة التحويل لضمان تطابق مدفوعات المعاملة.",
          is_active: 1,
          sort_order: 2
        }
      ],
      ai_settings: {
        is_enabled: 1,
        system_instruction: "أنت مساعد ذكي ومتخصص لمركز الرضوان لمواد البناء والأدوات الصحية والكهربائية بدمشق وباقي المحافظات السورية. مهمتك هي إرشاد العملاء بخصوص الإسمنت، والحديد، والمواد العازلة، والدهانات، والتأسيسات المتكاملة والمقاولات وحساب الكميات. أجب بكلام لطيف وسوري مهني ومختصر ومقنع يخدم مصلحة العميل بوضوح.",
        personality: "خبير ومستشار فني محترف في حساب كميات مواد البناء والمقاولات الإنشائية بمركز الرضوان.",
        welcome_message: "مرحباً بك في مركز الرضوان لمواد البناء والأدوات الإنشائية! 🏗️ أنا مستشارك الذكي المدرب على حساب الكميات وفحص أسعار الكتالوج، كيف يمكنني مساعدتك في ورشة العمل الخاصة بك اليوم؟"
      }
    };

    // --- HEADERS FOR CORS ---
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS, DELETE, PUT",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      return new Response("OK", { headers: corsHeaders });
    }

    // --- REST API ROUTER ---
    if (path.startsWith("/api/")) {
      const responseInit = {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...corsHeaders
        }
      };

      if (path === "/api/settings" && method === "GET") {
        return new Response(JSON.stringify(db.settings), responseInit);
      }

      if (path === "/api/products" && method === "GET") {
        return new Response(JSON.stringify(db.products), responseInit);
      }

      if (path === "/api/categories" && method === "GET") {
        return new Response(JSON.stringify(db.categories), responseInit);
      }

      if (path === "/api/ads" && method === "GET") {
        return new Response(JSON.stringify(db.ads), responseInit);
      }

      if (path === "/api/payment-methods" && method === "GET") {
        return new Response(JSON.stringify(db.payment_methods), responseInit);
      }

      if (path === "/api/ai/settings" && method === "GET") {
        return new Response(JSON.stringify(db.ai_settings), responseInit);
      }

      // User/Admin auth endpoint
      if (path === "/api/auth/login" && method === "POST") {
        try {
          const reqBody = await request.json();
          const { email, password } = reqBody;

          if (email === "m@gmail.gom" && password === "123456") {
            return new Response(JSON.stringify({
              success: true,
              role: "admin",
              admin: { id: 1001, name: "المشرف محمود", email: "m@gmail.gom", role: "super_admin" }
            }), responseInit);
          } else {
            return new Response(JSON.stringify({
              success: true,
              role: "user",
              user: { id: Date.now(), name: email.split("@")[0], email: email, kycStatus: "unverified" }
            }), responseInit);
          }
        } catch (e) {
          return new Response(JSON.stringify({ error: "Invalid Login Content" }), { status: 400, ...responseInit });
        }
      }

      // AI chat with Gemini endpoint
      if (path === "/api/ai/chat" && method === "POST") {
        try {
          const reqBody = await request.json();
          const { message } = reqBody;

          const apiKey = env.GEMINI_API_KEY || "TEMPORARY_FALLBACK_KEY";
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

          const geminiPayload = {
            contents: [
              {
                parts: [
                  { text: `${db.ai_settings.system_instruction}\nرغبة العميل وطرحه الحالي: ${message}` }
                ]
              }
            ]
          };

          const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(geminiPayload)
          });

          if (!geminiResponse.ok) {
            throw new Error("Gemini API call failed");
          }

          const geminiData = await geminiResponse.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "أهلاً بك، تعذر حالياً معالجة الرد عبر خوادم السحابة، يرجى الاستعانة بالنظام في ثوانٍ لاحقة.";
          
          return new Response(JSON.stringify({ reply }), responseInit);
        } catch (err) {
          // Fallback to high quality rule-based response if API fails
          let fallbackReply = "شكراً لتواصلك مع مركز الرضوان. أجهزة الورشات الخاصة بنا ترحب بك! نقوم بتوفير حديد تسليح ممتاز مبروم بسعر 9.5 مليون للطن، وإسمنت مقاوم للأملاح بسعر 175 ألف ليرة سورية للكيس الواحد. يرجى الاتصال بنا عبر واتساب لمتابعة طلبك وشحنه بأمان.";
          return new Response(JSON.stringify({ reply: fallbackReply }), responseInit);
        }
      }

      return new Response(JSON.stringify({ error: "API Route Not Found" }), { status: 404, ...responseInit });
    }

    // --- SERVE THE BEAUTIFUL HTML CLIENT-SIDE SPA ---
    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>مركز الرضوان لمواد البناء والأدوات الإنشائية</title>
  
  <!-- CSS Tailwind V4 / Inter / JetBrains and Font Awesome -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  <style>
    body {
      font-family: 'Cairo', 'Inter', sans-serif;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col pb-16 sm:pb-0">

  <!-- TOP RUNNING ANNOUNCEMENT BAR -->
  <div id="announcement-bar" class="bg-amber-500 text-slate-950 font-bold text-center text-xs sm:text-sm py-2 px-4 shadow-sm relative overflow-hidden flex justify-center items-center gap-2">
    <span>🔔 حسومات كبرى تصل لغاية 15% على أدوات تأسيس السباكة والكهرباء!</span>
  </div>

  <!-- HEADER -->
  <header class="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center gap-4">
      
      <!-- LOGO -->
      <div class="flex items-center gap-2.5 cursor-pointer" onclick="navigate('home')">
        <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
          🏗️
        </div>
        <div>
          <h1 class="font-extrabold text-[#111827] text-base sm:text-lg tracking-tight">مركز الرضوان</h1>
          <p class="text-[10px] text-gray-500 font-medium">لمواد البناء والأدوات الإنشائية والصحية</p>
        </div>
      </div>

      <!-- SEARCH BAR -->
      <div class="hidden md:flex flex-1 max-w-md relative">
        <input type="text" id="desktop-search" oninput="handleSearch(this.value)" placeholder="ابحث عن الاسمنت البورتلاندي، حديد التسليح، الأنابيب والوصلات..." class="w-full bg-slate-100 text-xs text-slate-800 px-10 py-2.5 rounded-full border border-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500">
        <i class="fa-solid fa-magnifying-glass text-gray-400 absolute right-4 top-3.5 text-xs"></i>
      </div>

      <!-- ACTIONS & AUTH -->
      <div class="flex items-center gap-3">
        <!-- Cart Trigger -->
        <button onclick="toggleCartDrawer(true)" class="relative p-2.5 bg-slate-100 hover:bg-slate-200 transition rounded-xl text-slate-800 flex items-center justify-center cursor-pointer">
          <i class="fa-solid fa-cart-shopping text-sm"></i>
          <span id="cart-count-badge" class="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center hidden">0</span>
        </button>

        <!-- Profile/Auth Action -->
        <div id="auth-actions" class="flex items-center gap-2">
          <!-- Injected dynamically -->
        </div>
      </div>

    </div>
  </header>

  <!-- MOBILE HEADER SEARCH SUB-ROW -->
  <div class="md:hidden bg-white px-4 py-2 border-b border-slate-100 flex items-center gap-2">
    <div class="relative flex-1">
      <input type="text" id="mobile-search" oninput="handleSearch(this.value)" placeholder="ابحث في مركز الرضوان..." class="w-full bg-slate-100 text-xs text-slate-800 px-10 py-2.5 rounded-xl border border-gray-150 focus:outline-none focus:ring-2 focus:ring-amber-500">
      <i class="fa-solid fa-magnifying-glass text-gray-400 absolute right-4 top-3.5 text-xs"></i>
    </div>
  </div>

  <!-- MAIN WRAPPER CONTAINER -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div id="app-view-container" class="opacity-100 transition-all duration-300">
      <!-- Views are dynamically injected here -->
    </div>
  </main>

  <!-- BOTTOM NAVIGATION FOR MOBILE -->
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 flex justify-around py-3.5 px-2 shadow-lg">
    <button onclick="navigate('home')" class="nav-btn flex flex-col items-center gap-1 text-slate-700 active-nav" id="nav-btn-home">
      <i class="fa-solid fa-house text-base"></i>
      <span class="text-[10px] font-bold">الرئيسية</span>
    </button>
    <button onclick="navigate('categories')" class="nav-btn flex flex-col items-center gap-1 text-slate-400" id="nav-btn-categories">
      <i class="fa-solid fa-cubes text-base"></i>
      <span class="text-[10px] font-bold">الأقسام</span>
    </button>
    <button onclick="navigate('ads')" class="nav-btn flex flex-col items-center gap-1 text-slate-400" id="nav-btn-ads">
      <i class="fa-solid fa-bullhorn text-base"></i>
      <span class="text-[10px] font-bold">الحراج</span>
    </button>
    <button onclick="navigate('me')" class="nav-btn flex flex-col items-center gap-1 text-slate-400" id="nav-btn-me">
      <i class="fa-solid fa-user text-base"></i>
      <span class="text-[10px] font-bold">حسابي</span>
    </button>
  </nav>

  <!-- CART DRAWER MODAL -->
  <div id="cart-drawer-overlay" class="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-xs hidden" onclick="toggleCartDrawer(false)">
    <div class="fixed top-0 bottom-0 left-0 max-w-md w-full bg-white shadow-2xl flex flex-col transition-transform duration-300 translate-x-[-100%]" id="cart-drawer-container" onclick="event.stopPropagation()">
      
      <!-- Drawer Header -->
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-cart-shopping text-amber-500 text-lg"></i>
          <h3 class="font-extrabold text-[#111827]">سلة طلباتك الإنشائية</h3>
        </div>
        <button onclick="toggleCartDrawer(false)" class="p-2 hover:bg-gray-200 transition rounded-lg text-slate-500 cursor-pointer">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Cart Content List -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4" id="cart-drawer-items">
        <!-- Items listed here -->
      </div>

      <!-- Drawer Footer (Calculations, Payment Option, Order Form) -->
      <div id="cart-drawer-footer" class="p-5 border-t border-gray-100 bg-slate-50 space-y-4">
        <div class="space-y-2">
          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>مجموع السلع:</span>
            <span id="cart-subtotal-text">0 ل.س</span>
          </div>
          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>التوصيل والتحميل:</span>
            <span class="text-emerald-600 font-bold">مجاني للموقع الورشة</span>
          </div>
          <div class="flex justify-between items-center text-sm font-bold text-[#111827] pt-2 border-t border-gray-250">
            <span>القيمة الإجمالية:</span>
            <span id="cart-total-text" class="text-amber-600">0 ل.س</span>
          </div>
        </div>

        <!-- Order Form Fields -->
        <div class="space-y-3 pt-3">
          <div>
            <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">الاسم الكامل للمستلم:</label>
            <input type="text" id="order-customer-name" class="w-full text-xs px-3 py-2 border rounded-lg focus:outline-slate-400">
          </div>
          <div class="flex justify-between gap-2">
            <div class="flex-1">
              <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">رقم هاتف الواتساب:</label>
              <input type="tel" id="order-customer-phone" placeholder="963955566778" class="w-full text-xs px-3 py-2 border rounded-lg focus:outline-slate-400">
            </div>
            <div class="flex-1">
              <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">عنوان التوصيل بالدقة:</label>
              <input type="text" id="order-customer-address" placeholder="الموقع الإنشائي بدمشق" class="w-full text-xs px-3 py-2 border rounded-lg focus:outline-slate-400">
            </div>
          </div>
          
          <!-- Payment Option -->
          <div>
            <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-2">طريقة الدفع الرقمية للتعميد:</label>
            <div class="grid grid-cols-2 gap-2" id="cart-payment-methods">
              <!-- Payment option select -->
            </div>
          </div>

          <!-- Base64 payment proof loader -->
          <div>
            <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">إيصال التحويل (لقطة شاشة الدفع):</label>
            <input type="file" id="order-payment-proof" accept="image/*" class="w-full text-[10px] border border-gray-150 p-1.5 rounded-lg">
          </div>

          <button onclick="submitOrder()" class="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3 rounded-xl transition shadow-md cursor-pointer">
            تعميد وتثبيت الطلبية الفورية 👷‍♂️
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- AUTH PORTAL MODAL -->
  <div id="auth-modal" class="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
      <button onclick="toggleAuthModal(false)" class="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg text-slate-500">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-3">
          <i class="fa-solid fa-lock text-lg"></i>
        </div>
        <h3 class="font-extrabold text-slate-950">بوابة العضوية والمقاولين</h3>
        <p class="text-xs text-gray-500 mt-1">سجل بريدك الإلكتروني لتسجيل ومتابعة الطلبيات</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للعميل:</label>
          <input type="email" id="auth-email" placeholder="example@gmail.com" class="w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-slate-400">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">كلمة المرور:</label>
          <input type="password" id="auth-password" placeholder="******" class="w-full text-xs px-3 py-2.5 border rounded-xl focus:outline-slate-400">
          <p class="text-[9px] text-gray-400 mt-1">تنبيه: للدخول بلوحة المشرف محمود، استخدم البريد <span class="font-bold underline">m@gmail.gom</span> وكلمة السر <span class="font-bold underline">123456</span></p>
        </div>
        <button onclick="performAuth()" class="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow-md">
          تحقق ودخول فوري 🚪
        </button>
      </div>
    </div>
  </div>

  <!-- ADD MAPPED PRODUCT/AD MODAL -->
  <div id="add-item-modal" class="fixed inset-0 bg-slate-950/40 z-50 backdrop-blur-xs hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <button onclick="toggleAddItemModal(false)" class="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-lg text-slate-500">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="mb-5">
        <h3 class="font-extrabold text-slate-950 text-base">إضافة مادة للكتالوج أو إعلان جديد</h3>
        <p class="text-xs text-slate-400">تعبئة مواصفات المادة أو المعدة والصور</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">نوع الغرض المضاف:</label>
          <select id="item-type" onchange="toggleItemTypeForm(this.value)" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
            <option value="ad">إعلان مبوب بحراج المواد المستعملة</option>
            <option value="product" id="admin-only-product-option">منتج للبيع الرئيسي بالمركز (أدمن فقط)</option>
          </select>
        </div>

        <div id="form-title-wrapper">
          <label class="block text-xs font-bold text-slate-700 mb-1">العنوان أو اسم السلعة:</label>
          <input type="text" id="item-title" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
        </div>

        <div class="flex gap-2">
          <div class="flex-1" id="form-price-wrapper">
            <label class="block text-xs font-bold text-slate-700 mb-1">السعر (ل.س):</label>
            <input type="number" id="item-price" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
          </div>
          <div class="flex-1" id="form-qty-wrapper">
            <label class="block text-xs font-bold text-slate-700 mb-1">الكمية المتوفرة:</label>
            <input type="number" id="item-qty" value="1" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
          </div>
        </div>

        <div id="form-category-wrapper" class="hidden">
          <label class="block text-xs font-bold text-slate-700 mb-1">القسم المعماري أو الإداري:</label>
          <select id="item-category-id" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
            <!-- Injected -->
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">تفاصيل ومواصفات المادة:</label>
          <textarea id="item-desc" rows="3" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400"></textarea>
        </div>

        <div id="form-contact-wrapper">
          <label class="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب للتواصل وتنسيق الشحن:</label>
          <input type="text" id="item-contact" placeholder="963933112233" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">صورة السلعة التوضيحية:</label>
          <input type="file" id="item-image" accept="image/*" class="w-full text-xs border p-2 rounded-xl">
        </div>

        <button onclick="submitNewItem()" class="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3 rounded-xl transition shadow-md cursor-pointer">
          نشر وحفظ فوري بالموقع 🚀
        </button>
      </div>
    </div>
  </div>

  <!-- FLOATING NEURAL VOICE AI ASSISTANT -->
  <div class="fixed bottom-20 sm:bottom-6 left-6 z-50">
    <!-- Chat Button Bubble -->
    <button onclick="toggleAiAssistant(true)" class="w-14 h-14 bg-slate-900 hover:bg-slate-950 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-115 relative cursor-pointer group animate-bounce">
      <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
      </span>
      <i class="fa-solid fa-sparkles text-amber-400 text-lg group-hover:rotate-12 transition duration-200"></i>
    </button>
  </div>

  <!-- AI CHAT ASSISTANT PANEL DRAWER -->
  <div id="ai-assistant-overlay" class="fixed inset-0 bg-slate-950/30 z-50 backdrop-blur-xs hidden" onclick="toggleAiAssistant(false)">
    <div class="fixed bottom-0 top-0 left-0 max-w-sm sm:max-w-md w-full bg-white shadow-2xl flex flex-col transition-transform duration-300 translate-x-[-100%]" id="ai-assistant-drawer" onclick="event.stopPropagation()">
      
      <!-- Drawer Header -->
      <div class="p-4 bg-slate-900 text-white flex justify-between items-center">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold">
            🤖
          </div>
          <div>
            <h3 class="font-extrabold text-sm text-white">مساعد الرضوان الصوتي الذكي</h3>
            <p class="text-[10px] text-amber-400 font-medium">ذكي، صوتي، خبير بحساب الكميات والأرضيات</p>
          </div>
        </div>
        <button onclick="toggleAiAssistant(false)" class="p-2 hover:bg-slate-800 transition rounded-lg text-white cursor-pointer">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>

      <!-- Dialogue/Messages Display Area -->
      <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50" id="ai-messages-area">
        <!-- Welcoming dialogue will appear here -->
      </div>

      <!-- Input Controls with speech detection & local SpeechSynthesis fallbacks -->
      <div class="p-4 border-t border-gray-150 bg-white space-y-3">
        
        <!-- Quick pre-prompts for building calculators -->
        <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth text-right" dir="rtl">
          <button onclick="sendQuickAiPrompt('احسب لي كم كيلو إسمنت يلزم لصب عمود خرساني بارتفاع 3 أمتار؟')" class="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-amber-100 rounded-full text-slate-800 whitespace-nowrap transition">📐 عمود خرساني</button>
          <button onclick="sendQuickAiPrompt('كم طن حديد أحتاج لبناء سقف بمساحة 100 متر مربع؟')" class="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-amber-100 rounded-full text-slate-800 whitespace-nowrap transition">🏢 سقف 100م</button>
          <button onclick="sendQuickAiPrompt('ما هي أفضل مادة عزل مائية للأسطح المكشوفة بدمشق؟')" class="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-amber-100 rounded-full text-slate-800 whitespace-nowrap transition">💧 عازل أسطح</button>
        </div>

        <div class="flex gap-2">
          <button id="mic-btn" onclick="toggleMic()" class="w-11 h-11 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-microphone text-sm"></i>
          </button>
          <input type="text" id="ai-user-input" onkeyup="if(event.key === 'Enter') handleAiSend()" placeholder="اطرح أي سؤال، أو تحدث بصوتك مباشرة..." class="flex-1 text-xs px-4 border rounded-xl focus:outline-slate-400">
          <button onclick="handleAiSend()" class="w-11 h-11 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center justify-center cursor-pointer">
            <i class="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </div>
        <p class="text-[9px] text-gray-500 text-center">🎤 تلميح: عند التحدث، يتم ترجمة صوتك تلقائياً لنص وسيقوم القارئ الصوتي المدمج بالمتصفح بلفظ الرد مباشرة بسماع سوري لطيف.</p>
      </div>

    </div>
  </div>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toast-container" class="fixed top-5 left-5 z-55 flex flex-col gap-2 max-w-sm w-full"></div>

  <!-- FOOTER -->
  <footer class="bg-slate-900 text-gray-400 text-xs py-8 border-t border-slate-800 hidden sm:block">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-right" dir="rtl">
      <div>
        <h4 class="font-bold text-white text-sm mb-3">مركز الرضوان لمواد البناء</h4>
        <p class="text-[11px] leading-relaxed text-gray-400">نلتزم بتأمين حديد التسليح المميز، الإسمنت البورتلاندي المقاوم للأملاح، الأنابيب الخضراء ومعدات السباكة والكهرباء بجودة غير مسمومة وبخدمة تحميل سريعة لكافة الورش والمواقع الإنشائية بدمشق وضواحيها.</p>
      </div>
      <div>
        <h4 class="font-bold text-white text-sm mb-3">طرق السداد المعتمدة والمؤمنة</h4>
        <p class="text-[11px] leading-relaxed text-gray-400">ندعم التحويل المالي عبر تطبيق شام كاش أو USDT للعملات الرقمية لسرعة إصدار فواتير المواد بدمشق وتدقيق المالي للأنظمة.</p>
      </div>
      <div>
        <h4 class="font-bold text-white text-sm mb-3">المساعدة والدعم</h4>
        <p class="text-[11px] text-gray-400 leading-relaxed">تواصل معنا عبر واتساب الإدارة الرئيسي: <span class="text-amber-500 font-bold mono">963955566778</span><br>أو تواصل مع المساعد الصوتي العصبي المرفق المتكامل.</p>
      </div>
    </div>
    <div class="text-center text-gray-600 text-[10px] mt-8 pt-4 border-t border-slate-800/50">
      &copy; 2026 مركز الرضوان لمواد البناء والأدوات الصحية والإنشائية. جميع الحقوق الفنية ومسارات الداتا محفوظة لتسهيل عمليات الإعمار.
    </div>
  </footer>

  <!-- DYNAMIC LOGIC SCRIPT -->
  <script>
    // Local In-Memory Data Backup & Synchronization Strategy
    // Extracted database contents which was initialized above
    let state = {
      settings: {},
      categories: [],
      products: [],
      ads: [],
      payment_methods: [],
      ai_settings: {},
      user: null, 
      admin: null,
      cart: [],
      currentView: 'home',
      searchQuery: '',
      isMuted: false,
      selectedCategoryId: null
    };

    // Initialize configuration
    async function init() {
      try {
        // Load default configs
        const resSettings = await fetch('/api/settings').then(r => r.json());
        const resCategories = await fetch('/api/categories').then(r => r.json());
        const resProducts = await fetch('/api/products').then(r => r.json());
        const resAds = await fetch('/api/ads').then(r => r.json());
        const resPaymentMethods = await fetch('/api/payment-methods').then(r => r.json());
        const resAiSettings = await fetch('/api/ai/settings').then(r => r.json());

        state.settings = resSettings;
        state.categories = resCategories;
        state.products = resProducts;
        state.ads = resAds;
        state.payment_methods = resPaymentMethods;
        state.ai_settings = resAiSettings;

        // Restore custom items created in localStorage to sustain DB persistence
        const localProducts = JSON.parse(localStorage.getItem('alradwan_local_products') || '[]');
        const localAds = JSON.parse(localStorage.getItem('alradwan_local_ads') || '[]');
        state.products = [...localProducts, ...state.products];
        state.ads = [...localAds, ...state.ads];

        // Restore cart
        state.cart = JSON.parse(localStorage.getItem('alradwan_cart') || '[]');

        // Restore user authentication
        const localUser = JSON.parse(localStorage.getItem('alradwan_user') || 'null');
        const localAdmin = JSON.parse(localStorage.getItem('alradwan_admin') || 'null');
        if (localUser) state.user = localUser;
        if (localAdmin) state.admin = localAdmin;

        // Populate and construct
        document.getElementById('announcement-bar').innerHTML = '<span>' + (state.settings.header_announcement || '') + '</span>';
        if (document.getElementById('desktop-search')) {
          document.getElementById('desktop-search').placeholder = state.settings.search_placeholder || '';
        }

        updateAuthStatusHeader();
        updateCartCount();
        navigate('home');

        // Welcome AI assistance greeting
        addAiMessage('bot', state.ai_settings.welcome_message || 'مرحباً بك في مركز الرضوان لمواد البناء والأدوات الإنشائية! 🏗️ كيف أستطيع خدمتك اليوم؟');
      } catch (err) {
        console.error("Initialization issue, fallback locally", err);
      }
    }

    // --- NAVIGATION ---
    function navigate(viewName) {
      state.currentView = viewName;
      
      // Highlight active button in mobile nav bar
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('text-amber-500', 'active-nav'));
      const activeBtn = document.getElementById('nav-btn-' + viewName);
      if (activeBtn) activeBtn.classList.add('text-amber-500', 'active-nav');

      renderView();
    }

    // --- ROUTE RENDERING ENGINE ---
    function renderView() {
      const parent = document.getElementById('app-view-container');
      parent.style.opacity = '0';
      
      setTimeout(() => {
        if (state.currentView === 'home') {
          renderHomeView(parent);
        } else if (state.currentView === 'categories') {
          renderCategoriesView(parent);
        } else if (state.currentView === 'ads') {
          renderAdsView(parent);
        } else if (state.currentView === 'me') {
          renderMeView(parent);
        } else if (state.currentView === 'admin' && state.admin) {
          renderAdminView(parent);
        } else {
          // Fallback to home if not authorized
          renderHomeView(parent);
        }
        parent.style.opacity = '1';
      }, 150);
    }

    // --- VIEW: HOME VIEW ---
    function renderHomeView(wrapper) {
      let filtered = state.products.filter(p => {
        if (p.status === 'hidden') return false;
        if (state.selectedCategoryId !== null && p.category_id !== state.selectedCategoryId) return false;
        if (state.searchQuery.trim() !== '') {
          const q = state.searchQuery.toLowerCase();
          return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        }
        return true;
      });

      let categoryChips = state.categories.map(cat => {
        const isActive = state.selectedCategoryId === cat.id;
        return \`
          <button onclick="filterByCategory(\${cat.id})" class="px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer \${
            isActive ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }">
            \${cat.name}
          </button>
        \`;
      }).join('');

      let productsGrid = filtered.map(p => {
        const itemQtyLabel = p.quantity > 0 ? \`متوفر بالمخزن (\${p.quantity} وحدة)\` : 'نفذت الكمية حالياً';
        const itemQtyColor = p.quantity > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50';
        const discountSpan = p.sale_price ? \`
          <span class="text-xs line-through text-gray-400 font-bold ml-2">\${p.price.toLocaleString()} ل.س</span>
          <span class="text-sm font-extrabold text-amber-600">\${p.sale_price.toLocaleString()} ل.س</span>
        \` : \`<span class="text-sm font-extrabold text-slate-950">\${p.price.toLocaleString()} ل.س</span>\`;

        return \`
          <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between h-full relative group">
            
            \${p.sale_price ? \`<span class="absolute top-3 right-3 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full z-10 shadow-sm animate-pulse">تخفيض خاص 🔥</span>\` : ''}

            <!-- Card Thumbnail with reference image key -->
            <div class="w-full h-44 bg-slate-100 flex items-center justify-center relative overflow-hidden">
              \${p.image_key ? \`<img src="/api/image/\${p.image_key}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">\` : \`
                <div class="text-center p-4">
                  <div class="text-lg mb-1">🏗️</div>
                  <span class="text-[10px] text-gray-400 font-semibold">\${p.name}</span>
                </div>
              \`}
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[9px] font-extrabold bg-slate-100 text-slate-800 px-2 py-1 rounded-md mb-2 inline-block">الكتالوج الإنشائي</span>
                <h4 class="font-bold text-slate-950 text-xs sm:text-sm leading-tight mb-1 cursor-pointer" onclick="showProductDetails(\${p.id})">\${p.name}</h4>
                <p class="text-[11px] text-gray-500 leading-snug line-clamp-2 mb-3">\${p.description || ''}</p>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3 text-[10px]">
                  <span class="font-bold \${itemQtyColor} px-2 py-0.5 rounded-full">\${itemQtyLabel}</span>
                  <div class="flex items-center gap-1.5 text-amber-500">
                    <i class="fa-solid fa-star text-[9px]"></i>
                    <span class="font-extrabold">4.9</span>
                  </div>
                </div>

                <!-- Price and Add to Cart Section -->
                <div class="flex items-center justify-between pt-3 border-t border-slate-50">
                  <div class="flex flex-col">
                    \${discountSpan}
                  </div>
                  \${p.quantity > 0 ? \`
                    <button onclick="addToCart(\${p.id})" class="p-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition cursor-pointer flex items-center justify-center">
                      <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                  \` : \`
                    <button disabled class="p-2.5 bg-gray-100 text-gray-400 rounded-xl cursor-not-allowed">
                      <i class="fa-solid fa-slash text-xs"></i>
                    </button>
                  \`}
                </div>
              </div>
            </div>

          </div>
        \`;
      }).join('');

      wrapper.innerHTML = \`
        <!-- HERO BANNER -->
        <div class="bg-gradient-to-l from-slate-900 via-slate-800 to-slate-950 rounded-3xl p-6 sm:p-12 text-white relative overflow-hidden shadow-lg mb-8">
          <div class="max-w-xl relative z-10 text-right">
            <span class="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">خيار البناء المعتمد في سوريا 🇸🇾</span>
            <h2 class="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight mb-3">شريك المقاولين المالي والإنشائي المتكامل</h2>
            <p class="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm mb-6">\${state.settings.site_description || ''}</p>
            <div class="flex flex-wrap gap-3">
              <button onclick="navigate('categories')" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow transition cursor-pointer">كتالوج الخرسانة والأدوات</button>
              <a href="https://wa.me/963955566778" target="_blank" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 justify-center">
                <i class="fa-brands fa-whatsapp text-emerald-500"></i> واتساب الإدارة المباشر
              </a>
            </div>
          </div>
          <!-- Abstract Background Shape -->
          <div class="absolute -left-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div class="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <!-- Trust Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
              <i class="fa-solid fa-shield-halved text-sm"></i>
            </div>
            <div>
              <h5 class="font-bold text-xs text-slate-950">جودة فنية متكاملة</h5>
              <p class="text-[9px] text-gray-400">إسمنت بورتلاندي وحديد صلب</p>
            </div>
          </div>
          <div class="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <div class="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <i class="fa-solid fa-truck text-sm"></i>
            </div>
            <div>
              <h5 class="font-bold text-xs text-slate-950">توصيل للورشه مباشر</h5>
              <p class="text-[9px] text-gray-400">تغطية لكافة مناطق دمشق وريفها</p>
            </div>
          </div>
          <div class="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <div class="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <i class="fa-solid fa-clock-rotate-left text-sm"></i>
            </div>
            <div>
              <h5 class="font-bold text-xs text-slate-950">تحصيل وتثبيت سريع</h5>
              <p class="text-[9px] text-gray-400">سداد رقمي ومحاسبي فوري</p>
            </div>
          </div>
          <div class="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
            <div class="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
              <i class="fa-solid fa-user-tie text-sm"></i>
            </div>
            <div>
              <h5 class="font-bold text-xs text-slate-950">مستشار فني ذكي</h5>
              <p class="text-[9px] text-gray-400">حساب فوري لكميات صب الأسقف</p>
            </div>
          </div>
        </div>

        <!-- CATEGORY CAROUSEL CHIPS -->
        <div class="mb-6">
          <h3 class="font-extrabold text-slate-900 text-sm sm:text-base mb-3 flex items-center gap-1.5">
            <i class="fa-solid fa-cubes text-amber-500"></i> المواد والكتالوجات المتوفرة بالمخازن
          </h3>
          <div class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
            <button onclick="filterByCategory(null)" class="px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer \${
              state.selectedCategoryId === null ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }">جميع السلع (\${state.products.length})</button>
            \${categoryChips}
          </div>
        </div>

        <!-- PRODUCTS MAIN GRID -->
        \${productsGrid ? \`
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            \${productsGrid}
          </div>
        \` : \`
          <div class="text-center py-16 bg-white border border-dashed rounded-3xl p-8 max-w-sm mx-auto">
            <div class="text-4xl mb-2">📦</div>
            <p class="text-xs text-gray-400 font-bold">لا تتوفر سلع مناسبة لبحثك الحالي بدمشق حالياً.</p>
          </div>
        \`}
      \`;
    }

    function filterByCategory(catId) {
      state.selectedCategoryId = catId;
      renderView();
    }

    // --- VIEW: CATEGORIES VIEW ---
    function renderCategoriesView(wrapper) {
      let categoriesRows = state.categories.map(cat => {
        let catProducts = state.products.filter(p => p.category_id === cat.id);
        return \`
          <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500 font-bold">🏢</div>
                <h4 class="font-bold text-slate-950 text-sm sm:text-base">\${cat.name}</h4>
              </div>
              <span class="text-xs font-semibold text-gray-400 bg-slate-50 px-3 py-1 rounded-full">\${catProducts.length} سلع معتمدة</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              \${catProducts.map(p => \`
                <div class="bg-slate-50 p-3 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span class="font-bold text-slate-800 block">\${p.name}</span>
                    <span class="text-[10px] text-gray-400 mt-1 block">\${p.price.toLocaleString()} \${state.settings.currency}</span>
                  </div>
                  <button onclick="addToCart(\${p.id}); showSuccessToast('تمت الإضافة للسلة الإنشائية ✅')" class="p-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg transition">
                    <i class="fa-solid fa-plus text-[10px]"></i>
                  </button>
                </div>
              \`).join('')}
            </div>
          </div>
        \`;
      }).join('');

      wrapper.innerHTML = \`
        <div class="max-w-3xl mx-auto space-y-6">
          <div class="text-right">
            <h2 class="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
              <i class="fa-solid fa-building-circle-check text-amber-500"></i> حوكمة القطاعات وأقسام التأسيس
            </h2>
            <p class="text-xs text-gray-500 mt-1">تسهيل تصفع السوائب، السباكة، العزل، والدهانات المتطابقة بدمشق</p>
          </div>
          <div class="space-y-6">
            \${categoriesRows}
          </div>
        </div>
      \`;
    }

    // --- VIEW: ADS VIEW ---
    function renderAdsView(wrapper) {
      let activeAds = state.ads.filter(ad => ad.is_active === 1);
      let adsLayout = activeAds.map(ad => {
        return \`
          <div class="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs relative flex flex-col justify-between hover:shadow-md transition">
            \${ad.is_pinned ? \`<span class="absolute top-4 left-4 bg-amber-500 text-slate-950 font-bold text-[9px] px-3 py-1 rounded-full z-10"><i class="fa-solid fa-thumbtack"></i> مثبت وموثق</span>\` : ''}
            <div>
              <div class="flex items-center gap-2 mb-3">
                <div class="w-7 h-7 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center font-bold text-xs">👷‍♂️</div>
                <div>
                  <span class="font-bold text-xs text-slate-900 block">\${ad.user_name || 'مقاول مستقل'}</span>
                  <span class="text-[9px] text-gray-400 font-semibold">\${new Date(ad.created_at).toLocaleDateString('ar')}</span>
                </div>
              </div>
              <h4 class="font-bold text-slate-950 text-xs sm:text-sm leading-tight mb-2">\${ad.title}</h4>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">\${ad.description}</p>
            </div>
            
            <div class="pt-4 border-t border-slate-50 flex justify-between items-center">
              <a href="https://wa.me/\${ad.contact}" target="_blank" class="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-bold text-[10px] sm:text-xs transition flex items-center gap-1.5 justify-center">
                <i class="fa-brands fa-whatsapp text-emerald-400"></i> تنسيق واستلام الحمولة الفورية
              </a>
              <span class="text-[9px] text-gray-400 font-semibold mono">رقم الاتصال: \${ad.contact}</span>
            </div>
          </div>
        \`;
      }).join('');

      wrapper.innerHTML = \`
        <div class="max-w-4xl mx-auto space-y-6">
          <div class="flex justify-between items-center">
            <div class="text-right">
              <h2 class="font-extrabold text-slate-900 text-lg flex items-center gap-1.5">
                <i class="fa-solid fa-bullhorn text-amber-500"></i> حراج المعاملات ومبيعات الفائض الإنشائي
              </h2>
              <p class="text-xs text-slate-400 mt-1 font-semibold">بوابة المقاولين للتخلص من فائض البلوك، الحديد المستعمل، أو طلب خرسانة عاجلة</p>
            </div>
            <button onclick="openPostAdModal()" class="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer transition">
              <i class="fa-solid fa-plus"></i> انشر إعلانك الفائض مجاناً
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            \${adsLayout ? adsLayout : \`
              <div class="col-span-2 text-center py-16 bg-white border border-dashed rounded-3xl p-8 max-w-sm mx-auto">
                <div class="text-4xl mb-2">📢</div>
                <p class="text-xs text-gray-400 font-bold">لا تتوفر إعلانات مبوبة نشطة اليوم.</p>
              </div>
            \`}
          </div>
        </div>
      \`;
    }

    // --- VIEW: MEMBER FILE VIEW ---
    function renderMeView(wrapper) {
      if (!state.user && !state.admin) {
        wrapper.innerHTML = \`
          <div class="text-center py-16 bg-white border border-slate-100 rounded-3xl max-w-sm mx-auto p-8 shadow-sm">
            <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-4 text-xl">👤</div>
            <h4 class="font-bold text-slate-950 mb-1">يرجى تسجيل العضوية لمواصلة الأعمال الإنشائية</h4>
            <p class="text-xs text-gray-500 mb-6">تحتاج لتسجيل الدخول الفوري لمتابعة طلبيات السوائب وإدراج إعلانات الحراج الحيوية.</p>
            <button onclick="toggleAuthModal(true)" class="px-6 py-2.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-xl shadow cursor-pointer">
              تسجيل الدخول / إنشاء حساب فوري 🚪
            </button>
          </div>
        \`;
        return;
      }

      const activeName = state.admin ? state.admin.name : state.user.name;
      const activeEmail = state.admin ? state.admin.email : state.user.email;
      const kycBadge = state.admin ? '<span class="bg-purple-100 text-purple-700 font-bold text-[10px] px-3 py-1 rounded-full"><i class="fa-solid fa-shield-halved"></i> إدارة عليا</span>' : \`
        <span class="bg-amber-50 text-amber-600 font-bold text-[9px] px-3 py-1 rounded-full border border-amber-200">مقاول مستقل</span>
      \`;

      // Simulating Order List under localStorage
      const userOrders = JSON.parse(localStorage.getItem('alradwan_local_orders') || '[]');
      let ordersRows = userOrders.map(order => {
        return \`
          <div class="bg-slate-50 border p-4 rounded-xl flex flex-col justify-between gap-2.5 text-xs">
            <div class="flex justify-between items-center border-b pb-2">
              <span class="font-extrabold text-[#111827]">طلب رقم: <span class="mono text-slate-600 font-semibold bg-white p-1 rounded border">\${order.order_number}</span></span>
              <span class="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">معتمد وقيد الشحن للعميل 🚚</span>
            </div>
            <div class="text-slate-600 space-y-1">
              <p>القيمة المالية الشاملة: <span class="font-bold text-amber-600">\${order.total.toLocaleString()} ل.س</span></p>
              <p>هاتف المستلم: <span class="font-semibold mono text-slate-700">\${order.customer_phone}</span></p>
              <p>موقع ورشة التسليم: <span>\${order.customer_address}</span></p>
            </div>
          </div>
        \`;
      }).join('');

      wrapper.innerHTML = \`
        <div class="max-w-2xl mx-auto space-y-6">
          
          <!-- Profile Badge Card -->
          <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-slate-950 text-white rounded-full flex items-center justify-center font-extrabold text-xl font-mono shadow-md">
                \${activeName[0].toUpperCase()}
              </div>
              <div class="text-right">
                <div class="flex items-center gap-2">
                  <h3 class="font-extrabold text-slate-950 text-base sm:text-lg">\${activeName}</h3>
                  \${kycBadge}
                </div>
                <p class="text-xs text-gray-400 font-bold mt-1 mono">\${activeEmail}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              \${state.admin ? \`
                <button onclick="navigate('admin')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md">
                  <i class="fa-solid fa-gears"></i> لوحة الإدارة محمود
                </button>
              \` : ''}
              <button onclick="performLogout()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-100 transition">تأمين الخروج</button>
            </div>
          </div>

          <!-- Self KYC Verify Application Block -->
          <div class="bg-white border rounded-2xl p-6 shadow-xs">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center font-bold">🛡️</div>
              <div>
                <h4 class="font-bold text-slate-950 text-sm">نظام التحقق المهني والمقاول المعتمد (KYC)</h4>
                <p class="text-[10px] text-gray-400">ارفع هويتك لربح الشارة الذهبية للشركاء وتمويل المواد</p>
              </div>
            </div>
            <div class="space-y-3 font-semibold text-xs text-slate-700 bg-slate-50 p-4 rounded-xl">
              <p class="text-gray-500">حالة الاعتماد الحالية: <span class="bg-amber-100 text-amber-700 font-extrabold px-3 py-1 rounded-full text-[10px]">قيد المراجعة الفورية للاعتماد 👷‍♂️</span></p>
              <p class="text-gray-400 text-[10px] leading-relaxed">تنبيه: يمكنك رفع صورة رخصة المقاولة أو الهوية لنقابة المهندسين السوريين بدمشق لتسهيل طلب حديد التسليح بالإجلة على ذمة ورقتك المالية.</p>
            </div>
          </div>

          <!-- History of Orders under Me view -->
          <div class="bg-white border rounded-2xl p-6 shadow-xs space-y-4">
            <h4 class="font-bold text-slate-950 text-sm flex items-center gap-2">
              <i class="fa-solid fa-receipt text-amber-500"></i> سجل الفواتير وطلبيات السمنت والحديد السابقة
            </h4>
            <div class="space-y-4">
              \${ordersRows ? ordersRows : \`
                <div class="text-center py-10 bg-slate-50 border border-dashed rounded-xl p-4">
                  <p class="text-[11px] text-gray-400 font-bold">لا تتوفر فواتير أو طلبيات مسجلة باسمك بعد بدمشق.</p>
                </div>
              \`}
            </div>
          </div>

        </div>
      \`;
    }

    // --- VIEW: ADMIN DASHBOARD (محمود SUPER ADMIN) ---
    function renderAdminView(wrapper) {
      // Products Table
      let productsTableRows = state.products.map(p => {
        return \`
          <tr class="border-b text-xs">
            <td class="p-3 font-bold text-slate-800">\${p.name}</td>
            <td class="p-3 mono font-bold text-slate-600">\${p.price.toLocaleString()}</td>
            <td class="p-3 mono font-bold text-slate-600">\${p.quantity}</td>
            <td class="p-3">
              <button onclick="deleteProductLocal(\${p.id})" class="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition">
                <i class="fa-solid fa-trash-can text-[10px]"></i>
              </td>
          </tr>
        \`;
      }).join('');

      wrapper.innerHTML = \`
        <div class="max-w-5xl mx-auto space-y-8 text-right" dir="rtl">
          
          <div class="bg-gradient-to-l from-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-md flex justify-between items-center">
            <div>
              <span class="text-amber-400 font-extrabold text-[10px] tracking-wider block bg-amber-500/10 px-2.5 py-1 rounded inline-block mb-2">نطاق الإدارة العليا لمركز الرضوان</span>
              <h2 class="font-extrabold text-base sm:text-xl">مرحباً بك، المشرف محمود 👷‍♂️</h2>
              <p class="text-xs text-slate-300 mt-1 leading-snug">بوابة التعديل السريع، وإدارة كتالوب السلع وحساب الطلبيات والاعتمادات المالية.</p>
            </div>
            <button onclick="navigate('home')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs rounded-xl transition">الخروج لقسم المعرض</button>
          </div>

          <!-- Layout Tabs for Admin controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <!-- Tab 1: Products and pricing control -->
            <div class="bg-white p-6 border rounded-2xl shadow-xs space-y-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                  <i class="fa-solid fa-pencil text-amber-500"></i> تعديل المواد وتسجيل بضائع جديدة
                </h3>
                <button onclick="openPostAddItemModal('product')" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-[10px] rounded-lg transition">
                  <i class="fa-solid fa-plus text-[9px]"></i> مادة جديدة
                </button>
              </div>

              <div class="overflow-x-auto max-h-80">
                <table class="w-full text-right border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b text-[10px] text-gray-500">
                      <th class="p-3">المادة</th>
                      <th class="p-3">السعر (ل.س)</th>
                      <th class="p-3">المخزون الفعلي</th>
                      <th class="p-3">إدارة</th>
                    </tr>
                  </thead>
                  <tbody>
                    \${productsTableRows}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab 2: Control of parameters & Announcements -->
            <div class="bg-white p-6 border rounded-2xl shadow-xs space-y-4">
              <h3 class="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <i class="fa-solid fa-sliders text-amber-500"></i> تخصيص الواجهة والإشعار العام
              </h3>
              
              <div class="space-y-3.5">
                <div>
                  <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">شريط الإشعارات الأصفر بالأعلى:</label>
                  <input type="text" id="admin-announcement-input" value="\${state.settings.header_announcement || ''}" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
                </div>
                <div>
                  <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">وصف المتجر (SEO):</label>
                  <textarea id="admin-desc-input" rows="3" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">\${state.settings.site_description || ''}</textarea>
                </div>
                <div>
                  <label class="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">رقم هاتف الواتساب المالي الشامل:</label>
                  <input type="text" id="admin-whatsapp-input" value="\${state.settings.whatsapp || ''}" class="w-full text-xs px-3 py-2 border rounded-xl focus:outline-slate-400">
                </div>

                <button onclick="saveAdminSettings()" class="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md">
                  حفظ وتعميد إعدادات الواجهة 🛡️
                </button>
              </div>
            </div>

          </div>

          <!-- Tab 3: Detailed Orders History and KYC Review -->
          <div class="bg-white p-6 border rounded-2xl shadow-xs space-y-4">
            <h3 class="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <i class="fa-solid fa-money-check text-emerald-500"></i> وثائق KYC وصناديق الطلبيات المودعة
            </h3>
            <p class="text-[11px] text-gray-500">قائمة بكافة رخص المقاولات والطلبيات الواردة من العملاء للتدقيق المالي الفوري.</p>
            <div class="bg-slate-50 p-4 rounded-xl font-bold text-xs text-slate-700 text-center">
              نظام المصادقة والمطابقة يعمل بكفاءة تامة. يمكنك تتبع حساب المقاولين وسجل الفواتير من MeView.
            </div>
          </div>

        </div>
      \`;
    }

    function deleteProductLocal(id) {
      state.products = state.products.filter(p => p.id !== id);
      localStorage.setItem('alradwan_local_products', JSON.stringify(state.products.filter(p => p.id < 100)));
      showSuccessToast('تم حذف السلعة من الكتالوج بنجاح ✅');
      renderView();
    }

    async function saveAdminSettings() {
      const ann = document.getElementById('admin-announcement-input').value;
      const desc = document.getElementById('admin-desc-input').value;
      const wa = document.getElementById('admin-whatsapp-input').value;

      state.settings.header_announcement = ann;
      state.settings.site_description = desc;
      state.settings.whatsapp = wa;

      // Update backend
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.settings)
      });

      document.getElementById('announcement-bar').innerHTML = '<span>' + ann + '</span>';
      showSuccessToast('تم تعميد وتحديث واجهة مركز الرضوان بنجاح 🛡️');
      renderView();
    }

    // --- SEARCH LOGIC ---
    let searchTimeout;
    function handleSearch(val) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.searchQuery = val;
        // Sync search inputs
        const desktopIn = document.getElementById('desktop-search');
        const mobileIn = document.getElementById('mobile-search');
        if (desktopIn) desktopIn.value = val;
        if (mobileIn) mobileIn.value = val;

        renderView();
      }, 250);
    }

    // --- AUTH CONSOLE ---
    function toggleAuthModal(show) {
      const modal = document.getElementById('auth-modal');
      if (show) modal.classList.remove('hidden');
      else modal.classList.add('hidden');
    }

    async function performAuth() {
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;

      if (!email) {
        showErrorToast('يرجى كتابة بريدك لتوثيق مقعدك العملي');
        return;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(r => r.json());

      if (res.success) {
        if (res.role === 'admin') {
          state.admin = res.admin;
          state.user = null;
          localStorage.setItem('alradwan_admin', JSON.stringify(res.admin));
          localStorage.removeItem('alradwan_user');
          showSuccessToast('مرحباً بك المشرف محمود، تم الدخول للغرفة العلوية للإشراف 👨‍✈️');
        } else {
          state.user = res.user;
          state.admin = null;
          localStorage.setItem('alradwan_user', JSON.stringify(res.user));
          localStorage.removeItem('alradwan_admin');
          showSuccessToast('مرحباً بك مقاولنا العزيز، تم توثيق تذكرة الدخول بنجاح! 👷‍♂️');
        }
        toggleAuthModal(false);
        updateAuthStatusHeader();
        navigate('me');
      }
    }

    function performLogout() {
      state.user = null;
      state.admin = null;
      localStorage.removeItem('alradwan_user');
      localStorage.removeItem('alradwan_admin');
      showSuccessToast('تم تسجيل الخروج وتأمين الفواتير بنجاح ✅');
      updateAuthStatusHeader();
      navigate('home');
    }

    function updateAuthStatusHeader() {
      const parent = document.getElementById('auth-actions');
      if (!parent) return;

      if (state.admin) {
        parent.innerHTML = \`
          <button onclick="navigate('me')" class="text-xs font-extrabold text-slate-900 bg-purple-50 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-purple-100 cursor-pointer">
            <span>محمود 👨‍✈️</span>
          </button>
        \`;
      } else if (state.user) {
        parent.innerHTML = \`
          <button onclick="navigate('me')" class="text-xs font-extrabold text-slate-900 bg-amber-50 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-amber-200 cursor-pointer">
            <span>\${state.user.name} 🔨</span>
          </button>
        \`;
      } else {
        parent.innerHTML = \`
          <button onclick="toggleAuthModal(true)" class="text-xs font-extrabold text-slate-900 hover:text-amber-600 transition cursor-pointer">
            <i class="fa-solid fa-user text-xs ml-1"></i> دخول
          </button>
        \`;
      }
    }

    // --- ADD MAPPED PRODUCT/AD MODAL ---
    let currentUploadType = 'ad';
    function openPostAdModal() {
      currentUploadType = 'ad';
      toggleAddItemModal(true);
    }
    
    function openPostAddItemModal(type) {
      currentUploadType = type;
      toggleAddItemModal(true);
    }

    function toggleAddItemModal(show) {
      const modal = document.getElementById('add-item-modal');
      const itemOption = document.getElementById('admin-only-product-option');
      
      if (show) {
        modal.classList.remove('hidden');
        document.getElementById('item-type').value = currentUploadType;
        toggleItemTypeForm(currentUploadType);

        if (state.admin) itemOption.disabled = false;
        else itemOption.disabled = true;
      } else {
        modal.classList.add('hidden');
      }
    }

    function toggleItemTypeForm(val) {
      currentUploadType = val;
      const formCat = document.getElementById('form-category-wrapper');
      const formContact = document.getElementById('form-contact-wrapper');
      const formPrice = document.getElementById('form-price-wrapper');
      const formQty = document.getElementById('form-qty-wrapper');

      if (val === 'product') {
        formCat.classList.remove('hidden');
        formContact.classList.add('hidden');
        formPrice.classList.remove('hidden');
        formQty.classList.remove('hidden');

        // Populate Categories Select
        const catSelect = document.getElementById('item-category-id');
        catSelect.innerHTML = state.categories.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('');
      } else {
        formCat.classList.add('hidden');
        formContact.classList.remove('hidden');
        formPrice.classList.add('hidden');
        formQty.classList.add('hidden');
      }
    }

    function submitNewItem() {
      const title = document.getElementById('item-title').value;
      const desc = document.getElementById('item-desc').value;

      if (!title || !desc) {
        showErrorToast('يرجى إدخال البيانات المطلوبة لتوثيق ومتابعة القطعة');
        return;
      }

      if (currentUploadType === 'ad') {
        const contact = document.getElementById('item-contact').value || '963955566778';
        const newAd = {
          id: Date.now(),
          title,
          description: desc,
          contact,
          user_name: state.user ? state.user.name : 'مقاول مستقل',
          is_active: 1,
          is_pinned: 0,
          created_at: Date.now()
        };

        state.ads.unshift(newAd);
        // Persist locally for cloud demo durability
        let localAds = JSON.parse(localStorage.getItem('alradwan_local_ads') || '[]');
        localAds.unshift(newAd);
        localStorage.setItem('alradwan_local_ads', JSON.stringify(localAds));

        showSuccessToast('تم إدراج إعلانك الفائض بالحراج وجاري مراجعة الشحنة ✅');
      } else {
        const price = Number(document.getElementById('item-price').value) || 10000;
        const qty = Number(document.getElementById('item-qty').value) || 1;
        const catId = Number(document.getElementById('item-category-id').value);

        const newProd = {
          id: Date.now(),
          name: title,
          description: desc,
          price,
          sale_price: null,
          quantity: qty,
          category_id: catId,
          image_key: null,
          status: 'active',
          whatsapp: '963955566778'
        };

        state.products.unshift(newProd);
        let localProducts = JSON.parse(localStorage.getItem('alradwan_local_products') || '[]');
        localProducts.unshift(newProd);
        localStorage.setItem('alradwan_local_products', JSON.stringify(localProducts));

        showSuccessToast('تم حفظ وإدراج السلعة بكتالوج الورش الفعلي مبروك! ✅');
      }

      toggleAddItemModal(false);
      renderView();
    }

    // --- CART DRAWER LOGIC ---
    function toggleCartDrawer(show) {
      const overlay = document.getElementById('cart-drawer-overlay');
      const container = document.getElementById('cart-drawer-container');
      
      if (show) {
        overlay.classList.remove('hidden');
        setTimeout(() => container.style.transform = 'translateX(0)', 50);
        renderCartItems();
      } else {
        container.style.transform = 'translateX(-100%)';
        setTimeout(() => overlay.classList.add('hidden'), 250);
      }
    }

    function addToCart(id) {
      const p = state.products.find(item => item.id === id);
      if (!p) return;

      const cartItem = state.cart.find(item => item.id === id);
      if (cartItem) {
        cartItem.quantity += 1;
      } else {
        state.cart.push({ id: p.id, name: p.name, price: p.sale_price || p.price, quantity: 1 });
      }

      localStorage.setItem('alradwan_cart', JSON.stringify(state.cart));
      updateCartCount();
      showSuccessToast('تمت إضافة ' + p.name + ' بنجاح لسلة الطلبات ✅');
    }

    function removeFromCart(id) {
      state.cart = state.cart.filter(item => item.id !== id);
      localStorage.setItem('alradwan_cart', JSON.stringify(state.cart));
      updateCartCount();
      renderCartItems();
    }

    function changeCartItemQty(id, delta) {
      const cartItem = state.cart.find(item => item.id === id);
      if (cartItem) {
        cartItem.quantity += delta;
        if (cartItem.quantity <= 0) {
          removeFromCart(id);
          return;
        }
      }
      localStorage.setItem('alradwan_cart', JSON.stringify(state.cart));
      renderCartItems();
    }

    function updateCartCount() {
      const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
      const badge = document.getElementById('cart-count-badge');
      if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    function renderCartItems() {
      const itemsList = document.getElementById('cart-drawer-items');
      const paymentContainer = document.getElementById('cart-payment-methods');
      
      let cartSubtotal = 0;

      if (state.cart.length === 0) {
        itemsList.innerHTML = \`
          <div class="text-center py-20 flex flex-col items-center">
            <span class="text-5xl mb-3">🛒</span>
            <p class="text-xs text-gray-400 font-bold">السلة الإنشائية خالية تماماً، تصفح المواد أعلاه.</p>
          </div>
        \`;
        document.getElementById('cart-drawer-footer').classList.add('invisible');
        return;
      }

      document.getElementById('cart-drawer-footer').classList.remove('invisible');

      let itemsHtml = state.cart.map(item => {
        const totalItemPrice = item.price * item.quantity;
        cartSubtotal += totalItemPrice;
        
        return \`
          <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100/50 text-xs gap-3">
            <div class="flex-1">
              <span class="font-bold text-slate-900 block leading-tight mb-1">\${item.name}</span>
              <span class="text-amber-600 font-extrabold mono">\${totalItemPrice.toLocaleString()} ل.س</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button onclick="changeCartItemQty(\${item.id}, -1)" class="w-7 h-7 bg-white hover:bg-slate-100 rounded-lg border text-slate-700 transition flex items-center justify-center font-bold font-mono cursor-pointer">-</button>
              <span class="font-extrabold text-[#111827] mono px-1">\${item.quantity}</span>
              <button onclick="changeCartItemQty(\${item.id}, 1)" class="w-7 h-7 bg-white hover:bg-slate-100 rounded-lg border text-slate-700 transition flex items-center justify-center font-bold font-mono cursor-pointer">+</button>
            </div>

            <button onclick="removeFromCart(\${item.id})" class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        \`;
      }).join('');

      itemsList.innerHTML = itemsHtml;

      document.getElementById('cart-subtotal-text').innerText = cartSubtotal.toLocaleString() + ' ل.س';
      document.getElementById('cart-total-text').innerText = cartSubtotal.toLocaleString() + ' ل.س';

      // Load Payment option selection dynamically
      paymentContainer.innerHTML = state.payment_methods.map(pm => {
        return \`
          <label class="border p-2.5 rounded-xl cursor-pointer flex flex-col justify-between items-start text-[11px] bg-white hover:bg-amber-50/20 shadow-xs relative">
            <input type="radio" name="payment-method-group" value="\${pm.id}" class="absolute top-2.5 left-2.5 accent-amber-500" checked>
            <div class="font-bold text-slate-950 flex items-center gap-1.5">
              <span>🏗️</span>
              <span>\${pm.name.split('-')[0]}</span>
            </div>
            <p class="text-[9px] text-gray-400 mt-1 line-clamp-2 leading-snug font-semibold">\&bull; \${pm.instructions.substring(0, 45)}...</p>
          </label>
        \`;
      }).join('');
    }

    function submitOrder() {
      const name = document.getElementById('order-customer-name').value;
      const phone = document.getElementById('order-customer-phone').value;
      const address = document.getElementById('order-customer-address').value;

      if (!name || !phone || !address) {
        showErrorToast('يرجى تدوين تفاصيل الهوية لتنسيق عملية الشحن الفوري والتنزيل');
        return;
      }

      const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newOrder = {
        id: Date.now(),
        order_number: 'RAD-' + Date.now().toString().substring(6),
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        total,
        created_at: Date.now()
      };

      // Persist locally for cloud demo durability structure
      let localOrders = JSON.parse(localStorage.getItem('alradwan_local_orders') || '[]');
      localOrders.unshift(newOrder);
      localStorage.setItem('alradwan_local_orders', JSON.stringify(localOrders));

      showSuccessToast('تمت صياغة فاتورتك رقم ' + newOrder.order_number + ' ومقاولونا باشروا عملية التحميل 🚚');
      
      // Empty cart
      state.cart = [];
      localStorage.removeItem('alradwan_cart');
      updateCartCount();
      toggleCartDrawer(false);

      if (state.user || state.admin) {
        navigate('me');
      }
    }

    // --- AI CHAT ASSISTANT DRAGGABLE CONSOLE SCRIPT ---
    function toggleAiAssistant(show) {
      const overlay = document.getElementById('ai-assistant-overlay');
      const drawer = document.getElementById('ai-assistant-drawer');

      if (show) {
        overlay.classList.remove('hidden');
        setTimeout(() => drawer.style.transform = 'translateX(0)', 50);
      } else {
        drawer.style.transform = 'translateX(-100%)';
        setTimeout(() => overlay.classList.add('hidden'), 250);
      }
    }

    function addAiMessage(role, text) {
      const messagesArea = document.getElementById('ai-messages-area');
      const bubbleStyle = role === 'bot' 
        ? 'bg-slate-100 text-[#111827] rounded-br-2xl rounded-tr-2xl rounded-tl-2xl' 
        : 'bg-slate-900 text-white rounded-bl-2xl rounded-tr-2xl rounded-tl-2xl self-end';

      const alignStyle = role === 'bot' ? 'justify-start' : 'justify-end';
      const icon = role === 'bot' 
        ? '<div class="w-6 h-6 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center shrink-0">🤖</div>' 
        : '<div class="w-6 h-6 bg-slate-950 text-white font-bold rounded-lg text-[10px] flex items-center justify-center shrink-0">👤</div>';

      const audioBtn = role === 'bot' ? \`
        <button onclick="speakLoudly(this, \\\`\${text}\\\`)" class="mt-2.5 text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-full font-bold flex items-center gap-1 cursor-pointer">
          <i class="fa-solid fa-volume-high"></i> اسمع اللحن الصوتي
        </button>
      \` : '';

      const wrap = \`
        <div class="flex items-start gap-2.5 \${alignStyle}">
          \${role === 'bot' ? icon : ''}
          <div class="\${bubbleStyle} p-3.5 max-w-[80%] text-xs leading-relaxed text-right border" dir="rtl">
            <div>\${text}</div>
            \${audioBtn}
          </div>
          \${role === 'user' ? icon : ''}
        </div>
      \`;

      messagesArea.insertAdjacentHTML('beforeend', wrap);
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    async function handleAiSend() {
      const input = document.getElementById('ai-user-input');
      const val = input.value.trim();
      if (!val) return;

      input.value = '';
      addAiMessage('user', val);

      // Loading bubble placeholder
      const loadId = 'bot-load-' + Date.now();
      const messagesArea = document.getElementById('ai-messages-area');
      const loaderHtml = \`
        <div id="\${loadId}" class="flex items-start gap-2.5 justify-start">
          <div class="w-6 h-6 bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] flex items-center justify-center shrink-0">🤖</div>
          <div class="bg-slate-100 text-[#111827] rounded-2xl p-3.5 max-w-[80%] text-xs leading-relaxed text-right border">
             <i class="fa-solid fa-circle-notch animate-spin text-amber-500"></i> جاري استخلاص الحساب الخرساني الذكي...
          </div>
        </div>
      \`;
      messagesArea.insertAdjacentHTML('beforeend', loaderHtml);
      messagesArea.scrollTop = messagesArea.scrollHeight;

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: val })
        }).then(r => r.json());

        // Remove loading block
        document.getElementById(loadId).remove();

        const reply = response.reply || 'لم أستطع تدارك هذا السؤال فستساعده خوادم المكاتب.';
        addAiMessage('bot', reply);
        
        // Auto Speak with Levant Arabic Synth voice
        speakLocalSynth(reply);
      } catch (err) {
        document.getElementById(loadId).remove();
        addAiMessage('bot', 'عفواً، واجهتني مشكلة فنية لتوليد المباشر. سأقوم بتوجيه حمولات التأسيس حال اتصالك.');
      }
    }

    function sendQuickAiPrompt(text) {
      document.getElementById('ai-user-input').value = text;
      handleAiSend();
    }

    // --- LOCAL WEBSPEECH ARABIC SYNTH FALLBACK ---
    function speakLoudly(btn, text) {
      speakLocalSynth(text);
      btn.innerHTML = '<i class="fa-solid fa-volume-high text-emerald-500"></i> جاري التلفظ الصوتي...';
      setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-volume-high"></i> اسمع اللحن الصوتي', 4000);
    }

    function speakLocalSynth(text) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Clean markdown structures
        const cleanText = text.replace(/[#\*_\`~]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'ar-SA';
        
        const voices = window.speechSynthesis.getVoices();
        const arVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
        
        // Choose best female voice or standard fallback
        const femaleVoice = arVoices.find(v => 
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('hoda') ||
          v.name.toLowerCase().includes('laila') ||
          v.name.toLowerCase().includes('google')
        ) || arVoices[0];

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        utterance.rate = 1.05;
        utterance.pitch = 1.15;
        window.speechSynthesis.speak(utterance);
      }
    }

    // --- INTEGRATED SPEECH CAPTATION (VOICE RECORDING) ---
    let recognizer = null;
    let micRecording = false;

    function toggleMic() {
      const micBtn = document.getElementById('mic-btn');
      
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showErrorToast('ميزة الإملاء الصوتي غير معتمدة على هذا المتصفح');
        return;
      }

      if (micRecording) {
        if (recognizer) recognizer.stop();
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognizer = new SpeechRecognition();
      recognizer.lang = 'ar-SA';
      recognizer.interimResults = false;
      recognizer.maxAlternatives = 1;

      recognizer.onstart = () => {
        micRecording = true;
        micBtn.innerHTML = '<i class="fa-solid fa-microphone text-red-500 animate-pulse text-sm"></i>';
        showToast('جاري السماع صوتاً لترجمة ورشة العمل... وتلفظ بنجاح', 'info');
      };

      recognizer.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById('ai-user-input').value = text;
        showSuccessToast('تم التقاط: ' + text);
        handleAiSend();
      };

      recognizer.onerror = () => {
        showErrorToast('تعذر رصد الصوت بنجاح، جرب الحديث مجدداً');
        resetMicUi();
      };

      recognizer.onend = () => {
        resetMicUi();
      };

      recognizer.start();
    }

    function resetMicUi() {
      micRecording = false;
      document.getElementById('mic-btn').innerHTML = '<i class="fa-solid fa-microphone text-sm"></i>';
    }

    // --- TOAST ALERTS BANNER SYSTEM ---
    function showToast(message, type = 'info') {
      const parent = document.getElementById('toast-container');
      const toastId = 'toast-' + Date.now();
      const styleBg = type === 'success' 
        ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
        : type === 'error' 
          ? 'bg-rose-50 border-rose-250 text-rose-800' 
          : 'bg-blue-50 border-blue-250 text-blue-800';

      const icon = type === 'success' 
        ? '<i class="fa-solid fa-circle-check text-emerald-600"></i>' 
        : type === 'error' 
          ? '<i class="fa-solid fa-circle-exclamation text-rose-600"></i>' 
          : '<i class="fa-solid fa-circle-info text-blue-600"></i>';

      const chunk = \`
        <div id="\${toastId}" class="\${styleBg} border p-4 rounded-xl shadow-md flex justify-between items-center text-xs font-bold transition-all duration-300 transform translate-x-[-100%]" dir="rtl">
          <div class="flex items-center gap-2">
            \${icon}
            <span>\${message}</span>
          </div>
          <button onclick="document.getElementById('\${toastId}').remove()" class="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 cursor-pointer">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      \`;

      parent.insertAdjacentHTML('beforeend', chunk);
      
      const el = document.getElementById(toastId);
      setTimeout(() => el.classList.remove('translate-x-[-100%]'), 10);
      setTimeout(() => {
        el.classList.add('translate-x-[-100%]', 'opacity-0');
        setTimeout(() => el.remove(), 300);
      }, 5000);
    }

    function showSuccessToast(msg) { showToast(msg, 'success'); }
    function showErrorToast(msg) { showToast(msg, 'error'); }

    // Start
    window.addEventListener('load', init);
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }
};



================================================================================
الملف: src/App.tsx
================================================================================

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { KycModal } from './components/KycModal';
import { AiAssistant } from './components/AiAssistant';
import { PublicProfileModal } from './components/PublicProfileModal';

// Views
import { HomeView } from './views/HomeView';
import { CategoriesView } from './views/CategoriesView';
import { AdsView } from './views/AdsView';
import { MeView } from './views/MeView';
import { AdminView } from './views/AdminView';

const MainLayout: React.FC = () => {
  const { currentView, isLoading, setView, settings, viewProfileUserId, setViewProfileUserId } = useApp();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const primaryColor = settings['theme_primary'] || '#f59e0b';
  const secondaryColor = settings['theme_secondary'] || '#0f172a';
  const accentColor = settings['theme_accent'] || '#d97706';

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onOpenCart={() => setIsCartOpen(true)} 
          />
        );
      case 'categories':
        return <CategoriesView />;
      case 'ads':
        return <AdsView />;
      case 'me':
        return <MeView />;
      case 'admin':
        return <AdminView />;
      default:
        return (
          <HomeView 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onOpenCart={() => setIsCartOpen(true)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      <style>{`
        :root {
          --color-primary: ${primaryColor};
          --color-secondary: ${secondaryColor};
          --color-accent: ${accentColor};
        }
        .bg-amber-500 { background-color: ${primaryColor} !important; }
        .hover\\:bg-amber-600:hover { background-color: ${accentColor} !important; }
        .text-amber-500 { color: ${primaryColor} !important; }
        .text-amber-600 { color: ${accentColor} !important; }
        .border-amber-500 { border-color: ${primaryColor} !important; }
        
        .bg-slate-900 { background-color: ${secondaryColor} !important; }
        .text-slate-900 { color: ${secondaryColor} !important; }
        .border-slate-900 { border-color: ${secondaryColor} !important; }

        .text-amber-800 { color: ${accentColor} !important; }
        .bg-amber-100 { background-color: ${primaryColor}1a !important; }
        .bg-amber-50 { background-color: ${primaryColor}10 !important; }
        .hover\\:text-amber-600:hover { color: ${accentColor} !important; }
        .accent-amber-500 { accent-color: ${primaryColor} !important; }
        
        /* Interactive text & button state overrides */
        .focus\\:ring-amber-500:focus { --tw-ring-color: ${primaryColor} !important; }
        .focus\\:border-amber-500:focus { border-color: ${primaryColor} !important; }
        .border-amber-200 { border-color: ${primaryColor}40 !important; }
        .hover\\:border-amber-500:hover { border-color: ${primaryColor} !important; }
        .hover\\:bg-amber-50:hover { background-color: ${primaryColor}08 !important; }
        .hover\\:bg-amber-500:hover { background-color: ${primaryColor} !important; }
      `}</style>

      {/* Dynamic Alert Banner / Header */}
      <Header 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenAuth={() => setIsAuthOpen(true)} 
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (currentView !== 'home') {
            setView('home');
          }
        }}
      />

      {/* Main Core View Area */}
      <main className="flex-1 pb-16 sm:pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
            <div className="w-11 h-11 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-sm text-gray-500 font-sans font-medium">جاري تحديث بيانات مركز الرضوان...</span>
          </div>
        ) : (
          renderActiveView()
        )}
      </main>

      {/* Footer Area */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-405 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-right font-sans shrink-0 relative z-20" dir="rtl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-extrabold text-white text-sm mb-3 text-amber-500">مركز الرضوان</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {settings['site_description'] || "مركز الرضوان لمواد البناء والأدوات الصحية والكهربائية. خدمة ممتازة وجودة مضمونة في غوطة دمشق وكافة المناطق."}
            </p>
          </div>
          
          <div>
            <h3 className="font-extrabold text-white text-sm mb-3">أقسام مفيدة</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setView('home')} className="hover:text-amber-500 text-slate-400 font-medium transition cursor-pointer">الرئيسية ومعرض المواد</button>
              </li>
              <li>
                <button onClick={() => setView('categories')} className="hover:text-amber-500 text-slate-400 font-medium transition cursor-pointer">الأقسام والفئات</button>
              </li>
              <li>
                <button onClick={() => setView('ads')} className="hover:text-amber-500 text-slate-400 font-medium transition cursor-pointer">الإعلانات المبوبة وسوق الأفراد</button>
              </li>
              <li>
                <button onClick={() => setView('me')} className="hover:text-amber-500 text-slate-400 font-medium transition cursor-pointer">الملف الشخصي وطلباتي</button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold text-white text-sm mb-3">تابعنا</h3>
            <p className="text-xs text-slate-400 mb-4">تواصل معنا وتابع آخر عروض ومواد البناء الإسمنتية والتأسيسية والصحية لكل المحافظات</p>
            <div className="flex gap-2.5 flex-wrap justify-start items-center">
              {settings['social_facebook'] && (
                <a href={settings['social_facebook']} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-55 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="فيسبوك">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              )}
              {settings['social_instagram'] && (
                <a href={settings['social_instagram']} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="انستغرام">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {settings['social_twitter'] && (
                <a href={settings['social_twitter']} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="تويتر X">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {settings['social_tiktok'] && (
                <a href={settings['social_tiktok']} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="تيك توك">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.93-1.72-.01 2.2-.01 4.39-.02 6.59-.18 3.55-2.52 6.94-6.13 7.82-3.17.82-6.72-.41-8.31-3.23-1.8-3.11-1.2-7.46 1.44-9.87 1.9-1.72 4.67-2.19 7.02-1.39V12.1c-1.21-.49-2.65-.24-3.58.68-.97.94-1.12 2.55-.38 3.65.73 1.12 2.13 1.63 3.42 1.29 1.12-.27 1.95-1.31 1.96-2.51V.02z"/>
                  </svg>
                </a>
              )}
              {settings['social_youtube'] && (
                <a href={settings['social_youtube']} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="يوتيوب">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163c-.272-1.016-1.07-1.815-2.086-2.087C19.565 3.545 12 3.545 12 3.545s-7.565 0-9.412.531c-1.016.272-1.815 1.071-2.087 2.087C0 8.01 0 12 0 12s0 3.99.531 5.837c.272 1.016 1.071 1.815 2.087 2.087 1.847.531 9.412.531 9.412.531s7.565 0 9.412-.531c1.016-.272 1.815-1.071 2.087-2.087C24 15.99 24 12 24 12s0-3.991-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {settings['social_whatsapp'] && (
                <a href={`https://wa.me/${settings['social_whatsapp'].replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-amber-55 hover:bg-amber-500 text-white hover:text-slate-950 flex items-center justify-center transition border border-slate-700/60" title="واتساب">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.53 1.982 14.05 1.01 11.43 1.01c-5.436 0-9.861 4.371-9.865 9.8-.001 1.944.512 3.842 1.49 5.509L1.93 22.17l5.903-1.53c.125-.03.203-.04.301-.027 1.582.49 2.825.26 4.303-.541zm12.355-6.241c-.27-.134-1.597-.788-1.845-.878-.247-.09-.427-.134-.607.134-.18.27-.697.877-.855 1.057-.156.18-.314.202-.584.067-.27-.135-1.14-.42-2.173-1.341-.803-.717-1.346-1.603-1.503-1.873-.157-.27-.017-.417.118-.551.121-.12.27-.315.405-.473.134-.157.18-.27.27-.45.09-.18.044-.337-.022-.472-.067-.135-.607-1.463-.832-1.995-.218-.528-.46-.456-.63-.465-.162-.008-.348-.01-.534-.01-.186 0-.49.07-.746.348-.256.277-.98.956-.98 2.333s1.002 2.707 1.142 2.898c.14.191 1.972 3.012 4.779 4.223.668.288 1.189.46 1.597.59.671.213 1.282.183 1.765.11.539-.08 1.597-.653 1.822-1.253.225-.6.225-1.114.157-1.223-.067-.11-.247-.202-.517-.336z"/>
                  </svg>
                </a>
              )}
              {(!settings['social_facebook'] && !settings['social_instagram'] && !settings['social_twitter'] && !settings['social_tiktok'] && !settings['social_youtube'] && !settings['social_whatsapp']) && (
                <span className="text-slate-550 text-xs italic">يرجى من الإدارة إضافة روابط شبكات التواصل الاجتماعي</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800/80 mt-10 pt-6 text-center text-[10px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings['site_name'] || "مركز الرضوان البنياني الموحد"}. جميع الحقوق محفوظة لجهة الإشراف.</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation bar */}
      <BottomNav />

      {/* Slide / Pop Overlays */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <KycModal />
      <AiAssistant />
      <Toast />

      {viewProfileUserId !== null && (
        <PublicProfileModal 
          userId={viewProfileUserId} 
          onClose={() => setViewProfileUserId(null)} 
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}



================================================================================
الملف: src/components/AddProductModal.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { X, Send, Plus, Camera, Video, Type, Link, MessageSquare } from 'lucide-react';

interface AddProductModalProps {
  onClose: () => void;
  productToEdit?: Product;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, productToEdit }) => {
  const { categories, fetchInitialData, showToast, user } = useApp();

  const isEditing = !!productToEdit;

  // Form states
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [price, setPrice] = useState<number>(productToEdit?.price || 0);
  const [salePrice, setSalePrice] = useState<number | null>(productToEdit?.sale_price || null);
  const [quantity, setQuantity] = useState<number>(productToEdit?.quantity !== undefined ? productToEdit.quantity : 10);
  const [whatsapp, setWhatsapp] = useState(productToEdit?.whatsapp || '');
  const [categoryId, setCategoryId] = useState<number>(productToEdit?.category_id || categories[0]?.id || 0);
  const [status, setStatus] = useState<'active' | 'hidden' | 'out_of_stock'>(productToEdit?.status || 'active');
  
  // Media selection: 'text' | 'image' | 'video'
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'video'>(
    productToEdit?.video_key || productToEdit?.video_url ? 'video' : productToEdit?.image_key ? 'image' : 'text'
  );
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    productToEdit?.image_key ? `/api/image/${productToEdit.image_key}` : null
  );

  // Video states
  const [videoSource, setVideoSource] = useState<'upload' | 'link'>(productToEdit?.video_key ? 'upload' : 'link');
  const [videoUrl, setVideoUrl] = useState(productToEdit?.video_url || '');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewName, setVideoPreviewName] = useState<string | null>(
    productToEdit?.video_key ? 'فيديو مرفوع سابقاً للتعديل' : null
  );

  const [submitting, setSubmitting] = useState(false);

  // Convert files to Base64 and upload to /api/image/upload
  const uploadBase64File = async (file: File, isVideo: boolean = false): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const pureBase64 = base64Data.split(',')[1];
        const mimeType = file.type;

        try {
          const res = await fetch('/api/image/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mimeType,
              image: pureBase64
            })
          });

          if (res.ok) {
            const data = await res.json();
            resolve(data.key);
          } else {
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('يرجى كتابة اسم أو عنوان المنتج أولاً', 'error');
      return;
    }

    if (price <= 0) {
      showToast('يرجى تحديد السعر الأساسي الموحد بقيمة أكبر من صفر', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let image_key: string | null = productToEdit?.image_key || null;
      let video_key: string | null = productToEdit?.video_key || null;
      let finalVideoUrl: string | null = productToEdit?.video_url || null;

      // Reset old values if media type changes
      if (mediaType === 'text') {
        image_key = null;
        video_key = null;
        finalVideoUrl = null;
      } else if (mediaType === 'image') {
        video_key = null;
        finalVideoUrl = null;
        if (imageFile) {
          image_key = await uploadBase64File(imageFile);
          if (!image_key) {
            showToast('فشل تحميل الصورة المرفقة، يرجى المحاولة بصورة أصغر حجمًا', 'error');
            setSubmitting(false);
            return;
          }
        }
      } else if (mediaType === 'video') {
        image_key = null;
        if (videoSource === 'upload' && videoFile) {
          video_key = await uploadBase64File(videoFile, true);
          finalVideoUrl = null;
          if (!video_key) {
            showToast('فشل تعميد وحفظ الفيديو المرفق بالخادم', 'error');
            setSubmitting(false);
            return;
          }
        } else if (videoSource === 'link' && videoUrl.trim()) {
          finalVideoUrl = videoUrl.trim();
          video_key = null;
        }
      }

      const postBody = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price) || 0,
        sale_price: salePrice ? Number(salePrice) : null,
        quantity: Number(quantity) >= 0 ? Number(quantity) : 0,
        category_id: Number(categoryId) || null,
        whatsapp: whatsapp.trim() || null,
        image_key,
        video_key,
        video_url: finalVideoUrl,
        status: status,
        user_id: productToEdit ? productToEdit.user_id : (user ? user.id : null),
        user_name: productToEdit ? productToEdit.user_name : (user ? user.name : 'ضيف'),
      };

      const endpoint = isEditing ? `/api/products/${productToEdit.id}` : '/api/products';
      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody)
      });

      if (res.ok) {
        showToast(
          isEditing 
            ? 'تم حفظ ومزامنة تعديل المادة بالكتالوج بنجاح! ✏️' 
            : 'تهانينا! تم إضافة ونشر منتجك الإنشائي الموحد بالمعرض بنجاح! 🥳', 
          'success'
        );
        fetchInitialData();
        onClose();
      } else {
        showToast('واجهنا صعوبة تقنية أثناء حفظ المادة بالخادم', 'error');
      }
    } catch {
      showToast('خطأ بالشبكة أثناء إرسال وتأكيد معلومات المادة', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewName(file.name);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-100 text-right font-sans" dir="rtl">
      <div className="bg-white rounded-3xl border border-gray-150 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                {isEditing ? 'تعديل بيانات المادة / المنتج' : 'ترشيح وإدراج منتج إنشائي جديد للكتالوج'}
              </h3>
              <p className="text-[10px] text-slate-300 mt-0.5">
                {isEditing ? 'قم بتحديث مواصفات المعروض ومستويات التسعير الحالية للمادة.' : 'شارك منتجاتك الإنشائية الموحدة وموادك مباشرة بالمعرض للعامة!'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs scrollbar-none">
          
          {/* General info */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">عنوان واسم المنتج الإنشائي الموحد *</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="عنوان واسم المنتج الإنشائي الموحد (مثال: أسمنت بورتلاندي مقاوم للرطوبة)"
              className="border border-gray-200 p-2.5 rounded-xl text-xs sm:text-sm bg-white focus:ring-1 focus:ring-amber-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">القسم والتصنيف التابع له المنتج *</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">الحالة التشغيلية للمنتج بالمعرض *</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as any)}
                className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
              >
                <option value="active">نشط معروض للعامة</option>
                <option value="hidden">مخفي مؤقتاً بالمعرض</option>
                <option value="out_of_stock">خارج المخزون / نفذت الكمية</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">السعر الأساسي الموحد *</label>
              <input 
                type="number" 
                required
                min="0"
                value={price || ''} 
                onChange={(e) => setPrice(Number(e.target.value))} 
                placeholder="السعر الأساسي"
                className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">سعر الحسم العرضي (اختياري)</label>
              <input 
                type="number" 
                value={salePrice || ''} 
                onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : null)} 
                placeholder="اتركه فارغاً إن لم يتوفر"
                className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">كميات المخزن المتاحة *</label>
              <input 
                type="number" 
                required
                min="0"
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                placeholder="كمية المخزن المتاحة"
                className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">رقم واتساب لوكيل مبيعات المادة (اختياري)</label>
            <div className="relative">
              <input 
                type="text" 
                value={whatsapp} 
                onChange={(e) => setWhatsapp(e.target.value)} 
                placeholder="مثال: 963955566778"
                className="border border-gray-200 p-2.5 pl-10 rounded-xl text-xs sm:text-sm bg-white focus:ring-1 focus:ring-amber-500 font-sans w-full"
              />
              <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-slate-700">شرح المادة ومواصفات التعبئة / الحزمة *</label>
            <textarea 
              rows={3}
              required
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="شرح المادة ومواصفات الحزمة / التعبئة والميزات بالتفصيل..."
              className="border border-gray-200 p-2.5 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans resize-none"
            />
          </div>

          {/* Media Type Tabs */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="font-bold text-slate-800">صورة المنتج أو فيديو أو نوع الإثبات المرفق:</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setMediaType('text')}
                className={`py-2 rounded-lg font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === 'text' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>منشور كتابي فقط</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`py-2 rounded-lg font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === 'image' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>إرفاق صورة</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`py-2 rounded-lg font-bold text-center flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  mediaType === 'video' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>إرفاق فيديو المعرض</span>
              </button>
            </div>
          </div>

          {/* Conditional Media Input Displays */}
          {mediaType === 'image' && (
            <div className="p-3 border border-dashed border-gray-200 bg-slate-50 rounded-xl flex flex-col items-center gap-2">
              <span className="font-bold text-slate-700 text-[10px]">صورة المنتج الفوتوغرافية المرفقة</span>
              <label className="bg-amber-500 hover:bg-amber-600 font-bold px-4 py-2 rounded-lg text-slate-950 transition cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <span>اختر ملف صورة المادة</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="hidden" 
                />
              </label>
              <div className="text-[10px] text-gray-500 font-bold">
                {imageFile ? `تم اختيار: ${imageFile.name}` : (productToEdit?.image_key ? 'توجد صورة مرفوعة مسبقاً' : 'لم يتم اختيار ملف بعد')}
              </div>
              {imagePreview && (
                <div className="mt-2 w-20 h-20 border rounded-lg overflow-hidden bg-white shadow-xs">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {mediaType === 'video' && (
            <div className="p-3.5 border border-dashed border-gray-200 bg-slate-50 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input 
                    type="radio" 
                    checked={videoSource === 'link'} 
                    onChange={() => setVideoSource('link')} 
                  />
                  <span>رابط فيديو (يوتيوب أو direct link)</span>
                </label>
                
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input 
                    type="radio" 
                    checked={videoSource === 'upload'} 
                    onChange={() => setVideoSource('upload')} 
                  />
                  <span>رفع ملف فيديو محلي لمركز الرضوان</span>
                </label>
              </div>

              {videoSource === 'link' ? (
                <div className="flex flex-col gap-1 w-full bg-white p-2 border rounded-lg shadow-sm">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Link className="w-3 h-3 text-amber-500" />
                    رابط الفيديو الإعلاني للمادة:
                  </span>
                  <input 
                    type="url" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="border border-transparent focus:outline-none p-1.5 text-xs w-full bg-transparent text-slate-800"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1.5">
                  <label className="bg-amber-500 hover:bg-amber-600 font-bold px-4 py-2 rounded-lg text-slate-950 transition cursor-pointer inline-flex items-center gap-1.5 shadow-xs">
                    <Video className="w-3.5 h-3.5" />
                    <span>اختر ملف الفيديو</span>
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleVideoChange}
                      className="hidden" 
                    />
                  </label>
                  {videoPreviewName ? (
                    <span className="text-[10px] text-emerald-600 font-bold max-w-full truncate">{videoPreviewName}</span>
                  ) : (
                    <span className="text-[9px] text-gray-400">لم يتم اختيار أي فيديو بعد (سيظهر للعامة فوراً)</span>
                  )}
                </div>
              )}
            </div>
          )}

        </form>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-gray-150 p-4 flex items-center justify-between">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-701 font-bold rounded-xl transition cursor-pointer"
          >
            إلغاء الأمر
          </button>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-slate-900 hover:bg-slate-950 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-500" />
            <span>{submitting ? 'جاري النشر والمزامنة...' : (isEditing ? 'حفظ التعديلات الحالية' : 'انشر بالمعرض الآن')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};



================================================================================
الملف: src/components/AiAssistant.tsx
================================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  Image as ImageIcon, 
  Loader2, 
  Trash2,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { aiSettings, showToast, products } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // File Upload states
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedImageMime, setAttachedImageMime] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Voice States
  const [isListening, setIsListening] = useState(false);
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const isContinuousVoiceRef = useRef(false);

  // Advanced Natural Speech Synthesis & Playback States
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [ttsAudioUrls, setTtsAudioUrls] = useState<Record<string, string>>({});
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<number>(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Helper Base64 to Blob parser
  const base64ToBlob = (base64: string, type: string) => {
    const binStr = window.atob(base64);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  };

  const handleSpeakWithNeuralTTS = async (msgId: string, text: string, directBase64?: string) => {
    // If we are currently playing this exact message, pause/stop it
    if (playingMsgId === msgId) {
      if (activeAudioRef.current) {
        if (!activeAudioRef.current.paused) {
          activeAudioRef.current.pause();
          setPlayingMsgId(null);
          return;
        } else {
          activeAudioRef.current.play().catch(console.error);
          setPlayingMsgId(msgId);
          return;
        }
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setPlayingMsgId(null);
          return;
        }
      }
    }

    // Stop and clean any currently active playbacks
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      let audioUrl = ttsAudioUrls[msgId] || "";

      if (directBase64) {
        if (!audioUrl) {
          const audioBlob = base64ToBlob(directBase64, "audio/mp3");
          audioUrl = URL.createObjectURL(audioBlob);
          setTtsAudioUrls(prev => ({ ...prev, [msgId]: audioUrl }));
        }
      } else if (!audioUrl) {
        showToast("جاري الاستعانة بالذكاء الاصطناعي لتوليد نبرة صوتية طبيعية ومرحبة...", "info");
        const res = await fetch("/api/ai/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "فشل توليد الصوت العصبي");
        }
        const data = await res.json();
        const audioBlob = base64ToBlob(data.audio, "audio/mp3");
        audioUrl = URL.createObjectURL(audioBlob);
        setTtsAudioUrls(prev => ({ ...prev, [msgId]: audioUrl }));
      }

      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;
      setPlayingMsgId(msgId);
      setAudioPlaybackProgress(0);

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setAudioPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlayingMsgId(null);
         setAudioPlaybackProgress(0);
        
        // If continuous hands-free mode is enabled, auto-trigger recording loop!
        if (isContinuousVoiceRef.current) {
          setTimeout(() => {
            triggerSpeechRecognitionAutomatically();
          }, 650);
        }
      };

      await audio.play();
    } catch (err: any) {
      console.warn("Neural TTS API fallback triggered due to quota context:", err);
      if (err.name === 'NotAllowedError' || err.message?.includes('NotAllowedError') || err.message?.includes('user didn\'t interact')) {
        showToast("يرجى الضغط على زر التشغيل يدويًا بالبطاقة للاستماع إلى الرد الصوتي 👇", "info");
        setPlayingMsgId(null);
      } else {
        // Safe and reliable fallback to local Arabic WebSpeech synthesis
        try {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();

            // Clean markdown syntax or links
            const cleanText = text
              .replace(/\[([^\]]+)\]\(PRODUCT_LINK_[^\)]+\)/g, '$1')
              .replace(/[#\*_`~]/g, '');

            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'ar-SA';

            const voices = window.speechSynthesis.getVoices();
            const arVoices = voices.filter(v => v.lang.toLowerCase().startsWith('ar'));
            
            // Look for high-capacity local synthesizers or default
            const femaleVoice = arVoices.find(v => 
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('hoda') ||
              v.name.toLowerCase().includes('laila') ||
              v.name.toLowerCase().includes('muna') ||
              v.name.toLowerCase().includes('google')
            ) || arVoices[0];

            if (femaleVoice) {
              utterance.voice = femaleVoice;
            }

            utterance.rate = 1.05;
            utterance.pitch = 1.25;

            setPlayingMsgId(msgId);
            setAudioPlaybackProgress(50); // Keep steady middle progress for representation

            utterance.onend = () => {
              setPlayingMsgId(null);
              setAudioPlaybackProgress(0);
              if (isContinuousVoiceRef.current) {
                setTimeout(() => {
                  triggerSpeechRecognitionAutomatically();
                }, 650);
              }
            };

            utterance.onerror = () => {
              setPlayingMsgId(null);
              setAudioPlaybackProgress(0);
            };

            window.speechSynthesis.speak(utterance);
            showToast("تنبيه: تم تحويل الرد إلى القارئ المدمج للمتصفح لتجاوز عبء القنوات الذكية.", "info");
          } else {
            showToast(`ملاحظة: اضغط على زر "اسمع" يدوياً لتشغيل الملف الصوتي المتزن: ${err.message || ''}`, "info");
            setPlayingMsgId(null);
          }
        } catch (fallbackErr) {
          console.error("Local client synthesis fallback failure:", fallbackErr);
          setPlayingMsgId(null);
        }
      }
    }
  };

  // Stop playback when the widget is closed
  useEffect(() => {
    if (!isOpen && activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
      setPlayingMsgId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    isContinuousVoiceRef.current = isContinuousVoice;
  }, [isContinuousVoice]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aiSettings) {
      setIsReady(Number(aiSettings.is_enabled) !== 0);
    }
  }, [aiSettings]);

  // Set default initial greeting
  useEffect(() => {
    if (messages.length === 0 && aiSettings) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          parts: [{ text: aiSettings.welcome_message || 'مرحباً بك! أنا مساعدك الذكي لمواد البناء ومركز الرضوان. كيف يمكنني إرشادك اليوم؟' }],
          timestamp: Date.now()
        }
      ]);
    }
  }, [aiSettings, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isReady) return null;

  // Handle Image Upload Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        showToast('حجم الصورة كبير جداً، يرجى اختيار ملف يقل حجمه عن 4 ميجابايت', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Strip out mime prefix for standard inlineParts
        const actualBase64 = base64String.split(',')[1];
        setAttachedImageBase64(actualBase64);
        setAttachedImageMime(file.type);
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger webkitSpeechRecognition API
  const handleSpeechInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('ميزة الإملاء الصوتي غير مدعومة في متصفحك الحالي. يرجى استخدام جوجل كروم أو سفاري.', 'info');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error:', e);
        setIsListening(false);
        showToast('تعذر التقاط الصوت، الرجاء التأكد من صلاحيات الميكروفون', 'error');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Trigger speech recognition recursively for hands-free mode
  const triggerSpeechRecognitionAutomatically = () => {
    if (isListening) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          // Auto send!
          handleSendMessageWithDirectText(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  // Text to Speech synthesis fallback reader with hands-free support
  const handleSpeakText = (text: string, forceAsContinuous: boolean = false) => {
    handleSpeakWithNeuralTTS("instant", text);
  };

  // Direct Text Message Submitter for Voice continuous mode
  const handleSendMessageWithDirectText = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setLoading(true);

    const userMsg = {
      id: `user-voice-${Date.now()}`,
      role: 'user',
      parts: [{ text: textToSend }],
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);

    const backendHistory = messages.map(m => ({
      role: m.role,
      parts: m.parts
    }));

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: backendHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشلت معالجة الطلب');
      }

      const raw = await response.json();
      const reply = raw.reply || '';

      const newMsg = {
        id: `ai-${Date.now()}`,
        role: 'model',
        parts: [{ text: reply }],
        timestamp: Date.now(),
        audioBase64: raw.audioBase64,
        audioMimeType: raw.audioMimeType,
        audioFilename: raw.audioFilename
      };

      setMessages((prev) => [...prev, newMsg]);

      // Speak reply automatically with the high-fidelity neural synthesizer
      if (raw.audioBase64) {
        setTimeout(() => {
          handleSpeakWithNeuralTTS(newMsg.id, reply, raw.audioBase64);
        }, 200);
      } else {
        handleSpeakWithNeuralTTS(newMsg.id, reply);
      }

    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          role: 'model',
          parts: [{ text: `⚠️ عذراً، خطأ بالخلفية الذكية للحديث: ${error.message}` }],
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle message sending payload formulations
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedImageBase64) return;

    const userText = inputText;
    setInputText('');
    setLoading(true);

    // Form user message log item
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      parts: [{ text: userText }],
      imagePreview: previewUrl,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMsg]);
    
    // Clear attachment state
    setAttachedImageBase64(null);
    setAttachedImageMime(null);
    setPreviewUrl(null);

    // Build Chat history to attach in Gemini query
    const backendHistory = messages.map(m => ({
      role: m.role,
      parts: m.parts
    }));

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userText,
          imageBase64: attachedImageBase64 || undefined,
          imageMimeType: attachedImageMime || undefined,
          chatHistory: backendHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'فشلت معالجة الطلب');
      }

      const raw = await response.json();
      const reply = raw.reply || '';

      const newMsg = {
        id: `ai-${Date.now()}`,
        role: 'model',
        parts: [{ text: reply }],
        timestamp: Date.now(),
        audioBase64: raw.audioBase64,
        audioMimeType: raw.audioMimeType,
        audioFilename: raw.audioFilename
      };

      setMessages((prev) => [...prev, newMsg]);

      // If support trigger with audio is returned or hands-free is on
      if (raw.audioBase64) {
        setTimeout(() => {
          handleSpeakWithNeuralTTS(newMsg.id, reply, raw.audioBase64);
        }, 200);
      } else if (isContinuousVoiceRef.current) {
        handleSpeakWithNeuralTTS(newMsg.id, reply);
      }
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-error-${Date.now()}`,
          role: 'model',
          parts: [{ text: `⚠️ عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي: ${error.message}. يرجى المحاولة لاحقاً.` }],
          timestamp: Date.now()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render text containing product token links like [اسم ليرت](/product/id)
  const renderMessageContent = (text: string) => {
    if (!text) return null;

    // Use regex to locate PRODUCT_LINK_ID patterns
    const partsArray = [];
    let lastIndex = 0;
    
    // Match Markdown-like links with custom PRODUCT_LINK_ID
    const regex = /\[([^\]]+)\]\(PRODUCT_LINK_(\d+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const textMatch = match[1];
      const productId = Number(match[2]);
      const matchIndex = match.index;

      // Add preceding plain text
      if (matchIndex > lastIndex) {
        partsArray.push({
          type: 'text',
          value: text.substring(lastIndex, matchIndex)
        });
      }

      // Add Interactive Product Token
      partsArray.push({
        type: 'product_link',
        id: productId,
        label: textMatch
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      partsArray.push({
        type: 'text',
        value: text.substring(lastIndex)
      });
    }

    if (partsArray.length === 0) {
      return <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">{text}</p>;
    }

    return (
      <div className="leading-relaxed whitespace-pre-line text-xs sm:text-sm">
        {partsArray.map((part, index) => {
          if (part.type === 'product_link') {
            const product = products.find(p => p.id === part.id);
            return (
              <span key={index} className="inline-block mx-1">
                <button
                  onClick={() => {
                    // Quick alert or search navigation, or toggle visual quick view!
                    showToast(`جاري استعراض مواصفات منتج: ${part.label || ''}`, 'success');
                    // We can jump search query to exactly match product or trigger a global event
                    const searchInput = document.getElementById('catalog-search-input') as HTMLInputElement;
                    if (searchInput) {
                      searchInput.value = product?.name || part.label;
                      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-amber-300 transition shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>{part.label}</span>
                  {product?.price && <span className="text-[10px] text-amber-800">({product.price.toLocaleString()} ل.س)</span>}
                </button>
              </span>
            );
          }
          return <span key={index}>{part.value}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="font-sans" dir="rtl">
      {/* Dynamic Bouncy Floating bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 left-6 sm:bottom-8 sm:left-8 z-40 w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 animate-bounce-slow border-2 border-white"
        title="مستشارك الإنشائي الذكي"
      >
        {isOpen ? <X className="w-6 h-6 animate-pulse" /> : <Bot className="w-6.5 h-6.5" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-950 border border-white"></span>
          </span>
        )}
      </button>

      {/* Main AI Chat Panel */}
      {isOpen && (
        <div 
          className={`fixed z-50 bg-white flex flex-col shadow-2xl transition-all duration-300 border border-gray-150
            ${window.innerWidth < 640 
              ? 'inset-0 w-full h-full rounded-none animate-slide-up' 
              : 'bottom-24 left-8 w-[380px] h-[550px] rounded-2xl animate-fade-in'}`}
        >
          {/* Panel Header */}
          <div className="px-5 py-4 bg-gradient-to-l from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between rounded-t-none sm:rounded-t-2xl shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>مستشار الرضوان الذكي</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                </h3>
                <span className="text-[10px] text-slate-300 block">مدرب على رصد الكميات وأسعار مواد البناء</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const nextVal = !isContinuousVoice;
                  setIsContinuousVoice(nextVal);
                  if (nextVal) {
                    showToast("تم تفعيل ميزة التكلم المستمر التلقائي اللاسلكي 🎙️", "success");
                    handleSpeakText("تم تفعيل وضع التحدث المستمر اللاسلكي. تفضل أنا بانتظارك!");
                  } else {
                    showToast("تم إيقاف ميزة التغذية الصوتية المستمرة", "info");
                    if ('speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }
                }}
                className={`p-1 px-2.5 rounded-xl transition flex items-center gap-1 text-[10px] font-black tracking-tight shrink-0 ${
                  isContinuousVoice 
                    ? 'bg-amber-500 text-slate-950 animate-pulse border border-amber-400' 
                    : 'bg-white/10 text-slate-300 hover:bg-white/15 border border-white/5'
                }`}
                title="تفعيل التكلم المستمر اللاسلكي تلقائياً"
              >
                <Mic className="w-3 h-3" />
                <span>لاسلكي مستمر</span>
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full transition shrink-0"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Assistant messages core */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/70 flex flex-col gap-3.5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[85%] ${isUser ? 'mr-auto items-start' : 'ml-auto items-end text-right'}`}
                >
                  {/* Photo attachment preview if any */}
                  {msg.imagePreview && (
                    <div className="mb-1 rounded-xl border border-gray-200 overflow-hidden max-w-[120px] bg-white">
                      <img src={msg.imagePreview} alt="Attached input" className="w-full h-auto" />
                    </div>
                  )}

                  <div 
                    className={`p-3 rounded-2xl ${
                      isUser 
                        ? 'bg-amber-500 text-white rounded-tl-none font-medium' 
                        : 'bg-white border border-gray-150 text-slate-900 rounded-tr-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed">{msg.parts[0].text}</p>
                    ) : (
                      renderMessageContent(msg.parts[0].text)
                    )}
                  </div>

                  {/* High fidelity custom audio player & waveform widget */}
                  {(playingMsgId === msg.id || msg.audioBase64) && (
                    <div className="mt-2 text-right bg-slate-900 border border-slate-750 text-slate-100 p-2.5 rounded-xl flex flex-col gap-1.5 w-full max-w-[280px]">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSpeakWithNeuralTTS(msg.id, msg.parts[0].text, msg.audioBase64)}
                          className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 p-2 rounded-lg transition shrink-0"
                          title={playingMsgId === msg.id ? "إيقاف مؤقت" : "تشغيل الصوت الموجه"}
                        >
                          {playingMsgId === msg.id ? <Pause className="w-3.5 h-3.5 fill-slate-950 text-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />}
                        </button>
                        
                        <div className="flex-1 flex flex-col justify-center">
                          {/* Animated bouncing voice waveforms */}
                          <div className="flex items-end gap-0.5 h-3.5 pb-0.5 justify-start pl-2">
                            {[1.2, 2.4, 1.8, 0.8, 2.2, 1.5, 2.9, 0.5, 1.9, 2.5, 1.2, 2.0].map((val, bIdx) => (
                              <span 
                                key={bIdx}
                                style={{ 
                                  height: `${playingMsgId === msg.id ? val * 100 : 25}%`,
                                  transition: 'height 0.15s ease-in-out'
                                }}
                                className={`w-0.5 rounded-sm ${playingMsgId === msg.id ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[8px] text-slate-400 font-mono">
                            {msg.audioBase64 ? "🎙️ تسجيل المشرف المباشر" : "✨ نبرة الذكاء الاصطناعي الفائقة"}
                          </span>
                        </div>
                      </div>

                      {/* Precise progress engine */}
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-100"
                          style={{ width: `${playingMsgId === msg.id ? audioPlaybackProgress : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Micro speech trigger and timestamps */}
                  <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-gray-400">
                    <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && (
                      <button 
                        onClick={() => handleSpeakWithNeuralTTS(msg.id, msg.parts[0].text, msg.audioBase64)}
                        className={`hover:text-amber-800 flex items-center gap-0.5 font-bold transition ${
                          playingMsgId === msg.id ? 'text-amber-500 font-black animate-pulse' : 'text-slate-500 hover:text-slate-700'
                        }`}
                        title="قراءة صوتية"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{playingMsgId === msg.id ? "إيقاف الصوت ⏸️" : "اسمع كامل الرد 🔊"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full border border-gray-150 shadow-xs ml-auto text-slate-500 text-xs sm:text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>جاري صياغة حساب الكميات والأجوبة...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image preview strip if any */}
          {previewUrl && (
            <div className="px-4 py-2 bg-amber-50/50 border-t border-amber-55 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <img src={previewUrl} alt="Preview input attachment" className="w-10 h-10 object-contain rounded-lg border bg-white" />
                <span className="text-[10px] text-slate-500">تم إرفاق صورة للتحليل الإنشائي</span>
              </div>
              <button 
                onClick={() => {
                  setAttachedImageBase64(null);
                  setAttachedImageMime(null);
                  setPreviewUrl(null);
                }}
                className="text-red-500 hover:bg-red-50 p-1 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Panel Footer input triggers */}
          <form 
            onSubmit={handleSendMessage}
            className="p-3 border-t border-gray-100 flex items-center gap-1.5 shrink-0 bg-white"
          >
            {/* hidden file select */}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden" 
            />

            {/* Select Image attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-slate-50 border border-gray-150 rounded-xl text-gray-400 hover:text-amber-600 transition"
              title="إرفاق صورة للذكاء الاصطناعي"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Speech microphone dictation */}
            <button
              type="button"
              onClick={handleSpeechInput}
              className={`p-2 border rounded-xl transition ${
                isListening 
                  ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                  : 'bg-slate-50 border-gray-150 text-gray-400 hover:text-amber-600'
              }`}
              title="تكلم للإملاء الفوري"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Core Text Input */}
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? 'جاري الاستماع لصوتك...' : 'اسألني عن أسعار الحديد، الإسمنت، الدهان...'}
              className="flex-1 py-2 px-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-amber-500"
              disabled={loading}
            />

            {/* Submit command action */}
            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !attachedImageBase64)}
              className="p-2 bg-slate-900 border border-slate-900 text-white rounded-xl hover:bg-amber-500 hover:border-amber-500 disabled:bg-slate-300 disabled:border-slate-300 transition"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};



================================================================================
الملف: src/components/AuthModal.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, User, Lock, Mail, ChevronRight, Laptop } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser, setAdmin, showToast, setView } = useApp();
  
  const [activeTab, setActiveTab] = useState<'user_login' | 'user_register' | 'admin_login'>('user_login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleClickCount, setTitleClickCount] = useState(0);

  const handleTitleClick = () => {
    setTitleClickCount((prev) => {
      const next = prev + 1;
      if (next === 5) {
        showToast('تم إظهار قسم الإدارة بشكل يدوي 🛡️', 'info');
      }
      return next;
    });
  };

  const showAdminTab = titleClickCount >= 5 || email.toLowerCase().trim() === 'm@gmail.gom' || email.toLowerCase().trim() === 'm@gmail.com';

  if (!isOpen) return null;

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('يرجى كتابة البريد الإلكتروني وكلمة المرور', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        
        // Dynamic administrative escalation check
        if (u.isAdmin && u.adminProfile) {
          setAdmin(u.adminProfile);
          setView('admin');
          showToast(`أهلاً بك حضرة المشرف ${u.name}!`, 'success');
        } else {
          showToast(`مرحباً بعودتك يا ${u.name}!`, 'success');
        }
        onClose();
      } else {
        const err = await res.json().catch(() => ({ error: 'فشل تسجيل الدخول' }));
        showToast(err.error || 'عذراً، البريد أو كلمة المرور غير صحيحة', 'error');
      }
    } catch {
      showToast('خطأ فني في بروتوكول الأمان، حاول ثانية', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('يرجى ملء جميع الحقول الضرورية للتسجيل', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (res.ok) {
        const u = await res.json();
        setUser(u);
        showToast(`أهلاً بك يا ${u.name}! تم إنشاء حسابك بنجاح`, 'success');
        onClose();
      } else {
        const err = await res.json().catch(() => ({ error: 'فشل التسجيل' }));
        showToast(err.error || 'عذراً، البريد الإلكتروني مسجل مسبقاً', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالشبكة، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('يرجى إدخال بيانات المرور الخاصة بالإدارة', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const a = await res.json();
        setAdmin(a);
        setView('admin');
        showToast(`تم الولوج للوحة التحكم كـ ${a.name}`, 'success');
        onClose();
      } else {
        const err = await res.json().catch(() => ({ error: 'فشل دخول الإدارة' }));
        showToast(err.error || 'غير مصرح لك بالدخول، يرجى مراجعة الإدارة العليا', 'error');
      }
    } catch {
      showToast('فشل اتصال خادم الإدارة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-150 animate-popup">
        
        {/* Header decoration */}
        <div className="bg-slate-900 text-white px-6 py-6 flex items-center justify-between select-none">
          <div>
            <h3 
              onClick={handleTitleClick}
              className="font-extrabold text-lg text-amber-500 cursor-pointer select-none"
              title="انقر لتفعيل واجهة الدخول للمشرفين"
            >
              حساب مركز الرضوان
            </h3>
            <p className="text-[11px] text-slate-300 mt-1">سجل الآن لنشر الإعلانات ومتابعة سلة مشترياتك</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className={`grid ${showAdminTab ? 'grid-cols-3' : 'grid-cols-2'} border-b border-gray-100 bg-slate-50 text-xs font-semibold text-slate-600`}>
          <button 
            type="button"
            onClick={() => setActiveTab('user_login')}
            className={`py-3.5 text-center border-b-2 transition ${
              activeTab === 'user_login' ? 'border-amber-500 text-amber-600 bg-white font-bold' : 'border-transparent hover:bg-slate-100/50'
            }`}
          >
            تسجيل دخول
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('user_register')}
            className={`py-3.5 text-center border-b-2 transition ${
              activeTab === 'user_register' ? 'border-amber-500 text-amber-600 bg-white font-bold' : 'border-transparent hover:bg-slate-100/50'
            }`}
          >
            حساب جديد
          </button>

          {showAdminTab && (
            <button 
              type="button"
              onClick={() => setActiveTab('admin_login')}
              className={`py-3.5 text-center border-b-2 transition ${
                activeTab === 'admin_login' ? 'border-amber-500 text-amber-600 bg-white font-bold text-amber-600' : 'border-transparent hover:bg-slate-100/50'
              }`}
            >
              مشرفي النظام
            </button>
          )}
        </div>

        {/* Tab Forms */}
        <div className="p-6">
          {activeTab === 'user_login' && (
            <form onSubmit={handleUserLogin} className="flex flex-col gap-4 text-right">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-4 py-2 border border-gray-255 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-2 border border-gray-255 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>دخول للحساب</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'user_register' && (
            <form onSubmit={handleUserRegister} className="flex flex-col gap-4 text-right">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">الاسم الكامل</label>
                <div className="relative">
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="حسن الأيوبي"
                    className="w-full pr-10 pl-4 py-2 border border-gray-255 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-4 py-2 border border-gray-255 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">كلمة المرور السرية</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="مثال: لا تقل عن 6 أحرف"
                    className="w-full pr-10 pl-4 py-2 border border-gray-255 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <span>إنشاء وتأسيس الحساب</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {activeTab === 'admin_login' && (
            <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-right">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-amber-700">البريد الإداري الداخلي</label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-amber-600/80" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@alradwan.com"
                    className="w-full pr-10 pl-4 py-2 border border-amber-200 bg-amber-50/5/30 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-amber-700">رمز المرور الأمني</label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-amber-600/80" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-2 border border-amber-200 bg-amber-50/5/30 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
              >
                <Laptop className="w-4 h-4" />
                <span>تسجيل دخول مشرف</span>
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};



================================================================================
الملف: src/components/BottomNav.tsx
================================================================================

import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, LayoutGrid, Heart, User, Settings2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setView, admin, favorites, user } = useApp();

  const isSupervisorAdmin = admin && (admin.email === 'm@gmail.com' || admin.email === 'm@gmail.gom' || user?.email === 'm@gmail.com' || user?.email === 'm@gmail.gom');

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-150 py-1.5 px-3 flex justify-around items-center shadow-lg font-sans">
      <button 
        onClick={() => setView('home')} 
        className={`flex flex-col items-center gap-0.5 min-w-[50px] ${
          currentView === 'home' ? 'text-amber-500 font-semibold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span className="text-[10px]">الرئيسية</span>
      </button>

      <button 
        onClick={() => setView('categories')} 
        className={`flex flex-col items-center gap-0.5 min-w-[50px] ${
          currentView === 'categories' ? 'text-amber-500 font-semibold' : 'text-slate-500'
        }`}
      >
        <LayoutGrid className="w-5.5 h-5.5" />
        <span className="text-[10px]">السوق</span>
      </button>

      <button 
        onClick={() => setView('ads')} 
        className={`flex flex-col items-center gap-0.5 min-w-[50px] ${
          currentView === 'ads' ? 'text-amber-500 font-semibold' : 'text-slate-500'
        }`}
      >
        <span className="relative">
          <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </span>
        <span className="text-[10px]">الإعلانات</span>
      </button>

      <button 
        onClick={() => setView('me')} 
        className={`flex flex-col items-center gap-0.5 min-w-[50px] ${
          currentView === 'me' ? 'text-amber-500 font-semibold' : 'text-slate-500'
        }`}
      >
        <span className="relative">
          <User className="w-5.5 h-5.5" />
          {favorites.length > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          )}
        </span>
        <span className="text-[10px]">حسابي</span>
      </button>

      {isSupervisorAdmin && currentView !== 'admin' && (
        <button 
          onClick={() => setView('admin')} 
          className={`flex flex-col items-center gap-0.5 min-w-[50px] ${
            currentView === 'admin' ? 'text-amber-500 font-semibold' : 'text-slate-500'
          }`}
        >
          <Settings2 className="w-5.5 h-5.5" />
          <span className="text-[10px]">الإدارة</span>
        </button>
      )}
    </nav>
  );
};



================================================================================
الملف: src/components/CartDrawer.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageSquare, Landmark } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    cart, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    settings, 
    showToast,
    user,
    paymentMethods 
  } = useApp();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment'>('cart');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | number>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currency = settings['currency'] || 'ل.س';
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const whatsappNumber = settings['whatsapp'] || '963900000000';

  const getPaymentMethodLabel = () => {
    if (selectedPaymentMethodId === 'cash') return 'الدفع نقداً عند التسليم';
    const found = paymentMethods.find(p => p.id === Number(selectedPaymentMethodId));
    if (found) {
      if (found.type === 'sham_cash') {
        return `شام كاش (حساب: ${found.account_number})`;
      } else if (found.type === 'crypto') {
        return `عملات رقمية (${found.currency_name} - شبكة ${found.network_name})`;
      }
      return found.name;
    }
    return 'غير محدد';
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      showToast('يجب ملء حقول الاسم والهاتف والعنوان لإتمام الطلب', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Structure order items
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.qty
      }));

      // Call API to register order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail: user?.email || 'guest@alradwan.com',
          customerPhone,
          customerAddress,
          items: orderItems,
          total: subtotal,
          notes: `${customerNotes} | طريقة الدفع: ${getPaymentMethodLabel()}`,
          paymentMethodId: selectedPaymentMethodId === 'cash' ? 1 : Number(selectedPaymentMethodId)
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit order to server');
      }

      const responseData = await res.json();
      const orderNumber = responseData.order_number || `ORD-${Date.now().toString().slice(-6)}`;

      // Construct descriptive whatsapp invoice text
      let itemsText = '';
      cart.forEach((item, index) => {
        itemsText += `${index + 1}. *${item.name}* (الكمية: ${item.qty} | السعر: ${item.price.toLocaleString()} ${currency})\n`;
      });

      const whatsappMessage = 
`🔔 *طلب شراء جديد من متجر مركز الرضوان الموحد*
---------------------------------------
*رقم الفاتورة:* #${orderNumber}
*اسم المشتري:* ${customerName}
*رقم الموبايل:* ${customerPhone}
*عنوان التوصيل:* ${customerAddress}
*طريقة الدفع المطلوب:* ${getPaymentMethodLabel()}
${customerNotes ? `*ملاحظات إضافية:* ${customerNotes}\n` : ''}
---------------------------------------
📦 *المنتجات المطلوبة:*
${itemsText}
---------------------------------------
💰 *المجموع النهائي الكلي:* *${subtotal.toLocaleString()} ${currency}*
---------------------------------------
شكراً لكم لتعاملكم مع مركز الرضوان لمواد البناء والأدوات الصحية.`;

      // Redirect user to whatsapp with formatted content
      const link = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      
      showToast('تم تسجيل طلبيتك بنجاح وجاري فتح الواتساب لإرسال الفاتورة للمركز', 'success');
      
      setTimeout(() => {
        window.open(link, '_blank');
        clearCart();
        setCheckoutStep('cart');
        setIsSubmitting(false);
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء رصد الطلب محلياً، تم التحويل للإرسال المباشر على واتساب', 'info');
      
      // Fallback direct WhatsApp formulation without API logging
      let itemsText = '';
      cart.forEach((item, index) => {
        itemsText += `${index + 1}. *${item.name}* (${item.qty} حبة x ${item.price.toLocaleString()} ${currency})\n`;
      });

      const whatsappMessage = 
`🔔 *طلب مباشر - متجر مركز الرضوان (خط الاحتياط)*
---------------------------------------
*اسم العميل:* ${customerName}
*الهاتف:* ${customerPhone}
*العنوان:* ${customerAddress}
*طريقة الدفع:* ${getPaymentMethodLabel()}
---------------------------------------
📦 *المواد المطلوبة:*
${itemsText}
*الإجمالي:* *${subtotal.toLocaleString()} ${currency}*`;

      const link = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(link, '_blank');
      clearCart();
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans" dir="rtl">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide drawer container */}
      <div className="absolute inset-y-0 left-0 max-w-lg w-full bg-white shadow-2xl flex flex-col h-full animate-slide-left border-r border-gray-150">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5.5 h-5.5 text-amber-500" />
            <h2 className="font-extrabold text-slate-900 text-lg">سلة المشتريات</h2>
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((a, c) => a + c.qty, 0)} مواد
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 text-gray-500 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CART STEP CONTENT */}
        {checkoutStep === 'cart' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">السلة فارغة تماماً</h3>
                <p className="text-xs text-gray-500 max-w-[280px]">
                  تصفح المنتجات وأضف ما ترغب بشراءه لتصوير فاتورة الإرسال
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 text-sm font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-amber-500 transition"
                >
                  العودة للتسوق
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-2xl border border-gray-150/50 hover:bg-slate-55 transition"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    {item.image_key && item.image_key !== 'placeholder' ? (
                      <img src={`/api/image/${item.image_key}`} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                    <span className="text-xs text-amber-600 font-semibold font-sans mt-0.5 block">
                      {(item.price * item.qty).toLocaleString()} {currency}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 border border-gray-200 bg-white rounded-xl px-1.5 py-1">
                    <button 
                      onClick={() => updateCartQty(item.id, item.qty - 1)}
                      className="p-1 hover:bg-slate-100 rounded text-gray-500 hover:text-slate-900 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold font-sans w-5 text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateCartQty(item.id, item.qty + 1)}
                      className="p-1 hover:bg-slate-100 rounded text-gray-500 hover:text-slate-900 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete Trigger */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition shrink-0"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* CUSTOMER DETAILS FORM STEP */}
        {checkoutStep === 'details' && (
          <form onSubmit={(e) => { e.preventDefault(); setCheckoutStep('payment'); }} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 text-right">
            <h3 className="font-extrabold text-slate-900 text-base mb-2">إدخال معلومات التوصيل</h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">الاسم الكامل المزدوج *</label>
              <input 
                type="text" 
                required 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value)} 
                placeholder="مثال: محمد الأطرش"
                className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.55">
              <label className="text-xs font-semibold text-slate-700">رقم الموبايل / واتساب للتواصل *</label>
              <input 
                type="tel" 
                required 
                value={customerPhone} 
                onChange={(e) => setCustomerPhone(e.target.value)} 
                placeholder="مثال: 0955566778"
                className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-amber-500"
              />
            </div>

            <div className="flex flex-col gap-1.55">
              <label className="text-xs font-semibold text-slate-700">عنوان موقع التوصيل الشرح بالتفصيل *</label>
              <textarea 
                required 
                rows={3}
                value={customerAddress} 
                onChange={(e) => setCustomerAddress(e.target.value)} 
                placeholder="المدينة، الشارع المتقاطع، بجوار صيدلية..."
                className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-amber-500 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.55">
              <label className="text-xs font-semibold text-slate-700">ملاحظات وطلبات خاصة (اختياري)</label>
              <textarea 
                rows={2}
                value={customerNotes} 
                onChange={(e) => setCustomerNotes(e.target.value)} 
                placeholder="أي توضيحات أو أوقات تسليم مفضلة..."
                className="w-full px-4 py-2.5 border border-gray-250 rounded-xl text-sm focus:outline-amber-500 resize-none"
              />
            </div>
            
            <button type="submit" className="hidden" id="submit-details-btn-hidden" />
          </form>
        )}

        {/* PAYMENT SELECTION STEP */}
        {checkoutStep === 'payment' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-right">
            <h3 className="font-extrabold text-slate-900 text-base mb-2">طريقة الدفع وإتمام الطلبية</h3>
            
            {/* Pay Method Options */}
            <div className="flex flex-col gap-3">
              <label 
                className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition ${
                  selectedPaymentMethodId === 'cash' ? 'border-amber-500 bg-amber-50/20' : 'border-gray-200 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedPaymentMethodId('cash')}
              >
                <input 
                  type="radio" 
                  name="payment_method" 
                  checked={selectedPaymentMethodId === 'cash'} 
                  onChange={() => setSelectedPaymentMethodId('cash')}
                  className="mt-1 accent-amber-500"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-slate-950 text-sm">نقدي (عند التسليم)</h4>
                  <p className="text-xs text-gray-500 mt-1">يتم تسليم قيمة الفاتورة نقداً للمندوب أو السائق فور تسليم الإسمنت ومواد البناء في العنوان.</p>
                </div>
              </label>

              {/* Dynamic DB Payment methods */}
              {paymentMethods.filter(p => p.is_active === 1).map((method) => {
                const isSelected = selectedPaymentMethodId === method.id;
                return (
                  <div key={method.id} className="flex flex-col gap-1.5">
                    <label 
                      className={`p-4 rounded-2xl border-2 flex items-start gap-4 cursor-pointer transition ${
                        isSelected ? 'border-amber-500 bg-amber-50/20' : 'border-gray-200 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedPaymentMethodId(method.id)}
                    >
                      <input 
                        type="radio" 
                        name="payment_method" 
                        checked={isSelected} 
                        onChange={() => setSelectedPaymentMethodId(method.id)}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-slate-600" />
                          <h4 className="font-bold text-slate-950 text-sm">{method.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {method.type === 'sham_cash' ? `حساب شام كاش برقم: ${method.account_number}` : `شبكة: ${method.network_name} | عملة: ${method.currency_name}`}
                        </p>
                      </div>
                    </label>

                    {/* Show transaction details inside dropdown pane */}
                    {isSelected && (
                      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-right text-xs text-slate-700 flex flex-col gap-2 mx-1 mt-1 animate-fadeIn">
                        <h5 className="font-bold text-amber-950 text-sm mb-1">تفاصيل تحويل واستلام الفواتير:</h5>
                        {method.account_name && <p><strong>اسم المستلم المعتمد:</strong> {method.account_name}</p>}
                        {method.account_number && <p><strong>رقم الحساب / المحفظة:</strong> <span className="font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-sm select-all">{method.account_number}</span></p>}
                        {method.network_name && <p><strong>الشبكة المعتمدة:</strong> {method.network_name}</p>}
                        {method.currency_name && <p><strong>العملة النشطة:</strong> {method.currency_name}</p>}
                        {method.wallet_address && (
                          <div className="flex flex-col gap-1 mt-1">
                            <strong>عنوان المحفظة الرقمية:</strong>
                            <span className="font-mono text-xs block bg-slate-150 p-2.5 rounded text-center break-all select-all font-semibold border border-slate-200 bg-slate-50">
                              {method.wallet_address}
                            </span>
                          </div>
                        )}
                        {method.instructions && <p className="leading-relaxed text-slate-600 mt-1"><strong>تعليمات السداد:</strong> {method.instructions}</p>}
                        
                        {method.qr_key && (
                          <div className="flex flex-col items-center mt-3 gap-1.5 border-t border-dashed border-amber-500/10 pt-3">
                            <span className="text-[10px] text-gray-400">امسح رمز الاستجابة السريع للتحويل المباشر</span>
                            <img 
                              src={`/api/image/${method.qr_key}`} 
                              alt="QR Code" 
                              referrerPolicy="no-referrer"
                              className="w-32 h-32 object-contain border border-gray-150/70 rounded-xl p-1.5 bg-white shadow-xs" 
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Drawer Footer Calculations */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-slate-50/50">
            <div className="flex justify-between items-center mb-5 font-sans">
              <span className="text-sm font-semibold text-slate-500">مجموع الطلبية</span>
              <span className="text-xl font-extrabold text-slate-900">
                {subtotal.toLocaleString()} {currency}
              </span>
            </div>

            {checkoutStep === 'cart' && (
              <button
                onClick={() => setCheckoutStep('details')}
                className="w-full bg-slate-905 h-12 bg-slate-900 hover:bg-amber-500 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition"
              >
                <span>متابعة إدخال بيانات التوصيل</span>
              </button>
            )}

            {checkoutStep === 'details' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="h-12 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  الرجوع للسلة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const formElement = document.getElementById('submit-details-btn-hidden');
                    if (formElement) formElement.click();
                  }}
                  className="h-12 bg-amber-500 text-white rounded-xl font-extrabold text-sm hover:bg-amber-600 transition"
                >
                  طريقة الدفع
                </button>
              </div>
            )}

            {checkoutStep === 'payment' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('details')}
                  className="h-12 bg-white border border-gray-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition"
                >
                  تعديل العنوان
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateOrder}
                  className="h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4.5 h-4.5" />
                  <span>تأكيد وإرسال واتساب</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};



================================================================================
الملف: src/components/Header.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VerifiedBadge } from './VerifiedBadge';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Heart, 
  LayoutGrid, 
  PlusSquare, 
  Settings2, 
  Home, 
  Phone,
  MessageSquare
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAuth: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenCart, 
  onOpenAuth, 
  searchQuery, 
  setSearchQuery 
}) => {
  const { 
    user, 
    admin, 
    cart, 
    favorites, 
    settings, 
    currentView, 
    setView 
  } = useApp();

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const waNumber = settings['whatsapp'] || '963900000000';
  const phoneCall = settings['phone'] || '0900000000';

  const isSupervisorAdmin = admin && (admin.email === 'm@gmail.com' || admin.email === 'm@gmail.gom' || user?.email === 'm@gmail.com' || user?.email === 'm@gmail.gom');

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm font-sans" dir="rtl">
      {/* Top bar with store contacts and simple alert */}
      <div className="w-full bg-slate-900 text-white text-xs py-2 px-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-4">
          <a 
            href={`https://wa.me/${waNumber.replace('+', '')}`} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1 hover:text-emerald-400 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>واتساب: {waNumber}</span>
          </a>
          <a 
            href={`tel:${phoneCall}`} 
            className="flex items-center gap-1 hover:text-blue-400 transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>اتصل بنا: {phoneCall}</span>
          </a>
        </div>
        <div className="hidden sm:block text-slate-300 font-medium font-sans">
          {settings['header_announcement'] || 'مرحباً بكم في متجر مركز الرضوان لمواد البناء المطور'}
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Logo/Brand */}
        <div 
          onClick={() => setView('home')} 
          className="cursor-pointer flex flex-col shrink-0"
        >
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 border-r-4 border-amber-500 pr-2 leading-none">
            {settings['site_name'] || 'مركز الرضوان'}
          </span>
          <span className="text-[10px] text-gray-500 pr-2 mt-1">لمواد البناء والأدوات</span>
        </div>

        {/* Search Bar - Center */}
        <div className="flex-1 max-w-xl relative hidden md:block">
          <input
            type="text"
            placeholder={settings['search_placeholder'] || 'البحث عن الاسمنت، الحديد، مواد الديكور...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-sans"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
        </div>

        {/* Action Triggers - Left */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Favorites */}
          <button 
            onClick={() => setView('me')} 
            className="p-2.5 hover:bg-gray-55 text-gray-700 rounded-full relative transition"
            title="المفضلة"
          >
            <Heart className={`w-5.5 h-5.5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button 
            onClick={onOpenCart} 
            className="p-2.5 hover:bg-gray-55 text-gray-700 rounded-full relative transition"
            title="سلة المشتريات"
          >
            <ShoppingCart className="w-5.5 h-5.5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          <button 
            onClick={user ? () => setView('me') : onOpenAuth} 
            className="flex items-center gap-2 p-1.5 hover:bg-gray-55 text-gray-700 rounded-full sm:rounded-xl transition"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-gray-200 overflow-hidden">
              {user?.avatar_key ? (
                <img src={`/api/image/${user.avatar_key}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4.5 h-4.5 text-slate-500" />
              )}
            </div>
            <span className="text-sm font-medium hidden sm:inline flex items-center gap-1 pr-1 truncate max-w-[150px]">
              {user ? user.name : 'حسابي'}
              {user && user.kycStatus === 'verified' && <VerifiedBadge size={14} className="mr-0.5" />}
            </span>
          </button>

          {/* Administrative Portal Indicator */}
          {isSupervisorAdmin && currentView !== 'admin' && (
            <button 
              onClick={() => setView('admin')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition text-xs font-sans font-medium ${
                currentView === 'admin' 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'bg-amber-50/50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">لوحة الإدارة</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links Row (Desktop Router Tab layout) */}
      <div className="w-full border-t border-gray-100 bg-gray-50 py-1 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center gap-1.5 text-sm font-sans font-medium text-slate-700">
          <button 
            onClick={() => setView('home')} 
            className={`px-4 py-2 rounded-lg transition ${
              currentView === 'home' 
              ? 'bg-amber-500 text-white' 
              : 'hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            الرئيسية
          </button>
          
          <button 
            onClick={() => setView('categories')} 
            className={`px-4 py-2 rounded-lg transition ${
              currentView === 'categories' 
              ? 'bg-amber-500 text-white' 
              : 'hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            أقسام المتجر
          </button>

          <button 
            onClick={() => setView('ads')} 
            className={`px-4 py-2 rounded-lg transition ${
              currentView === 'ads' 
              ? 'bg-amber-500 text-white' 
              : 'hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            سوق الإعلانات
          </button>

          <button 
            onClick={() => setView('me')} 
            className={`px-4 py-2 rounded-lg transition ${
              currentView === 'me' 
              ? 'bg-amber-500 text-white' 
              : 'hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            حسابي الشخصي
          </button>

          {/* Quick Admin Navigation Trigger for authorized admins */}
          {isSupervisorAdmin && currentView !== 'admin' && (
            <button 
              onClick={() => setView('admin')} 
              className={`px-4 py-2 rounded-lg transition ${
                currentView === 'admin' 
                ? 'bg-amber-500 text-white' 
                : 'hover:bg-amber-50 hover:text-amber-700 text-amber-700 border border-amber-200/50 bg-amber-50/20'
              }`}
            >
              إدارة النظام ({admin.role === 'super_admin' ? 'مدير عام' : 'محرر'})
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search - Show only on mobile screens */}
      <div className="px-4 py-2 pb-3 w-full md:hidden border-t border-gray-100 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={settings['search_placeholder'] || 'البحث عن المواد والأدوات...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs font-sans text-right"
          />
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>
    </header>
  );
};



================================================================================
الملف: src/components/HomeSlider.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HomeSlider: React.FC = () => {
  const { banners } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter only active slider type banners
  const sliderBanners = banners.filter(b => b.banner_type === 'slider' && b.is_active === 1);

  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

  if (sliderBanners.length === 0) {
    // Return a stylish fallback hero static slider
    return (
      <div className="w-full relative bg-slate-900 overflow-hidden py-14 sm:py-20 px-6 sm:px-12 flex flex-col items-center justify-center text-center font-sans border-b border-gray-150">
        {/* Abstract vector backgrounds */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        
        <span className="text-amber-500 text-xs sm:text-sm font-bold tracking-wider mb-2" dir="rtl">
          الرضوان للأدوات الصحية والمواد الإنشائية
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight max-w-2xl mb-4" dir="rtl">
          شريكك الموثوق لتأسيس وتشييد منزلك بأفضل الخامات
        </h1>
        <p className="text-slate-350 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed" dir="rtl">
          نقدم لكم كافة مستلزمات البناء من إسمنت، حديد، عوازل حرارية ومائية، بالإضافة إلى أحدث أطقم الأدوات الصحية بأسعار تنافسية.
        </p>
        <div className="flex gap-4">
          <button className="bg-amber-500 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition hover:bg-amber-600 shadow-lg">
            تصفح المنتجات المتوفرة
          </button>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length);
  };

  return (
    <div className="w-full relative bg-slate-100 overflow-hidden aspect-[21/9] sm:aspect-[24/8] max-h-[420px] font-sans">
      {/* Container holding current slide */}
      <div className="w-full h-full relative">
        {sliderBanners.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Slide Image */}
            <img
              src={`/api/image/${slide.image_key}`}
              alt={slide.title || 'Al Radwan slide'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Elegant glass overlay on the slide content */}
            <div className="absolute inset-0 bg-slate-950/40 flex flex-col justify-center px-10 sm:px-20 text-white text-right" dir="rtl">
              <div className="max-w-xl">
                {slide.title && (
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-2 drop-shadow-md">
                    {slide.title}
                  </h2>
                )}
                {slide.link && (
                  <a
                    href={slide.link}
                    className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow"
                  >
                    تسوّق العرض الآن
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nav Arrow triggers */}
      {sliderBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-xs text-white hover:bg-amber-500 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 backdrop-blur-xs text-white hover:bg-amber-500 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom pagination dots */}
      {sliderBanners.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {sliderBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentSlide ? 'bg-amber-500 w-6' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};



================================================================================
الملف: src/components/KycModal.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export const KycModal: React.FC = () => {
  const { showKycModal, setShowKycModal, user, setUser, showToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('سوريا');
  const [idType, setIdType] = useState('الهوية الوطنية');
  
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showKycModal || !user) return null;

  const countries = [
    "سوريا", "المملكة العربية السعودية", "الإمارات العربية المتحدة", "قطر", "مصر", 
    "الكويت", "الأردن", "لبنان", "العراق", "البحرين", "سلطنة عمان", "اليمن", 
    "تونس", "الجزائر", "المغرب", "ليبيا", "فلسطين", "السودان", "تركيا", "ألمانيا", "السويد"
  ];

  const compressImageBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot initialize context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isFront) {
        setIdFrontFile(file);
        try {
          const preview = await compressImageBase64(file);
          setIdFrontPreview(preview);
        } catch {
          setIdFrontPreview(URL.createObjectURL(file));
        }
      } else {
        setIdBackFile(file);
        try {
          const preview = await compressImageBase64(file);
          setIdBackPreview(preview);
        } catch {
          setIdBackPreview(URL.createObjectURL(file));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !country || !idType) {
      showToast('يرجى ملء جميع الحقول المطلوبة.', 'error');
      return;
    }

    if (!idFrontFile || !idBackFile) {
      showToast('يرجى التقاط ورفع صور وجه الهوية الأمامي والخلفي معاً.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Compress both front and back images to Base64 data strings for server insertion
      const frontBase64 = idFrontPreview || await compressImageBase64(idFrontFile);
      const backBase64 = idBackPreview || await compressImageBase64(idBackFile);

      const response = await fetch('/api/user/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          country,
          idType,
          idFrontImage: frontBase64,
          idBackImage: backBase64
        })
      });

      if (response.ok) {
        const result = await response.json();
        setUser(result.user);
        showToast('تم إرسال مستندات الهوية للتدقيق الدائم بنجاح.', 'success');
        setShowKycModal(false);
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'فشلت عملية إرسال الطلب، يرجى المحاولة لاحقاً', 'error');
      }
    } catch (err) {
      console.error('Error submitting KYC documents', err);
      showToast('حدث خطأ بالشبكة أثناء رفع البيانات.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto block" dir="rtl">
      {/* Backdrop blur safety */}
      <div 
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity" 
        onClick={() => !isSubmitting && setShowKycModal(false)} 
      />

      {/* Main modal container */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 my-8 animate-popup font-sans text-right">
        {/* Header bar banner */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center border border-amber-500/20">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-none">توثيق الحساب (KYC)</h3>
              <p className="text-[10px] text-slate-300 mt-1.5">نظام تدقيق الهوية الفوري الموثوق لتفعيل الميزات وعلامة التوثيق</p>
            </div>
          </div>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => setShowKycModal(false)}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          <div className="bg-amber-50/50 border border-amber-200/50 p-4 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
            📢 <strong>نظام الحماية:</strong> يرجى تزويدنا بصور واضحة ومقروءة للمستندات الشخصية الرسمية (الهوية الوطنية، جواز السفر أو رخصة القيادة). يتم معالجة البيانات وتشفيرها محلياً لحماية خصوصيتك التامة.
          </div>

          {/* Full Name input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">الاسم الكامل المطابق للهوية *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد عمار الفهد"
              className="w-full px-4 py-2 text-xs sm:text-sm border border-gray-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Country Dropdown selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">البلد / الإقامة الهندسية *</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-250 rounded-xl focus:outline-none bg-white font-sans focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* ID type Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">نوع المستند الشخصي *</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-250 rounded-xl focus:outline-none bg-white font-sans focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="الهوية الوطنية">الهوية الوطنية</option>
                <option value="جواز السفر">جواز السفر الرقمي</option>
                <option value="رخصة قيادة">رخصة قيادة سارية</option>
              </select>
            </div>
          </div>

          {/* Images Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
            {/* Front Image Uploader */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">وجه الهوية الأمامي *</label>
              <div className="relative border-2 border-dashed border-gray-250 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] hover:border-amber-400 bg-slate-50 transition cursor-pointer">
                {idFrontPreview ? (
                  <div className="relative w-full h-full min-h-[110px] flex flex-col items-center justify-center">
                    <img 
                      src={idFrontPreview} 
                      alt="Front preview" 
                      className="w-full max-h-[90px] object-cover rounded-lg shadow-sm" 
                    />
                    <span className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> تم الإرفاق
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-gray-500 py-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-700">انقر لرفع وجه الهوية</span>
                    <span className="text-[8px] text-slate-400 mt-1">PNG, JPG بحد أقصى 25MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            {/* Back Image Uploader */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700">وجه الهوية الخلفي *</label>
              <div className="relative border-2 border-dashed border-gray-250 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[140px] hover:border-amber-400 bg-slate-50 transition cursor-pointer">
                {idBackPreview ? (
                  <div className="relative w-full h-full min-h-[110px] flex flex-col items-center justify-center">
                    <img 
                      src={idBackPreview} 
                      alt="Back preview" 
                      className="w-full max-h-[90px] object-cover rounded-lg shadow-sm" 
                    />
                    <span className="text-[9px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> تم الإرفاق
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center text-gray-500 py-2">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-700">انقر لرفع ظهر الهوية</span>
                    <span className="text-[8px] text-slate-400 mt-1">PNG, JPG بحد أقصى 25MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 bg-slate-900 hover:bg-amber-500 disabled:bg-gray-300 text-white font-extrabold text-xs sm:text-sm py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>جاري تشفير ورفع ملفات التوثيق...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>إرسال للتدقيق والموافقة اللحظية</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};



================================================================================
الملف: src/components/ProductCard.tsx
================================================================================

import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, MessageSquare, Flame, Star, Edit, Trash2 } from 'lucide-react';
import { ProductReviewsModal } from './ProductReviewsModal';
import { AddProductModal } from './AddProductModal';
import { VerifiedBadge } from './VerifiedBadge';
import { ProductDetailsModal } from './ProductDetailsModal';

interface ProductCardProps {
  product: Product;
  onOpenCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenCart }) => {
  const { addToCart, toggleFavorite, favorites, settings, user, admin, fetchInitialData, showToast, currentView, setViewProfileUserId } = useApp();
  const [showReviews, setShowReviews] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isFavorite = favorites.includes(product.id);
  const outOfStock = product.status === 'out_of_stock' || product.quantity <= 0;
  
  // Checking ownership: either user owns this product or is admin
  const isOwnerOrAdmin = !!admin || (!!user && user.id === product.user_id);

  // Calculate discount percentage
  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - (product.sale_price as number)) / product.price) * 100) 
    : 0;

  const defaultWa = settings['whatsapp'] || '963900000000';
  const waCustom = product.whatsapp || defaultWa;
  const siteCurrency = settings['currency'] || 'ل.س';

  // Format price
  const formatCurrency = (val: number) => {
    return val.toLocaleString() + ' ' + siteCurrency;
  };

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `مرحباً مركز الرضوان، أود الاستفسار عن المنتج: *${product.name}* بقيمة ${product.sale_price ? formatCurrency(product.sale_price) : formatCurrency(product.price)}. هل هو متوفر حالياً؟`;
    const link = `https://wa.me/${waCustom.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  const handleDeleteProduct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً من الكتالوج؟")) {
      try {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast('تم حذف المنتج والإعلان بنجاح 🗑️', 'success');
          fetchInitialData();
        } else {
          showToast('واجهنا صعوبة تقنية أثناء طلب الحذف من الخوادم', 'error');
        }
      } catch {
        showToast('فشل حذف المادة بسبب انقطاع الشبكة', 'error');
      }
    }
  };

  return (
    <div 
      onClick={() => setShowDetails(true)}
      className="group relative bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full font-sans text-right cursor-pointer hover:border-amber-400" 
      dir="rtl"
    >
      {/* Badge container */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5 pointer-events-none">
        {hasDiscount && (
          <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
            <Flame className="w-2.5 h-2.5" />
            <span>حسم {discountPercent}%</span>
          </span>
        )}
        {outOfStock && (
          <span className="bg-gray-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
            خارج المخزون
          </span>
        )}
      </div>

      {/* Favorite Button */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(product.id);
        }}
        className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow hover:bg-white text-gray-500 hover:text-rose-500 transition"
      >
        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Media container (Reduced container height to h-44 to decrease physical scale by 15%) */}
      <div className="relative h-44 w-full bg-slate-50/50 overflow-hidden flex items-center justify-center p-2 border-b border-gray-100 group-hover:bg-slate-50 transition duration-300">
        {product.video_key || product.video_url ? (
          <div className="w-full h-full relative" onClick={(e) => e.stopPropagation()}>
            <video 
              controls
              muted
              playsInline
              preload="metadata"
              src={product.video_key ? `/api/image/${product.video_key}` : product.video_url || ''}
              poster={product.image_key ? `/api/image/${product.image_key}` : undefined}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : product.image_key ? (
          <img 
            src={`/api/image/${product.image_key}`} 
            alt={product.name} 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain w-auto h-auto rounded-lg shadow-2xs transition-all duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] text-gray-400 mt-1">لا تتوفر صورة للمادة</span>
          </div>
        )}
      </div>

      {/* Content wrapper */}
      <div className="p-3 flex flex-col flex-1 gap-1">
        <span className="text-[9px] font-black text-amber-600 tracking-wider">
          {product.category_name || 'مواد البناء الأساسية'}
        </span>
        <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition text-xs sm:text-sm line-clamp-1 leading-tight">
          {product.name}
        </h3>

        {/* Interactive Five Stars Rating Summary */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowReviews(true);
          }}
          className="flex items-center gap-1 py-0.5 px-1 rounded-md border border-transparent hover:border-gray-150 hover:bg-slate-50 transition self-start cursor-pointer"
          title="عرض التقييمات والتعليقات الموثقة للأعضاء"
        >
          <div className="flex gap-0.5" dir="ltr">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`w-3 h-3 ${s <= Math.round(product.rating_avg || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          {product.rating_count && product.rating_count > 0 ? (
            <span className="text-[9px] text-slate-600 font-bold font-mono">
              {product.rating_avg} ({product.rating_count})
            </span>
          ) : (
            <span className="text-[8px] text-gray-400 font-bold">بدون تقييم</span>
          )}
        </div>

        <p className="text-[10px] text-gray-500 line-clamp-2 min-h-[30px] leading-snug">
          {product.description || 'لم يتم كتابة وصف تفصيلي لهذه المادة المعروضة.'}
        </p>

        {/* Pricing Area */}
        <div className="mt-auto pt-1.5 flex items-baseline gap-1.5">
          {hasDiscount ? (
            <>
              <span className="text-sm sm:text-base font-extrabold text-rose-600 font-sans">
                {formatCurrency(product.sale_price as number)}
              </span>
              <span className="text-[10px] text-gray-300 line-through font-sans">
                {formatCurrency(product.price)}
              </span>
            </>
          ) : (
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-sans">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Publisher profile badge (displayed on main and categories views instead of edits) */}
        {((currentView !== 'me' && currentView !== 'admin') && (product.owner_id || product.creator_id || product.user_id)) ? (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              const publisherId = product.owner_id || product.creator_id || product.user_id;
              if (publisherId) {
                setViewProfileUserId(publisherId);
              }
            }}
            className="flex items-center gap-2 my-1.5 p-2 bg-slate-50/60 hover:bg-amber-50/40 rounded-xl border border-gray-100 cursor-pointer transition duration-200 group/avatar shrink-0 text-right"
            title="زيارة الملف الشخصي للناشر"
          >
            {/* Publisher Avatar */}
            <div className="w-7 h-7 rounded-lg bg-amber-100/75 border border-amber-200/50 flex items-center justify-center overflow-hidden shrink-0">
              {(product as any).user_avatar ? (
                <img 
                  src={`/api/image/${(product as any).user_avatar}`} 
                  alt={product.user_name || ''} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-[10px] text-amber-600 font-extrabold font-mono">
                  {(product.user_name || "م").substring(0, 1)}
                </span>
              )}
            </div>
            
            {/* Name and validation */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-800 truncate group-hover/avatar:text-amber-600 transition leading-none">
                  {product.user_name || "إشراف الرضوان"}
                </span>
                {((product as any).user_is_verified || (product as any).user_kycStatus === 'verified') && (
                  <VerifiedBadge size={12} className="mr-0.5 inline-block" />
                )}
              </div>
              <span className="text-[7px] text-gray-400 block mt-0.5 font-mono">تاريخ النشر: {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-SY') : 'حديثاً'}</span>
            </div>
          </div>
        ) : (
          /* Product Owner/Admin Edit & Delete actions (Only in Account Profile 'me' or 'admin' views) */
          isOwnerOrAdmin && (
            <div className="grid grid-cols-2 gap-1.5 my-1 pt-1.5 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-1 bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-[9px] font-extrabold rounded-lg cursor-pointer"
              >
                <Edit className="w-2.5 h-2.5 text-blue-600" />
                <span>تعديل المادة</span>
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="flex items-center justify-center gap-1 py-1.5 px-1 bg-rose-50 hover:bg-rose-100 text-rose-600 transition text-[9px] font-extrabold rounded-lg cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5 text-rose-600" />
                <span>إزالة نهائية</span>
              </button>
            </div>
          )
        )}

        {/* Action Triggers */}
        <div className="grid grid-cols-2 gap-1.5 mt-1 pt-0.5">
          {/* Add to Cart */}
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addToCart(product)}
            className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg font-bold text-[10px] sm:text-xs transition ${
              outOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-amber-500 text-white hover:bg-amber-600 hover:shadow-2xs'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>السلة</span>
          </button>

          {/* Quick Buy via WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] sm:text-xs transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>واتساب</span>
          </button>
        </div>
      </div>

      {showReviews && (
        <ProductReviewsModal 
          product={product} 
          onClose={() => setShowReviews(false)} 
        />
      )}

      {showDetails && (
        <ProductDetailsModal
          product={product}
          onClose={() => setShowDetails(false)}
          onOpenCart={onOpenCart}
        />
      )}

      {isEditing && (
        <AddProductModal 
          productToEdit={product}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};



================================================================================
الملف: src/components/ProductDetailsModal.tsx
================================================================================

import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShoppingCart, 
  MessageSquare, 
  Flame, 
  Star, 
  Eye, 
  User, 
  Calendar, 
  Package, 
  Share2, 
  ArrowLeft 
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose, onOpenCart }) => {
  const { 
    addToCart, 
    toggleFavorite, 
    favorites, 
    settings, 
    setViewProfileUserId, 
    showToast,
    fetchInitialData
  } = useApp();

  const [views, setViews] = useState(product.view_count || 0);

  // Trigger real-time view increment (+1) on mount
  useEffect(() => {
    const incrementView = async () => {
      try {
        const res = await fetch(`/api/products/${product.id}/view`, {
          method: 'POST'
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && typeof data.view_count === 'number') {
            setViews(data.view_count);
            // Refresh list context in background
            fetchInitialData();
          }
        }
      } catch (e) {
        console.error('Error incrementing product view count:', e);
      }
    };
    incrementView();
  }, [product.id]);

  const isFavorite = favorites.includes(product.id);
  const outOfStock = product.status === 'out_of_stock' || product.quantity <= 0;

  const hasDiscount = product.sale_price !== null && product.sale_price < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - (product.sale_price as number)) / product.price) * 100) 
    : 0;

  const defaultWa = settings['whatsapp'] || '963900000000';
  const waCustom = product.whatsapp || defaultWa;
  const siteCurrency = settings['currency'] || 'ل.س';

  const formatCurrency = (val: number) => {
    return val.toLocaleString() + ' ' + siteCurrency;
  };

  const handleWhatsAppContact = () => {
    const message = `مرحباً مركز الرضوان، أود الاستفسار عن المنتج: *${product.name}* بقيمة ${product.sale_price ? formatCurrency(product.sale_price) : formatCurrency(product.price)}. هل هو متوفر حالياً؟`;
    const link = `https://wa.me/${waCustom.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      }).catch(() => null);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المنتج إلى الحافظة 🔗', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-right font-sans" dir="rtl">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card wrapper */}
      <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl z-10 transition animate-popup max-h-[92vh] flex flex-col">
        
        {/* Header toolbar */}
        <div className="p-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 px-3 border border-gray-200 hover:bg-slate-100 rounded-xl text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 ml-0.5" />
            <span>العودة للمعرض</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={shareProduct}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition"
              title="مشاركة المنتج"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-slate-105 hover:bg-slate-200 rounded-full text-slate-700 transition"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:grid md:grid-cols-2 gap-6">
          
          {/* Right Column: Media Display */}
          <div className="flex flex-col gap-3">
            <div className="aspect-square bg-slate-50 border border-gray-100 rounded-2xl overflow-hidden relative flex items-center justify-center p-4 shadow-3xs">
              {/* Hot sale floating discount bubble */}
              {hasDiscount && (
                <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                  <Flame className="w-3.5 h-3.5" />
                  <span>خصم {discountPercent}%</span>
                </span>
              )}
              
              {outOfStock && (
                <span className="absolute top-3 left-3 bg-gray-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md z-10">
                  نفذت الكمية
                </span>
              )}

              {/* Image/Video media */}
              {product.video_key || product.video_url ? (
                <video 
                  controls
                  muted
                  playsInline
                  src={product.video_key ? `/api/image/${product.video_key}` : product.video_url || ''}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : product.image_key ? (
                <img 
                  src={`/api/image/${product.image_key}`} 
                  alt={product.name} 
                  className="max-h-full max-w-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-300">
                  <Package className="w-16 h-16 stroke-1" />
                  <span className="text-xs text-gray-400 mt-2">لا تتوفر صورة فوتوغرافية</span>
                </div>
              )}
            </div>

            {/* Quick stats dashboard */}
            <div className="grid grid-cols-2 gap-3.5 mt-1">
              <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 block leading-none">المشاهدات الحقيقية</span>
                  <span className="text-xs font-black text-slate-800 font-mono inline-block mt-0.5">{views} مشاهدة</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500" />
                <div className="text-right">
                  <span className="text-[9px] text-gray-500 block leading-none">تقييم المشترين</span>
                  <span className="text-xs font-black text-slate-800 font-mono inline-block mt-0.5">{product.rating_avg || '0.0'} / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Column: Descriptive texts */}
          <div className="flex flex-col gap-4 text-right">
            <div>
              <span className="text-[10px] font-black text-amber-600 tracking-wider block mb-1">
                {product.category_name || 'مواد البناء الأساسية'}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{product.name}</h2>
            </div>

            {/* Price tag module */}
            <div className="bg-amber-50/40 border border-amber-200/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-900 font-bold block leading-none">السعر النقدي المعتمد</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {formatCurrency(product.sale_price !== null ? product.sale_price : product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-gray-400 line-through font-mono">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-600">
                <Package className="w-5 h-5" />
              </div>
            </div>

            {/* Description card */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black text-slate-800">تفاصيل ومواصفات المنتج:</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border p-3.5 rounded-xl whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Publisher details card */}
            {(product.owner_id || product.creator_id || product.user_id) && (
              <div className="border border-gray-150 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0">
                    {(product as any).user_avatar ? (
                      <img 
                        src={`/api/image/${(product as any).user_avatar}`} 
                        alt={product.user_name || ''} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-sm font-extrabold text-amber-600 font-mono">
                        {(product.user_name || 'م').substring(0, 1)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-extrabold text-slate-850">
                        {product.user_name || 'إشراف الرضوان'}
                      </span>
                      {((product as any).user_is_verified || (product as any).user_kycStatus === 'verified') && (
                        <VerifiedBadge size={13} className="mr-0.5 inline-block" />
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400 block mt-0.5 font-mono">تاريخ النشر: {product.created_at ? new Date(product.created_at).toLocaleDateString('ar-SY') : 'حديثاً'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const publisherId = product.owner_id || product.creator_id || product.user_id;
                    if (publisherId) {
                      setViewProfileUserId(publisherId);
                      onClose();
                    }
                  }}
                  className="text-[10px] text-amber-600 font-extrabold hover:underline"
                >
                  زيارة الحساب ➔
                </button>
              </div>
            )}

            {/* Quantity in stock */}
            <div className="text-[10px] text-slate-400 flex items-center justify-between py-1 border-t px-0.5">
              <span>الحالة: {outOfStock ? 'نفذت الكمية' : 'متوفر حالياً بالمعرض'}</span>
              <span>الكمية في المستودع: {product.quantity || product.stock_qty || 0} وحدة</span>
            </div>

          </div>

        </div>

        {/* Footer actions toolbar */}
        <div className="p-4 bg-slate-50 border-t border-gray-150 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              addToCart(product);
              showToast('تم إضافة المادة لسلة الشراء بنجاح 🛒', 'success');
              if (onOpenCart) {
                setTimeout(() => {
                  onOpenCart();
                }, 300);
              }
              onClose();
            }}
            disabled={outOfStock}
            className="flex items-center justify-center gap-2 py-3 mr-auto w-full rounded-2xl font-black text-xs sm:text-sm transition bg-amber-500 text-slate-950 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            <ShoppingCart className="w-4 h-4 ml-0.5" />
            <span>إضافة للسلة الشـرائية</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-250 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black text-xs sm:text-sm transition shadow-sm"
          >
            <MessageSquare className="w-4 h-4 ml-0.5 text-emerald-600" />
            <span>استفسار فوري واتساب</span>
          </button>
        </div>

      </div>
    </div>
  );
};



================================================================================
الملف: src/components/ProductReviewsModal.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { Product, ProductReview } from '../types';
import { useApp } from '../context/AppContext';
import { X, Star, User, MessageCircle, Send, CornerDownLeft, Calendar } from 'lucide-react';

interface ProductReviewsModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductReviewsModal: React.FC<ProductReviewsModalProps> = ({ product, onClose }) => {
  const { user, showToast, fetchInitialData } = useApp();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  // New review form
  const [newName, setNewName] = useState(user?.name || '');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyName, setReplyName] = useState(user?.name || '');
  const [replyComment, setReplyComment] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error('Error fetching reviews', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      showToast('يرجى كتابة تعليق التقييم أولاً', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: newName.trim() || 'عميل مركز الرضوان',
          rating: newRating,
          comment: newComment.trim()
        })
      });

      if (res.ok) {
        showToast('تم حفظ تقييمك ورأيك بنجاح! شكراً لك 🎉', 'success');
        setNewComment('');
        // If not logged in, keep the name, otherwise reset/sync
        if (!user) setNewName('');
        fetchReviews();
        fetchInitialData(); // update average scores in main lists
      } else {
        showToast('فشل تسجيل التقييم في النظام', 'error');
      }
    } catch {
      showToast('صعوبة في الاتصال بالخادم لإتمام التقييم', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyComment.trim()) {
      showToast('يرجى كتابة نص الرد أولاً', 'error');
      return;
    }

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: replyName.trim() || 'رد عميل الرضوان',
          rating: 5, // replies don't really affect stars, can use default 5
          comment: replyComment.trim(),
          parent_id: parentId
        })
      });

      if (res.ok) {
        showToast('تم إضافة ردك بنجاح على التقييم المختار', 'success');
        setReplyComment('');
        setReplyToId(null);
        if (!user) setReplyName('');
        fetchReviews();
      } else {
        showToast('فشل إرسال الرد في نظام التعليقات', 'error');
      }
    } catch {
      showToast('حدث خطأ بالشبكة أثناء إرسال الرد', 'error');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Group reviews into root level and responses
  const rootReviews = reviews.filter(r => !r.parent_id);
  const repliesMap = reviews.reduce<Record<number, ProductReview[]>>((acc, rev) => {
    if (rev.parent_id) {
      acc[rev.parent_id] = acc[rev.parent_id] || [];
      acc[rev.parent_id].push(rev);
    }
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right font-sans" dir="rtl">
      <div className="bg-white rounded-3xl border border-gray-150 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-xl">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">تقييمات وأراء العملاء</h3>
              <p className="text-[10px] text-slate-300 mt-0.5 mt-1">{product.name}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content wrapper */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 scrollbar-none">
          {/* Rating Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150">
            <div className="col-span-1 flex flex-col items-center justify-center text-center border-l border-gray-200/60 pl-4 py-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{product.rating_avg || '0.0'}</span>
              <div className="flex gap-0.5 my-1.5 justify-center" dir="ltr">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-4 h-4 ${s <= Math.round(product.rating_avg || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-500 font-semibold">{product.rating_count || 0} تقييمات للعملاء</span>
            </div>

            {/* Submit rating form block */}
            <form onSubmit={handleCreateReview} className="col-span-1 md:col-span-2 flex flex-col gap-3 font-sans justify-between">
              <span className="font-extrabold text-[11px] text-slate-800">أضف تقييمك ورأيك الخاص لهذا المنتج:</span>
              
              <div className="flex items-center gap-3">
                {/* Clickable Star Selection */}
                <div className="flex gap-1" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-0.5 hover:scale-110 active:scale-95 transition cursor-pointer"
                      title={`${star} نجوم`}
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-300'}`} />
                    </button>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-amber-600">
                  {newRating === 5 ? 'ممتاز جداً' : newRating === 4 ? 'جيد جداً' : newRating === 3 ? 'مقبول / جيد' : newRating === 2 ? 'ضعيف' : 'سيء للغاية'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder={user?.name || "اسمك الكامل (مثال: أحمد السعيد)"}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
                />
                
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    required
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="اكتب تعليقك وتجربتك للمنتج..."
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans flex-1"
                  />
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-slate-950 font-bold px-3 py-2 rounded-xl transition shadow-xs flex items-center justify-center cursor-pointer"
                    title="نشر التقييم"
                  >
                    {submitting ? '...' : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of Previous Reviews */}
          <div className="flex flex-col gap-4">
            <h4 className="font-extrabold text-slate-800 text-xs border-b border-gray-100 pb-2">سجل الأراء والردود المتراكمة ({rootReviews.length})</h4>
            
            {loading ? (
              <div className="text-center py-6 text-gray-400 text-xs font-medium">جاري سحب التقييمات وقراءة الردود من الخادم...</div>
            ) : rootReviews.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-150 rounded-2xl bg-slate-50/50">
                <MessageCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-[11px] text-gray-400 font-bold">لا توجد أي تقييمات سابقة لهذا المنتج حتى الآن.</p>
                <p className="text-[10px] text-gray-400 mt-1">كن أول من يقيم ويكتب رأيه الآن لمساعدة الآخرين!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {rootReviews.map((rev) => {
                  const revReplies = repliesMap[rev.id] || [];
                  const isReplying = replyToId === rev.id;

                  return (
                    <div key={rev.id} className="border border-gray-150 rounded-2xl bg-white p-4 shadow-xs flex flex-col gap-3">
                      {/* Review Card Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{rev.user_name}</span>
                            <span className="text-[9px] text-gray-400 flex items-center gap-1 font-mono">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(rev.created_at).toLocaleDateString('ar-SY', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5" dir="ltr">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-xs text-slate-705 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-gray-100">{rev.comment}</p>

                      {/* Reply action button */}
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyToId(isReplying ? null : rev.id);
                            setReplyComment('');
                          }}
                          className="text-[10px] text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          <CornerDownLeft className="w-3.5 h-3.5" />
                          <span>إضافة رد أو تعقيب على العميل</span>
                        </button>
                      </div>

                      {/* Interactive Reply Input Form inline */}
                      {isReplying && (
                        <form 
                          onSubmit={(e) => handleCreateReply(e, rev.id)} 
                          className="bg-slate-50/70 p-3.5 rounded-xl border border-gray-200 flex flex-col gap-2 mt-1 sm:mr-6"
                        >
                          <span className="text-[10px] font-extrabold text-amber-600">كتابة رد على تعليق: {rev.user_name}</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <input 
                              type="text" 
                              value={replyName} 
                              onChange={(e) => setReplyName(e.target.value)} 
                              placeholder={user?.name || "اسمك لرد التعقيب..."}
                              className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans"
                            />
                            <div className="flex gap-1.5">
                              <input 
                                type="text" 
                                required
                                value={replyComment} 
                                onChange={(e) => setReplyComment(e.target.value)} 
                                placeholder="اكتب ردك وملاحظتك التوضيحية..."
                                className="border border-gray-200 px-3 py-1.5 rounded-lg text-xs bg-white focus:ring-1 focus:ring-amber-500 font-sans flex-1"
                              />
                              <button 
                                type="submit" 
                                disabled={replySubmitting}
                                className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-slate-950 px-3.5 rounded-lg text-xs transition font-bold cursor-pointer"
                              >
                                {replySubmitting ? '...' : 'رد'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Nested replies list */}
                      {revReplies.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2 mr-4 sm:mr-8 border-r border-amber-200/50 pr-4">
                          {revReplies.map((reply) => (
                            <div key={reply.id} className="bg-slate-50/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                                  <User className="w-3 h-3 text-gray-500" />
                                  {reply.user_name}
                                </span>
                                <span className="text-[8px] text-gray-400 font-mono">
                                  {new Date(reply.created_at).toLocaleDateString('ar-SY', { day: 'numeric', month: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-650 leading-relaxed">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-gray-150 px-5 py-3.5 flex justify-end">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-701 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};



================================================================================
الملف: src/components/PublicProfileModal.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  Eye, 
  ShoppingBag, 
  Smile, 
  Volume2, 
  Sliders, 
  MessageSquare, 
  Briefcase, 
  User as UserIcon,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import { VerifiedBadge } from './VerifiedBadge';
import { Product, Ad } from '../types';

interface PublicProfileModalProps {
  userId: number;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, onClose }) => {
  const { settings, addToCart, showToast } = useApp();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'products' | 'ads' | 'info'>('products');

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/profile/${userId}`);
        if (!res.ok) {
          throw new Error('فشل تحميل الملف الشخصي');
        }
        const data = await res.json();
        if (isMounted) {
          setProfileData(data);
        }
      } catch (err: any) {
        showToast(err.message || 'خطأ في تحميل ملف الناشر الشخصي', 'error');
        onClose();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl border border-gray-100">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-sans font-extrabold text-slate-800">جاري تحميل ملف العضو الشخصي...</p>
          <p className="text-xs text-gray-500 mt-1">يرجى الانتظار ثانية واحدة لمعالجة البيانات</p>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.user) {
    return null;
  }

  const { user, stats, products = [], ads = [] } = profileData;
  const isVerified = user.verified === true || user.kycStatus === 'verified' || user.is_verified === true;
  
  // Format joining date
  const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'يونيو ٢٠٢٦';

  const defaultWa = settings['whatsapp'] || '963900000000';
  const siteCurrency = settings['currency'] || 'ل.س';

  const handleWhatsAppContact = (title: string, price?: number) => {
    let msg = `مرحباً ${user.name}، لقد شاهدت حسابك على مركز الرضوان وأود الاستفسار بخصوص معروضاتك.`;
    if (price) {
      msg = `مرحباً ${user.name}، أود الاستفسار عن سلعتك المعروضة: *${title}* بسعر: ${price.toLocaleString()} ${siteCurrency}. هل هي متوفرة حالياً؟`;
    } else {
      msg = `مرحباً ${user.name}، أود الاستفسار عن إعلانك المبوب: *${title}*.`;
    }
    const link = `https://wa.me/${defaultWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
      <div className="bg-slate-50 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner with Close Trigger */}
        <div className="relative h-28 sm:h-36 bg-gradient-to-r from-amber-500 to-amber-600 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full transition duration-200 cursor-pointer"
            title="إغلاق الملف الشخصي"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute -bottom-10 right-6 sm:right-8 flex items-end gap-3.5">
            {/* User Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 border-4 border-slate-50 shadow-md flex items-center justify-center relative">
              <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                {user.avatar_key ? (
                  <img 
                    src={`/api/image/${user.avatar_key}`} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User general description context */}
        <div className="pt-12 px-6 sm:px-8 pb-4 bg-white border-b border-gray-150 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg sm:text-xl text-slate-900 font-sans">{user.name}</h2>
                {isVerified && <VerifiedBadge className="mr-1" />}
              </div>
              <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                <span>عضو منذ: {joinDate}</span>
              </p>
            </div>

            {/* Direct Contact Button */}
            <button
              onClick={() => handleWhatsAppContact('استفسار عام')}
              className="px-4 py-2 hover:shadow border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition self-start sm:self-center"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>تواصل مباشر عبر الواتساب</span>
            </button>
          </div>

          <div className="mt-4 bg-slate-50 border border-gray-100 rounded-2xl p-3 text-xs text-slate-650 leading-relaxed">
            <span className="block font-black text-slate-950 text-[10px] mb-1">نبذة شخصية:</span>
            {user.bio || "عضو نشط وموثق بمجتمع حراج الرضوان لمواد البناء والأدوات الصحية."}
          </div>

          {/* Bento-Grid Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
            <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-gray-400 font-bold">عدد المنتجات</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-sans block">{stats.products_count}</span>
            </div>
            <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-gray-400 font-bold">عدد الإعلانات</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-sans block">{stats.ads_count}</span>
            </div>
            <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-gray-400 font-bold">عدد المنشورات</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-sans block">{stats.posts_count || 0}</span>
            </div>
            <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-gray-400 font-bold">عدد المشاهدات</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-sans block">{stats.profile_views}</span>
            </div>
            <div className="bg-gray-50/60 border border-gray-100 p-2.5 rounded-2xl text-center">
              <span className="block text-[10px] text-gray-400 font-bold">عدد الطلبات</span>
              <span className="text-sm sm:text-base font-black text-slate-900 font-sans block">{stats.orders_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Modal tabs navigator */}
        <div className="bg-slate-100 p-1.5 flex gap-1 border-b border-gray-150 shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition ${
              activeTab === 'products' ? 'bg-white text-amber-600 shadow' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            المنتجات والمعروضات ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition ${
              activeTab === 'ads' ? 'bg-white text-amber-600 shadow' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            الإعلانات المبوبة ({ads.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition ${
              activeTab === 'info' ? 'bg-white text-amber-600 shadow' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            تفاصيل العضو
          </button>
        </div>

        {/* Scrollable Listings View Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 min-h-[180px]">
          {activeTab === 'products' && (
            products.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white border border-gray-150 rounded-2xl">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-xs">لا يوجد منتجات متاحة حالياً</h4>
                <p className="text-[10px] text-gray-400 mt-1">لم يقم هذا المستخدم بتبويب أي سلع من مخزونه في السوق العام حتى الساعة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                {products.map((p: Product) => (
                  <div key={p.id} className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs flex flex-col p-3 text-right">
                    <div className="relative h-28 w-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-1.5 border border-gray-100">
                      {p.image_key ? (
                        <img 
                          src={`/api/image/${p.image_key}`} 
                          alt={p.name} 
                          className="max-h-full max-w-full object-contain w-auto h-auto rounded-lg"
                        />
                      ) : (
                        <span className="text-[9px] text-gray-400">لا تتوفر صورة للسلعة</span>
                      )}
                    </div>
                    <span className="text-[9px] font-black text-amber-600 mt-2 block">{p.category_name || 'مواد البناء الأساسية'}</span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1 mt-0.5">{p.name}</h4>
                    <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 mb-2 leading-relaxed h-7">{p.description}</p>
                    
                    <div className="mt-auto pt-1.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 font-sans">
                        {(p.sale_price !== null ? p.sale_price : p.price).toLocaleString()} {siteCurrency}
                      </span>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => addToCart(p)}
                          className="px-2 py-1.5 bg-amber-500 text-white rounded-lg text-[9px] font-bold hover:bg-amber-600 transition"
                        >
                          السلة
                        </button>
                        <button
                          onClick={() => handleWhatsAppContact(p.name, p.sale_price !== null ? p.sale_price : p.price)}
                          className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold border border-emerald-200 transition"
                        >
                          شراء
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'ads' && (
            ads.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white border border-gray-150 rounded-2xl">
                <Smile className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-xs">لا توجد إعلانات مبوبة نشطة</h4>
                <p className="text-[10px] text-gray-400 mt-1">لا تتوفر حالياً بنشورات مبوبة لهذا المستخدم بسوق الأفراد والمصالح المشتركة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ads.map((ad: Ad) => (
                  <div key={ad.id} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row gap-4 text-right">
                    {ad.image_key && (
                      <div className="w-full sm:w-28 h-28 shrink-0 bg-slate-50 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        <img 
                          src={`/api/image/${ad.image_key}`} 
                          alt={ad.title} 
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {ad.is_pinned === 1 && (
                          <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-bold px-1.5 py-0.5 rounded-md inline-block mb-1">
                            📌 مثبت بالأعلى
                          </span>
                        )}
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">{ad.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-3">{ad.description}</p>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                        <span className="text-[9px] text-gray-400 font-mono">
                          تاريخ النشر: {new Date(ad.created_at || Date.now()).toLocaleDateString('ar-SY')}
                        </span>
                        
                        <div className="flex gap-2">
                          {ad.contact && (
                            <a 
                              href={`tel:${ad.contact}`}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
                            >
                              <Phone className="w-3 h-3 text-slate-550" />
                              <span>اتصال: {ad.contact}</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleWhatsAppContact(ad.title)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-lg flex items-center gap-1 transition"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-600" />
                            <span>تواصل واتساب</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'info' && (
            <div className="bg-white border border-gray-150 rounded-2xl p-6 text-right">
              <h3 className="font-extrabold text-slate-950 text-sm mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-500" />
                <span>تفاصيل حساب العضو ومستوى التوثيق</span>
              </h3>
              
              <ul className="space-y-4">
                <li className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>الاسم بالكامل</span>
                  </span>
                  <span className="text-xs font-bold text-slate-900">{user.name}</span>
                </li>
                
                <li className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                     <Mail className="w-4 h-4 text-gray-400" />
                    <span>البريد الإلكتروني المعتمد</span>
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-700">{user.email}</span>
                </li>

                <li className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-400" />
                    <span>درجة ومستوى التوثيق</span>
                  </span>
                  {isVerified ? (
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                      <span>حساب رسمي موثق ( Verified )</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">
                      حساب قياسي غير موثق ( Standard )
                    </span>
                  )}
                </li>

                <li className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>تاريخ توقيت الانضمام للمجتمع</span>
                  </span>
                  <span className="text-xs font-bold text-slate-800">{joinDate}</span>
                </li>
              </ul>
              
              <p className="text-[10px] text-gray-400 mt-6 text-center leading-relaxed">
                جميع بيانات الأعضاء والناشرين يتم مراجعتها وتوثيقها من قبل مشرف الإدارة المعتمدة (المشرف محمود) بموجب الوثائق الرسمية المصادق عليها.
              </p>
            </div>
          )}
        </div>
        
        {/* Profile Footer Area */}
        <div className="bg-slate-100 text-center py-3 px-4 border-t border-gray-150 text-[10px] text-slate-500 font-sans shrink-0">
          حراج مركز الرضوان الموحد لمواد البناء والأدوات الصحية والكهربائية
        </div>

      </div>
    </div>
  );
};



================================================================================
الملف: src/components/Toast.tsx
================================================================================

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast.message) return null;

  return (
    <div 
      id="app-toast"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border transition-all duration-300 animate-bounce bg-white text-gray-800 border-gray-150"
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
      {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
      <span className="text-sm font-medium font-sans text-right direction-rtl">{toast.message}</span>
    </div>
  );
};



================================================================================
الملف: src/components/VerifiedBadge.tsx
================================================================================

import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: number | string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ className = "", size = 16 }) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <span 
      className={`inline-flex items-center justify-center align-middle shrink-0 select-none ${className}`} 
      title="حساب موثق"
      style={{ width: pixelSize, height: pixelSize }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none"
        style={{ width: pixelSize, height: pixelSize }}
      >
        <circle cx="12" cy="12" r="10" fill="#1DA1F2"/>
        <path 
          d="M9.5 13l-2-2a.75.75 0 00-1.06 1.06l2.53 2.53c.29.29.77.29 1.06 0l5.53-5.53a.75.75 0 10-1.06-1.06l-5 5z" 
          fill="#ffffff"
        />
      </svg>
    </span>
  );
};



================================================================================
الملف: src/context/AppContext.tsx
================================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Admin, 
  CartItem, 
  Product, 
  Category, 
  Banner, 
  Partner, 
  Setting,
  PaymentMethod,
  SocialLink
} from '../types';

interface AppContextType {
  user: User | null;
  admin: Admin | null;
  cart: CartItem[];
  favorites: number[];
  settings: Record<string, string>;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  partners: Partner[];
  paymentMethods: PaymentMethod[];
  socialLinks: SocialLink[];
  aiSettings: any;
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
  setAiSettings: React.Dispatch<React.SetStateAction<any>>;
  isLoading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | null };
  currentView: 'home' | 'categories' | 'ads' | 'me' | 'admin';
  adminPanel: string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setUser: (user: User | null) => void;
  setAdmin: (admin: Admin | null) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showKycModal: boolean;
  setShowKycModal: (show: boolean) => void;
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
  setView: (view: 'home' | 'categories' | 'ads' | 'me' | 'admin') => void;
  setAdminPanel: (panel: string) => void;
  fetchInitialData: () => Promise<void>;
  checkAuth: () => Promise<void>;
  viewProfileUserId: number | null;
  setViewProfileUserId: (id: number | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [admin, setAdminState] = useState<Admin | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showKycModal, setShowKycModal] = useState<boolean>(false);
  const [currentView, setView] = useState<'home' | 'categories' | 'ads' | 'me' | 'admin'>('home');
  const [adminPanel, setAdminPanel] = useState<string>('overview');
  const [viewProfileUserId, setViewProfileUserId] = useState<number | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({
    message: '',
    type: null
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: null });
    }, 3000);
  };

  // Load cart and favorites on initialization
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.error('Error loading stored App data', e);
    }
  }, []);

  // Sync cart and favorites
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const setAdmin = (newAdmin: Admin | null) => {
    setAdminState(newAdmin);
  };

  const addToCart = (product: Product, qty: number = 1) => {
    if (product.status === 'out_of_stock') {
      showToast('عذراً، هذا المنتج غير متوفر حالياً', 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const newQty = existing.qty + qty;
        showToast(`تم تحديث كمية المنتج في السلة`, 'success');
        return prev.map((item) => item.id === product.id ? { ...item, qty: newQty } : item);
      } else {
        showToast(`تمت إضافة منتج جديد للسلة`, 'success');
        return [
          ...prev, 
          { 
            id: product.id, 
            name: product.name, 
            price: product.sale_price !== null ? product.sale_price : product.price, 
            image_key: product.image_key || 'placeholder', 
            qty 
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('تمت إزالة المنتج من السلة', 'info');
  };

  const updateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('تمت إزالة المنتج من المفضلة', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('تمت إضافة المنتج إلى المفضلة', 'success');
        return [...prev, productId];
      }
    });
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, categoriesRes, productsRes, bannersRes, partnersRes, paymentMethodsRes, socialLinksRes, aiSettingsRes] = await Promise.all([
        fetch('/api/settings').then(res => res.json()).catch(() => ({})),
        fetch('/api/categories').then(res => res.json()).catch(() => []),
        fetch('/api/products').then(res => res.json()).catch(() => []),
        fetch('/api/banners').then(res => res.json()).catch(() => []),
        fetch('/api/partners').then(res => res.json()).catch(() => []),
        fetch('/api/payment_methods').then(res => res.json()).catch(() => []),
        fetch('/api/social_links').then(res => res.json()).catch(() => []),
        fetch('/api/ai_settings').then(res => res.json()).catch(() => null)
      ]);

      const formattedSettings: Record<string, string> = {};
      if (Array.isArray(settingsRes)) {
        settingsRes.forEach((s: Setting) => {
          formattedSettings[s.key] = s.value;
        });
      } else if (typeof settingsRes === 'object' && settingsRes !== null) {
        Object.assign(formattedSettings, settingsRes);
      }
      setSettings(formattedSettings);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setProducts(Array.isArray(productsRes) ? productsRes : []);
      setBanners(Array.isArray(bannersRes) ? bannersRes : []);
      setPartners(Array.isArray(partnersRes) ? partnersRes : []);
      setPaymentMethods(Array.isArray(paymentMethodsRes) ? paymentMethodsRes : []);
      setSocialLinks(Array.isArray(socialLinksRes) ? socialLinksRes : []);
      setAiSettings(aiSettingsRes);
    } catch (e) {
      console.error('Error fetching initial store data', e);
      showToast('فشل تحميل بعض البيانات من الخادم', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const userRes = await fetch('/api/user/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUserState(userData);
      } else {
        setUserState(null);
      }
    } catch (e) {
      console.error('User auth check failed', e);
    }

    try {
      const adminRes = await fetch('/api/auth/me');
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdminState(adminData);
      } else {
        setAdminState(null);
      }
    } catch (e) {
      console.error('Admin auth check failed', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchInitialData();
    };
    init();
  }, []);

  // Background polling for KYC & notification alerts
  useEffect(() => {
    if (!user) return;
    let previousKycStatus = user.kycStatus;
    const interval = setInterval(async () => {
      try {
        const userRes = await fetch('/api/user/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData) {
            // Trigger notification/badge changes instantly if status transitions
            if (previousKycStatus !== userData.kycStatus) {
              if (userData.kycStatus === 'verified') {
                showToast('تهانينا 🥳 تم توثيق حسابك وتفعيل الشارة الزرقاء بنجاح!', 'success');
              } else if (userData.kycStatus === 'rejected') {
                const rejectionReasonLabel = userData.kycData?.kycRejectionReason 
                  ? `للسبب التالي: ${userData.kycData.kycRejectionReason}` 
                  : '';
                showToast(`تم رفض طلب التوثيق الخاص بك للأسف. يرجى تعديل الصور وإعادة الإرسال.`, 'error');
              }
            }
            previousKycStatus = userData.kycStatus;
            setUserState(userData);
          }
        }
      } catch (e) {
        console.error("Auth sync poller failed", e);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return (
    <AppContext.Provider
      value={{
        user,
        admin,
        cart,
        favorites,
        settings,
        categories,
        products,
        banners,
        partners,
        paymentMethods,
        socialLinks,
        aiSettings,
        setPaymentMethods,
        setSocialLinks,
        setAiSettings,
        isLoading,
        toast,
        currentView,
        adminPanel,
        showToast,
        setUser,
        setAdmin,
        showAuthModal,
        setShowAuthModal,
        showKycModal,
        setShowKycModal,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleFavorite,
        setView,
        setAdminPanel,
        fetchInitialData,
        checkAuth,
        viewProfileUserId,
        setViewProfileUserId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};



================================================================================
الملف: src/index.css
================================================================================

@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* Custom CSS Animators inside the site */
@keyframes slideLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-slide-left {
  animation: slideLeft 0.3c;
  animation-duration: 0.3s;
  animation-fill-mode: forwards;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-popup {
  animation: popUp 0.25s ease-out forwards;
}

/* Scrollbar behaviors */
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}



================================================================================
الملف: src/main.tsx
================================================================================

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);



================================================================================
الملف: src/types.ts
================================================================================

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Setting {
  key: string;
  value: string;
  updated_at?: number;
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  role: 'editor' | 'admin' | 'super_admin';
  created_at?: number;
  last_login?: number | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_key?: string | null;
  avatar?: string;
  is_active?: number;
  created_at?: number;
  last_login?: number | null;
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified?: boolean | null;
  kycData?: {
    fullName: string;
    country: string;
    idType: string;
    idFrontImage: string;
    idBackImage: string;
    kycRejectionReason?: string;
  } | null;
  notifications?: {
    id: number;
    title: string;
    message: string;
    status: 'unread' | 'read';
    created_at: number;
  }[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  is_visible: number;
  created_at?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sale_price: number | null;
  quantity: number;
  category_id: number | null;
  category_name?: string;
  image_key: string | null;
  video_key?: string | null;
  video_url?: string | null;
  status: 'active' | 'hidden' | 'out_of_stock';
  whatsapp: string | null;
  rating_avg?: number;
  rating_count?: number;
  user_id?: number | null;
  user_name?: string | null;
  owner_id?: number | null;
  creator_id?: number | null;
  view_count?: number;
  created_at?: number;
  updated_at?: number;
}

export interface Banner {
  id: number;
  title: string | null;
  image_key: string;
  link: string | null;
  sort_order: number;
  is_active: number;
  banner_type: 'slider' | 'hero' | string;
  created_at?: number;
}

export interface PaymentMethod {
  id: number;
  type: 'sham_cash' | 'crypto' | 'custom';
  name: string;
  account_name?: string | null;
  account_number?: string | null;
  qr_key?: string | null;
  instructions?: string | null;
  is_active: number;
  
  // Crypto fields
  network_name?: string | null;
  currency_name?: string | null;
  wallet_address?: string | null;
  
  sort_order: number;
  created_at?: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: string | OrderItem[]; // can be string in DB, or compiled array in client
  total: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'delivered';
  payment_method_id: number | null;
  payment_method_name: string | null;
  payment_account: string | null;
  notes: string | null;
  payment_proof_key?: string | null;
  payment_status?: 'pending' | 'under_review' | 'approved' | 'rejected';
  payment_notes?: string | null;
  created_at?: number;
  updated_at?: number;
}

export interface Ad {
  id: number;
  user_id: number | null;
  user_name: string | null;
  owner_name?: string; // from JOIN
  owner_id?: number | null;
  creator_id?: number | null;
  title: string;
  description: string;
  contact: string;
  image_key: string | null;
  is_active: number;
  is_pinned: number;
  view_count?: number;
  created_at?: number;
  updated_at?: number;
}

export interface Partner {
  id: number;
  name: string | null;
  logo_key: string;
  sort_order: number;
  is_active: number;
  website_url?: string | null;
  created_at?: number;
}

export interface ProductReview {
  id: number;
  product_id: number;
  user_name: string;
  rating: number;
  comment: string;
  parent_id?: number | null;
  user_id?: number | null;
  user_avatar_key?: string | null;
  user_is_verified?: boolean;
  created_at: number;
}

export interface ImageRecord {
  key: string;
  data: string; // Base64 image
  mime_type: string;
  created_at?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_key: string;
  qty: number;
}

export interface SocialLink {
  id: number;
  platform: 'facebook' | 'instagram' | 'whatsapp' | 'telegram' | 'tiktok' | 'youtube' | 'x' | string;
  url: string;
  is_active: number;
}

export interface AppState {
  user: User | null;
  admin: Admin | null;
  cart: CartItem[];
  favorites: number[]; // Product IDs
  addresses: string[];
  settings: Record<string, string>;
  categories: Category[];
  products: Product[];
  banners: Banner[];
  partners: Partner[];
  payment_methods?: PaymentMethod[];
  social_links?: SocialLink[];
}



================================================================================
الملف: src/views/AdminView.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Product, 
  Category, 
  Banner, 
  Partner, 
  Ad, 
  Order 
} from '../types';
import { 
  Settings, 
  Package, 
  LayoutGrid, 
  Megaphone, 
  Users, 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Upload, 
  DollarSign, 
  Globe, 
  Lock,
  Compass,
  Briefcase,
  Sliders,
  PlusCircle,
  TrendingUp,
  Award,
  Pin,
  ShieldCheck,
  Landmark,
  Link,
  Bot,
  UserCheck,
  Volume2,
  ShieldAlert,
  ArrowUpRight,
  Mic,
  Square,
  Music
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    admin, 
    setAdmin, 
    products, 
    categories, 
    banners, 
    partners, 
    settings, 
    fetchInitialData, 
    showToast,
    paymentMethods,
    setPaymentMethods,
    socialLinks,
    setSocialLinks,
    aiSettings,
    setAiSettings
  } = useApp();

  // Voice trigger states & dynamic microphone recorders
  const [voiceTriggers, setVoiceTriggers] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorderRef, setMediaRecorderRef] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const fetchVoiceTriggers = async () => {
    try {
      const res = await fetch('/api/ai/voice_triggers');
      if (res.ok) {
        const data = await res.json();
        setVoiceTriggers(data);
      }
    } catch (err) {
      console.error("Failed to fetch voice trigger templates:", err);
    }
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'banners' | 'partners' | 'ads' | 'settings' | 'kyc' | 'payment_methods' | 'social_links' | 'ai_settings' | 'customers' | 'backup_protection'>('overview');

  // Secure Database Protection & Backup States/API Interfaces
  const [backupsInfo, setBackupsInfo] = useState<any>(null);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isTriggeringBackup, setIsTriggeringBackup] = useState(false);

  const fetchBackupsInfo = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await fetch('/api/storage/backups');
      if (res.ok) {
        const data = await res.json();
        setBackupsInfo(data);
      } else {
        showToast('حساب العميل الإداري غير مخوّل لعرض وثائق النسخ الاحتياطي ومزامنة البيانات.', 'error');
      }
    } catch {
      showToast('خطأ بالاتصال بالخادم، يرجى فحص كفاءة جدار الحماية والنسخ المتطابقة.', 'error');
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleTriggerManualBackup = async () => {
    setIsTriggeringBackup(true);
    try {
      const res = await fetch('/api/storage/backup/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      });
      if (res.ok) {
        showToast('تم حفظ أرشفة سحابية مشفرة بكود AES-256 بنجاح تام 💾', 'success');
        fetchBackupsInfo();
      } else {
        showToast('فشل تفعيل طلب الأرشفة الفوري بالخادم.', 'error');
      }
    } catch {
      showToast('عذراً، تعذر إنهاء عملية التشفير والأرشفة الأمنية بقواعد الخادم.', 'error');
    } finally {
      setIsTriggeringBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!window.confirm('🚨 تحذير هام جداً:\n\nهل أنت متأكد من رغبتك في استعادة حالة قواعد البيانات المنصة إلى هذه النسخة المحفوظة؟\nسيؤدي هذا الإجراء لإعادة كافة حسابات العملاء، الفواتير، والمنتجات وتخطي أي تغييرات حالية.')) {
      return;
    }
    try {
      showToast('جاري استرجاع البيانات ومطابقة شفرات الحماية الموحدة...', 'info');
      const res = await fetch(`/api/storage/backup/restore/${filename}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'تمت استعادة قواعد البيانات بنجاح 🚀', 'success');
        fetchInitialData();
        fetchBackupsInfo();
      } else {
        const err = await res.json();
        showToast(err.error || 'فشل تشفير أو استرجاع ملف البيانات المستهدفة.', 'error');
      }
    } catch {
      showToast('خطأ أثناء فك التشفير عن النسخ المحفوظة بالخادم.', 'error');
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!window.confirm('هل تود حذف هذه النسخة الاحتياطية المشفرة تماماً من أرشيف الخادم الفعلي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }
    try {
      const res = await fetch(`/api/storage/backup/delete/${filename}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('تم التخلص الآمن وحذف نسخة الحفظ من الأرشيف بنجاح 🔥', 'success');
        fetchBackupsInfo();
      } else {
        showToast('فشل حذف ملف الحفظ من الخادم.', 'error');
      }
    } catch {
      showToast('تعذر الاتصال الآمن مع وحدة الحذف بالخادم.', 'error');
    }
  };

  // Customer Management States
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState<any[]>([]);
  const [selectedUserAds, setSelectedUserAds] = useState<any[]>([]);
  const [selectedUserMedia, setSelectedUserMedia] = useState<string[]>([]);
  const [selectedUserActivities, setSelectedUserActivities] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Payment Methods States
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any | null>(null);
  const [pmName, setPmName] = useState('');
  const [pmType, setPmType] = useState<'sham_cash' | 'crypto'>('sham_cash');
  const [pmAccountName, setPmAccountName] = useState('');
  const [pmAccountNumber, setPmAccountNumber] = useState('');
  const [pmInstructions, setPmInstructions] = useState('');
  const [pmNetworkName, setPmNetworkName] = useState('');
  const [pmCurrencyName, setPmCurrencyName] = useState('');
  const [pmWalletAddress, setPmWalletAddress] = useState('');
  const [pmIsActive, setPmIsActive] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmQrFile, setPmQrFile] = useState<File | null>(null);

  // Social Links States
  const [editingSocialLink, setEditingSocialLink] = useState<any | null>(null);
  const [slPlatform, setSlPlatform] = useState('facebook');
  const [slUrl, setSlUrl] = useState('');
  const [slIsActive, setSlIsActive] = useState<number>(1);
  const [showSocialModal, setShowSocialModal] = useState(false);

  // AI settings local elements
  const [aiIsEnabled, setAiIsEnabled] = useState(1);
  const [aiWelcomeMessage, setAiWelcomeMessage] = useState('');
  const [aiSystemInstruction, setAiSystemInstruction] = useState('');
  const [aiPersonality, setAiPersonality] = useState('');
  const [aiIsStrict, setAiIsStrict] = useState(0);
  const [aiStrictCommands, setAiStrictCommands] = useState('');
  const [assistantAvatarPreview, setAssistantAvatarPreview] = useState<string | null>(null);
  const [adminConversations, setAdminConversations] = useState<any[]>([]);
  const [selectedAdminConversation, setSelectedAdminConversation] = useState<any | null>(null);

  const fetchAdminConversations = async () => {
    try {
      const res = await fetch('/api/admin/ai_conversations');
      if (res.ok) {
        const data = await res.json();
        setAdminConversations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'ai_settings') {
      fetchAdminConversations();
      fetchVoiceTriggers();
    }
  }, [activeTab]);

  // Audio recording timer loop
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const startMicrophoneRecording = async () => {
    try {
      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("تسجيل الميكروفون المباشر غير مدعوم في المتصفح أو البيئة الحالية (IFrame). يرجى فتح التطبيق في نافذة مستقلة خارج الإطار، أو رفع ملف صوتي جاهز من جهازك.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        throw new Error(`تعذر على التطبيق الوصول للميكروفون: ${err.message || err.name}. يرجى التحقق من تفعيل صلاحيات الميكروفون في المتصفح، أو تشغيل التطبيق في نافذة خارجية.`);
      });

      // Query most compliant compression formats compatible with MediaRecorder natively
      let options = {};
      let chosenMime = "audio/mp3";
      const candidateTypes = ["audio/webm", "audio/mp4", "audio/ogg", "audio/aac", "audio/wav"];
      
      for (const type of candidateTypes) {
        if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(type)) {
          options = { mimeType: type };
          chosenMime = type;
          break;
        }
      }

      if (typeof MediaRecorder === 'undefined') {
        throw new Error("محرك تسجيل الصوت (MediaRecorder) غير متوفر في هذه البيئة. يرجى رفع ملف صلب MP3/WAV.");
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: chosenMime });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64String = (reader.result as string).split(',')[1];
          await saveVoiceTrigger("Technical_Support_Request", base64String, chosenMime, "recorded_support.mp3");
        };
        // Close stream cleanly to release mic handle
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setMediaRecorderRef(mediaRecorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'يرجى تفعيل صلاحية الميكروفون أو رفع ملف صلب جاهز بصيغة MP3/WAV.', 'error');
    }
  };

  const stopMicrophoneRecording = () => {
    if (mediaRecorderRef && isRecording) {
      mediaRecorderRef.stop();
      setIsRecording(false);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'].includes(file.type) && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav')) {
      showToast('يرجى اختيار ملف صلب بصيغة MP3 أو WAV فقط.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      await saveVoiceTrigger("Technical_Support_Request", base64String, file.type || "audio/mp3", file.name);
    };
  };

  const saveVoiceTrigger = async (key: string, base64: string, mimeType: string, filename: string) => {
    try {
      const res = await fetch('/api/ai/voice_triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_key: key,
          audio_base64: base64,
          mime_type: mimeType,
          filename: filename
        })
      });
      if (res.ok) {
        showToast('تم حفظ وربط التسجيل البشري بالوسم (Trigger: Technical_Support_Request) بنجاح 🎉', 'success');
        fetchVoiceTriggers();
      } else {
        showToast('فشل تخزين الملف الصوتي بالقواعد.', 'error');
      }
    } catch {
      showToast('خطأ بالشبكة أثناء محاولة التخزين الموحد.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'backup_protection') {
      fetchBackupsInfo();
    }
  }, [activeTab]);

  // Sync AI state from Context when received
  useEffect(() => {
    if (aiSettings) {
      setAiIsEnabled(Number(aiSettings.is_enabled) !== 0 ? 1 : 0);
      setAiWelcomeMessage(aiSettings.welcome_message || '');
      setAiSystemInstruction(aiSettings.system_instruction || '');
      setAiPersonality(aiSettings.personality || '');
      setAiIsStrict(Number(aiSettings.is_strict) !== 0 ? 1 : 0);
      setAiStrictCommands(aiSettings.strict_commands || '');
    }
  }, [aiSettings]);

  // KYC verification management states
  const [pendingKycUsers, setPendingKycUsers] = useState<any[]>([]);
  const [isLoadingKyc, setIsLoadingKyc] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState<Record<number, string>>({});
  const [selectedKycImage, setSelectedKycImage] = useState<string | null>(null);

  const fetchPendingKyc = async () => {
    setIsLoadingKyc(true);
    try {
      const res = await fetch('/api/admin/kyc-pending');
      if (res.ok) {
        const data = await res.json();
        setPendingKycUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      showToast('عذراً، فشل جلب ملفات التوثيق غير المرحلة', 'error');
    } finally {
      setIsLoadingKyc(false);
    }
  };

  const handleKycApprove = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/kyc-approve/${userId}`, { method: 'POST' });
      if (res.ok) {
        showToast('تم قبول وإقرار طلب توثيق العميل ومسح هويته بنجاح 🎉', 'success');
        setPendingKycUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        showToast('تعذر إتمام عملية توثيق الحساب حالياً.', 'error');
      }
    } catch {
      showToast('حدث خطأ بالشبكة أثناء تأكيد التحقق الهوياتي.', 'error');
    }
  };

  const handleKycReject = async (userId: number) => {
    const reason = rejectionReasons[userId] || '';
    if (!reason.trim()) {
      showToast('يرجى تحديد سبب الرفض لتوجيه وتوعية العميل لإرسال صور أنسب.', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/admin/kyc-reject/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        showToast('تم رفض مستندات الهوية وصياغة إشعار تصحيحي للعميل فوراً.', 'success');
        setPendingKycUsers(prev => prev.filter(u => u.id !== userId));
        setRejectionReasons(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      } else {
        showToast('تعذر رد الطلب، برجاء المحاولة لاحقاً.', 'error');
      }
    } catch {
      showToast('حدث خطأ بالشبكة أثناء شطب مستندات الهوية.', 'error');
    }
  };

  // Loading states
  const [orders, setOrders] = useState<Order[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form creation states
  const [editingItem, setEditingItem] = useState<{ type: string; item: any } | null>(null);

  // Products state & forms
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState<number>(0);
  const [pSalePrice, setPSalePrice] = useState<number | null>(null);
  const [pQty, setPQty] = useState<number>(0);
  const [pCatId, setPCatId] = useState<number | null>(null);
  const [pStatus, setPStatus] = useState<'active' | 'hidden' | 'out_of_stock'>('active');
  const [pWhatsApp, setPWhatsApp] = useState('');
  const [pImageFile, setPImageFile] = useState<File | null>(null);

  // Categories state & forms
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catOrder, setCatOrder] = useState<number>(0);
  const [catVisible, setCatVisible] = useState<number>(1);

  // Banners state & forms
  const [bTitle, setBTitle] = useState('');
  const [bLink, setBLink] = useState('');
  const [bType, setBType] = useState('slider');
  const [bOrder, setBOrder] = useState<number>(0);
  const [bImageFile, setBImageFile] = useState<File | null>(null);

  // Partners state & forms
  const [partnerName, setPartnerName] = useState('');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [partnerLogoFile, setPartnerLogoFile] = useState<File | null>(null);
  const [partnerOrder, setPartnerOrder] = useState<number>(0);

  // Custom Zoomed Partner Logo Image state
  const [zoomedPartnerImage, setZoomedPartnerImage] = useState<string | null>(null);

  // Classified Ads Editing states
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [adEditTitle, setAdEditTitle] = useState('');
  const [adEditDesc, setAdEditDesc] = useState('');
  const [adEditContact, setAdEditContact] = useState('');
  const [adEditPinned, setAdEditPinned] = useState(0);

  // Settings states
  const [siteName, setSiteName] = useState(settings['site_name'] || '');
  const [announcement, setAnnouncement] = useState(settings['header_announcement'] || '');
  const [defaultCurrency, setDefaultCurrency] = useState(settings['currency'] || 'ل.س');
  const [defaultWa, setDefaultWa] = useState(settings['whatsapp'] || '963900000000');
  const [phoneCall, setPhoneCall] = useState(settings['phone'] || '');
  const [placeholderSearch, setPlaceholderSearch] = useState(settings['search_placeholder'] || '');
  const [descSite, setDescSite] = useState(settings['site_description'] || '');

  // Live interactive brand visual customization parameters
  const [themePrimary, setThemePrimary] = useState(settings['theme_primary'] || '#f59e0b');
  const [themeSecondary, setThemeSecondary] = useState(settings['theme_secondary'] || '#0f172a');
  const [themeAccent, setThemeAccent] = useState(settings['theme_accent'] || '#d97706');

  // Social media configurations states
  const [socialFacebook, setSocialFacebook] = useState(settings['social_facebook'] || '');
  const [socialInstagram, setSocialInstagram] = useState(settings['social_instagram'] || '');
  const [socialTwitter, setSocialTwitter] = useState(settings['social_twitter'] || '');
  const [socialTiktok, setSocialTiktok] = useState(settings['social_tiktok'] || '');
  const [socialYoutube, setSocialYoutube] = useState(settings['social_youtube'] || '');
  const [socialWhatsapp, setSocialWhatsapp] = useState(settings['social_whatsapp'] || '');

  useEffect(() => {
    if (settings) {
      setThemePrimary(settings['theme_primary'] || '#f59e0b');
      setThemeSecondary(settings['theme_secondary'] || '#0f172a');
      setThemeAccent(settings['theme_accent'] || '#d97706');
      setSocialFacebook(settings['social_facebook'] || '');
      setSocialInstagram(settings['social_instagram'] || '');
      setSocialTwitter(settings['social_twitter'] || '');
      setSocialTiktok(settings['social_tiktok'] || '');
      setSocialYoutube(settings['social_youtube'] || '');
      setSocialWhatsapp(settings['social_whatsapp'] || '');
    }
  }, [settings]);

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setCustomersList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      showToast('عذراً، تعذر تحميل قائمة العملاء والمشترين المعتمدين', 'error');
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchCustomerDetails = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCustomer(data.user);
        setSelectedUserOrders(data.orders || []);
        setSelectedUserAds(data.ads || []);
        setSelectedUserMedia(data.media || []);
        setSelectedUserActivities(data.activityLog || []);
      } else {
        showToast('تعذر جلب ملف العميل التفصيلي', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('خطأ بالشبكة أثناء محاولة مراجعة معطيات العميل', 'error');
    }
  };

  const toggleCustomerStatus = async (userId: number, currentStatus: number) => {
    try {
      const nextActive = currentStatus === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive })
      });
      if (res.ok) {
        showToast('تم بنجاح تعديل صلاحية الحساب وحفظ الإجراء', 'success');
        setCustomersList(prev => prev.map(c => c.id === userId ? { ...c, is_active: nextActive } : c));
        if (selectedCustomer && selectedCustomer.id === userId) {
          setSelectedCustomer(prev => prev ? { ...prev, is_active: nextActive } : null);
        }
      } else {
        showToast('فشل تعديل حالة العميل', 'error');
      }
    } catch {
      showToast('خطأ بالشبكة أثناء تعديل حالة الحساب', 'error');
    }
  };

  const resetCustomerPassword = async (userId: number) => {
    const newPass = prompt("أدخل كلمة المرور الجديدة الآمنة للعميل (سيتم تشفيرها وحفظها تلقائياً بالكامل):");
    if (newPass === null) return;
    if (!newPass.trim()) {
      showToast('لا يمكن حفظ كلمة مرور فارغة', 'info');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass })
      });
      if (res.ok) {
        showToast('تم إعادة تعيين وتشفير كلمة المرور الجديدة للعميل بنجاح 🔒', 'success');
      } else {
        showToast('فشل إعادة تعيين كلمة المرور على الخادم', 'error');
      }
    } catch {
      showToast('عذراً، حدث خطأ بالاتصال أثناء تحديث كلمة المرور', 'error');
    }
  };

  // Payment Methods Handlers
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmName.trim()) {
      showToast('يرجى كتابة اسم تعريفي لطريقة الدفع أولاً', 'error');
      return;
    }

    try {
      let qrKey = editingPaymentMethod?.qr_key || '';
      if (pmQrFile) {
        const key = await uploadImageFile(pmQrFile);
        if (key) qrKey = key;
      }

      const payload = {
        name: pmName,
        type: pmType,
        account_name: pmAccountName || undefined,
        account_number: pmAccountNumber || undefined,
        instructions: pmInstructions || undefined,
        network_name: pmNetworkName || undefined,
        currency_name: pmCurrencyName || undefined,
        wallet_address: pmWalletAddress || undefined,
        qr_key: qrKey || undefined,
        is_active: pmIsActive
      };

      const isEdit = !!editingPaymentMethod;
      const url = isEdit ? `/api/payment_methods/${editingPaymentMethod.id}` : '/api/payment_methods';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEdit ? 'تم تحديث طريقة الدفع بنجاح' : 'تم إضافة طريقة الدفع الجديدة بنجاح', 'success');
        const updated = await res.json();
        
        if (isEdit) {
          setPaymentMethods(prev => prev.map(p => p.id === editingPaymentMethod.id ? { ...p, ...payload, qr_key: qrKey } : p));
        } else {
          setPaymentMethods(prev => [...prev, { id: updated.id, ...payload, qr_key: qrKey } as any]);
        }
        
        // Reset state
        setEditingPaymentMethod(null);
        setPmName('');
        setPmAccountName('');
        setPmAccountNumber('');
        setPmInstructions('');
        setPmNetworkName('');
        setPmCurrencyName('');
        setPmWalletAddress('');
        setPmQrFile(null);
        setShowPaymentModal(false);
      } else {
        showToast('تعذر حفظ بيانات طريقة الدفع', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الاتصال بالخادم لحفظ التعديلات', 'error');
    }
  };

  const handleDeletePaymentMethod = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك بحذف طريقة الدفع هذه نهائياً؟')) return;
    try {
      const res = await fetch(`/api/payment_methods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف طريقة الدفع من القاعدة بنجاح', 'success');
        setPaymentMethods(prev => prev.filter(p => p.id !== id));
      } else {
        showToast('فشل حذف البند المسجل', 'error');
      }
    } catch {
      showToast('خطأ بالاتصال بالشبكة', 'error');
    }
  };

  // Social Links Handlers
  const handleSaveSocialLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slUrl.trim()) {
      showToast('يرجى وضع رابط المنصة أولاً', 'error');
      return;
    }

    try {
      const payload = {
        platform: slPlatform,
        url: slUrl,
        is_active: slIsActive
      };

      const isEdit = !!editingSocialLink;
      const url = isEdit ? `/api/social_links/${editingSocialLink.id}` : '/api/social_links';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEdit ? 'تم تحديث رابط المنصة بنجاح' : 'تم إضافة الرابط الجديد المعتمد بنجاح', 'success');
        const updated = await res.json();
        
        if (isEdit) {
          setSocialLinks(prev => prev.map(s => s.id === editingSocialLink.id ? { ...s, ...payload } : s));
        } else {
          setSocialLinks(prev => [...prev, { id: updated.id, ...payload } as any]);
        }

        setEditingSocialLink(null);
        setSlUrl('');
        setShowSocialModal(false);
      } else {
        showToast('تعذر حفظ رابط التواصل الاجتماعي', 'error');
      }
    } catch {
      showToast('خطأ بالشبكة أثناء حفظ معطيات الرابط', 'error');
    }
  };

  const handleDeleteSocialLink = async (id: number) => {
    if (!confirm('هل ترغب بإزالة رابط شبكة التواصل هذه نهائياً؟')) return;
    try {
      const res = await fetch(`/api/social_links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف الرابط بنجاح من قائمة المنصات', 'success');
        setSocialLinks(prev => prev.filter(s => s.id !== id));
      } else {
        showToast('تعذر إزالة رابط الشريك', 'error');
      }
    } catch {
      showToast('حدث خطأ بالاتصال الخارجي للشبكة', 'error');
    }
  };

  // Save AI Settings Handler
  const handleSaveAiSettings = async () => {
    try {
      const res = await fetch('/api/ai_settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: aiIsEnabled,
          welcome_message: aiWelcomeMessage,
          system_instruction: aiSystemInstruction,
          personality: aiPersonality,
          is_strict: aiIsStrict,
          strict_commands: aiStrictCommands
        })
      });

      if (res.ok) {
        showToast('تم حفظ وضبط مستشار الذكاء الاصطناعي للمتجر بنجاح ✨', 'success');
        const data = await res.json();
        setAiSettings(data);
      } else {
        showToast('رصد خطأ أثناء محاولة تعديل إعدادات المساعد', 'error');
      }
    } catch {
      showToast('فشل الاتصال لتحديث معايير المساعد الذكي', 'error');
    }
  };

  const loadOrdersAndAds = async () => {
    setIsLoading(true);
    try {
      const [ordRes, adsRes] = await Promise.all([
        fetch('/api/orders').then(res => res.json()).catch(() => []),
        fetch('/api/ads').then(res => res.json()).catch(() => [])
      ]);
      setOrders(Array.isArray(ordRes) ? ordRes : []);
      setAds(Array.isArray(adsRes) ? adsRes : []);
    } catch (e) {
      console.error(e);
      showToast('خطأ أثناء تحميل بيانات الإدارة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin) {
      loadOrdersAndAds();
      fetchPendingKyc();
      fetchCustomers();
    }
  }, [admin]);

  if (!admin) {
    return (
      <div className="w-full bg-slate-50 font-sans text-right min-h-screen py-20 px-4 flex flex-col items-center justify-center" dir="rtl">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-5 border">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl mb-1">لوحة الإدارة مقفلة</h2>
        <p className="text-xs text-gray-500 max-w-sm text-center leading-relaxed">
          عذراً، هذه اللوحة مخصصة فقط لموظفي ومشرفي مركز الرضوان. يرجى تسجيل الدخول بحساب مسؤول للولوج.
        </p>
      </div>
    );
  }

  // Compress image to fit any size, resizing if width/height is huge to prevent OOM and upload times
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // If it's not an image, resolve directly
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Max resolution threshold for web products
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width > height) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name || "image.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.85
        );
      };
      
      img.onerror = () => {
        resolve(file);
      };
    });
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Str = result.split(',')[1] || '';
        resolve(base64Str);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle image upload helper
  const uploadImageFile = async (file: File): Promise<string | null> => {
    try {
      // Pre-compress image automatically on client side to handle any size (e.g. from mobile)
      const compressed = await compressImage(file);
      const base64Data = await fileToBase64(compressed);
      const res = await fetch('/api/image/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: compressed.type
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.key;
      }
    } catch (e) {
      console.error('Error uploading image file', e);
    }
    return null;
  };

  // -----------------------------------------------------
  // CRUD Actions
  // -----------------------------------------------------

  // Product Create/Update
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || pPrice <= 0) {
      showToast('يرجى تحديد اسم المنتج والسعر والكمية بدقة', 'error');
      return;
    }

    try {
      let image_key = editingItem?.type === 'product' ? editingItem.item.image_key : null;
      if (pImageFile) {
        image_key = await uploadImageFile(pImageFile);
      }

      const payload = {
        name: pName,
        description: pDesc,
        price: pPrice,
        sale_price: pSalePrice,
        quantity: pQty,
        category_id: pCatId,
        status: pStatus,
        whatsapp: pWhatsApp || null,
        image_key
      };

      const isEditing = editingItem?.type === 'product';
      const endpoint = isEditing ? `/api/products/${editingItem.item.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(isEditing ? 'تم تعديل المنتج بنجاح' : 'تم إضافة منتج جديد للكتالوج الإنشائي', 'success');
        resetProductForm();
        fetchInitialData();
      } else {
        const err = await res.json();
        showToast(err.error || 'عذراً، فشلت العملية', 'error');
      }
    } catch {
      showToast('خطأ عند ربط المنتج بالكتالوج', 'error');
    }
  };

  const startEditProduct = (p: Product) => {
    setEditingItem({ type: 'product', item: p });
    setPName(p.name);
    setPDesc(p.description || '');
    setPPrice(p.price);
    setPSalePrice(p.sale_price);
    setPQty(p.quantity);
    setPCatId(p.category_id);
    setPStatus(p.status);
    setPWhatsApp(p.whatsapp || '');
    setPImageFile(null);
  };

  const deleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم شطب وحذف المنتج بنجاح 🎉', 'info');
        fetchInitialData();
      }
    } catch {
      showToast('خطأ أثناء شطب وتصفية السلعة الإنشائية', 'error');
    }
  };

  const resetProductForm = () => {
    setEditingItem(null);
    setPName('');
    setPDesc('');
    setPPrice(0);
    setPSalePrice(null);
    setPQty(0);
    setPCatId(categories[0]?.id || null);
    setPStatus('active');
    setPWhatsApp('');
    setPImageFile(null);
  };

  // Category Create/Update
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catSlug.trim()) {
      showToast('يرجى تحديد الاسم والslug للفئة', 'error');
      return;
    }

    try {
      const isEditing = editingItem?.type === 'category';
      const endpoint = isEditing ? `/api/categories/${editingItem.item.id}` : '/api/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: catName,
          slug: catSlug,
          sort_order: Number(catOrder),
          is_visible: Number(catVisible)
        })
      });

      if (res.ok) {
        showToast(isEditing ? 'تم تحديث القسم بنجاح' : 'تم تدوين القسم الإنشائي بنجاح', 'success');
        resetCategoryForm();
        fetchInitialData();
      }
    } catch {
      showToast('خطأ في إدراج التصنيف بالخادم', 'error');
    }
  };

  const startEditCategory = (c: Category) => {
    setEditingItem({ type: 'category', item: c });
    setCatName(c.name);
    setCatSlug(c.slug);
    setCatOrder(c.sort_order);
    setCatVisible(c.is_visible);
  };

  const deleteCategory = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم شطب وتصفية القسم المعياري بنجاح 🎉', 'info');
        fetchInitialData();
      }
    } catch {
      showToast('حدث خطأ أثناء فك ارتباط القسم الحالي بالخادم', 'error');
    }
  };

  const resetCategoryForm = () => {
    setEditingItem(null);
    setCatName('');
    setCatSlug('');
    setCatOrder(0);
    setCatVisible(1);
  };

  // Banner Create/Delete
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bImageFile && !editingItem) {
      showToast('يلزمك اختيار صورة السلايدر لعرض البانر', 'error');
      return;
    }

    try {
      let image_key = editingItem ? editingItem.item.image_key : '';
      if (bImageFile) {
        const uKey = await uploadImageFile(bImageFile);
        if (uKey) image_key = uKey;
      }

      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: bTitle,
          image_key,
          link: bLink,
          sort_order: Number(bOrder),
          banner_type: bType,
          is_active: 1
        })
      });

      if (res.ok) {
        showToast('تم تعليق ونشر البانر بالسلايدر الرئيسي', 'success');
        setBTitle('');
        setBLink('');
        setBOrder(0);
        setBImageFile(null);
        fetchInitialData();
      }
    } catch {
      showToast('خطأ في نشر لوحة الشريحة', 'error');
    }
  };

  const deleteBanner = async (id: number) => {
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم إقصاء وحذف البانر بنجاح 🎉', 'info');
        fetchInitialData();
      }
    } catch {
      showToast('عذراً، فشل حذف البانر الترويجي بنواة النظام', 'error');
    }
  };

  // Partner Create/Delete
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerLogoFile) {
      showToast('يلزم اختيار شعار المورد أو المصنع أولاً لتثبيته', 'error');
      return;
    }

    try {
      const logo_key = await uploadImageFile(partnerLogoFile);
      if (!logo_key) {
        showToast('فشل تحميل ملف اللوجو', 'error');
        return;
      }

      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: partnerName,
          logo_key,
          sort_order: Number(partnerOrder),
          website_url: partnerWebsiteUrl,
          is_active: 1
        })
      });

      if (res.ok) {
        showToast('تم تقييد وإشراك الشريك المورد بالمتجر', 'success');
        setPartnerName('');
        setPartnerWebsiteUrl('');
        setPartnerLogoFile(null);
        setPartnerOrder(0);
        fetchInitialData();
      }
    } catch {
      showToast('مكالمة إدراج الشريك المورد واجهت صعوبات بالخادم', 'error');
    }
  };

  const deletePartner = async (id: number) => {
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم حذف شريك المبيعات بنجاح 🎉', 'info');
        fetchInitialData();
      }
    } catch {
      showToast('فشل إلغاء ارتباط المورد الفعلي', 'error');
    }
  };

  // Classified Ads - Pin Ad / Toggle Visibility / Delete Ad
  const handlePinAd = async (ad: Ad) => {
    try {
      const nextPin = ad.is_pinned === 1 ? 0 : 1;
      const res = await fetch(`/api/ads/${ad.id}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: nextPin })
      });
      if (res.ok) {
        showToast(nextPin === 1 ? 'تم ترحيل وتثبيت الإعلان الإداري كإعلان متميز' : 'تم إلغاء تثبيت التميز عن الإعلان', 'success');
        loadOrdersAndAds();
      }
    } catch {
      showToast('فشل ربط وتثبيت الإعلان باللوحة العليا', 'error');
    }
  };

  const deleteAd = async (id: number) => {
    try {
      const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('تم إقصاء وحذف الإعلان المبوب بنجاح 🎉', 'info');
        loadOrdersAndAds();
      }
    } catch {
      showToast('فشلت محاولة شطب الإعلان من القائمة', 'error');
    }
  };

  // Start Edit Ad & Submit Edit Ad handlers
  const startEditAd = (ad: Ad) => {
    setEditingAd(ad);
    setAdEditTitle(ad.title);
    setAdEditDesc(ad.description || '');
    setAdEditContact(ad.contact || '');
    setAdEditPinned(ad.is_pinned || 0);
  };

  const handleEditAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    try {
      const res = await fetch(`/api/ads/${editingAd.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: adEditTitle,
          description: adEditDesc,
          contact: adEditContact,
          is_pinned: adEditPinned
        })
      });
      if (res.ok) {
        showToast('تم تعديل وحفظ منشور الإعلان بنجاح 🎉', 'success');
        setEditingAd(null);
        loadOrdersAndAds();
      } else {
        showToast('تعذر حفظ بيانات المنشور المعدل.', 'error');
      }
    } catch {
      showToast('حدث خطأ فني أثناء تعديل المنشور.', 'error');
    }
  };

  // Orders Management - Update Status
  const handleOrderStatusUpdate = async (id: number, nextStatus: 'pending' | 'confirmed' | 'rejected' | 'delivered') => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`تم تغيير الحالة للفاتورة لـ ${nextStatus === 'confirmed' ? 'مؤكد ومجهز' : nextStatus === 'delivered' ? 'تم التوصيل' : 'مرفوض/ملغي'}`, 'success');
        loadOrdersAndAds();
      }
    } catch {
      showToast('فشل تعديل حالة الطلبية بالخادم', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        site_name: siteName,
        header_announcement: announcement,
        currency: defaultCurrency,
        whatsapp: defaultWa,
        phone: phoneCall,
        search_placeholder: placeholderSearch,
        site_description: descSite,
        theme_primary: themePrimary,
        theme_secondary: themeSecondary,
        theme_accent: themeAccent,
        social_facebook: socialFacebook,
        social_instagram: socialInstagram,
        social_twitter: socialTwitter,
        social_tiktok: socialTiktok,
        social_youtube: socialYoutube,
        social_whatsapp: socialWhatsapp
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('تمت إعادة جدولة وتخزين ثوابت وإعدادات مركز الرضوان الموحد', 'success');
        fetchInitialData();
      }
    } catch {
      showToast('فشل تعيين الثوابت في قواعد البيانات الموحدة', 'error');
    }
  };

  const formatPrice = (val: number) => {
    return val.toLocaleString() + ' ' + (settings['currency'] || 'ل.س');
  };

  return (
    <div className="w-full bg-slate-50 font-sans text-right min-h-screen pb-16 flex flex-col" dir="rtl">
      
      {/* Top Admin Navigation Header bar */}
      <div className="bg-slate-900 border-b border-gray-150 py-5 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
              ADM
            </div>
            <div>
              <h2 className="font-extrabold text-base">مركز الرضوان الإداري المطور</h2>
              <p className="text-[10px] text-slate-400">بوابة الإشراف الشاملة - التحكم بتهيئة المنتجات والفواتير والمواد</p>
            </div>
          </div>
          <span className="bg-slate-850/50 border border-slate-700/50 px-4 py-1.5 rounded-full text-xs text-slate-350">
            أهلاً الكابتن المنسق: <strong className="text-amber-500">{admin.name}</strong> ({admin.role === 'super_admin' ? 'مدير ممتاز' : 'محرر ومراجع'})
          </span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 w-full">
        
        {/* Workspace navigation list panel */}
        <div className="col-span-1 flex flex-col gap-1.5 bg-white rounded-3xl border border-gray-150 p-4 shadow-sm self-start">
          <button 
            onClick={() => setActiveTab('overview')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'overview' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span>نظرة عامة ومؤشرات حية</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition ${
              activeTab === 'orders' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4.5 h-4.5" />
              <span>فواتير البناء والطلبيات</span>
            </div>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-white text-slate-900 font-bold' : 'bg-rose-500 text-white'}`}>
                {orders.filter(o => o.status === 'pending').length} جاري
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('products')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'products' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Package className="w-4.5 h-4.5" />
            <span>منتجات المعرض الإنسي</span>
          </button>

          <button 
            onClick={() => setActiveTab('categories')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'categories' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <LayoutGrid className="w-4.5 h-4.5" />
            <span>تصنيفات الفرز والأقسام</span>
          </button>

          <button 
            onClick={() => setActiveTab('banners')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'banners' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Sliders className="w-4.5 h-4.5" />
            <span>محرر السلايدر الإنشائي</span>
          </button>

          <button 
            onClick={() => setActiveTab('partners')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'partners' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Award className="w-4.5 h-4.5" />
            <span>موردي وشحن الشركاء</span>
          </button>

          <button 
            onClick={() => setActiveTab('ads')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'ads' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Megaphone className="w-4.5 h-4.5" />
            <span>سوق وإعلانات الأفراد</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'settings' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>ثوابت إعدادات المتجر</span>
          </button>

          <button 
            onClick={() => setActiveTab('kyc')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition ${
              activeTab === 'kyc' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>طلبات التحقق KYC</span>
            </div>
            {pendingKycUsers.length > 0 && (
              <span className="bg-red-500 text-white font-sans text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {pendingKycUsers.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => {
              setActiveTab('customers');
              fetchCustomers();
            }} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'customers' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>إدارة شؤون العملاء</span>
          </button>

          <button 
            onClick={() => setActiveTab('payment_methods')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'payment_methods' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Landmark className="w-4.5 h-4.5" />
            <span>طرق الدفع والتحويل</span>
          </button>

          <button 
            onClick={() => setActiveTab('social_links')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'social_links' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Link className="w-4.5 h-4.5" />
            <span>منصات السوشيال ميديا</span>
          </button>

          <button 
            onClick={() => setActiveTab('ai_settings')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'ai_settings' ? 'bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <Bot className="w-4.5 h-4.5" />
            <span>مستشار الذكاء الاصطناعي</span>
          </button>

          <button 
            onClick={() => setActiveTab('backup_protection')} 
            className={`w-full text-right px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2.5 transition ${
              activeTab === 'backup_protection' ? 'bg-emerald-605 bg-amber-550 bg-amber-500 text-white shadow-md' : 'hover:bg-slate-50 text-slate-705'
            }`}
          >
            <ShieldCheck className="w-4.5 h-4.5 text-slate-400 shrink-0" />
            <span className="truncate">نسخ احتياطي وأمان البيانات</span>
          </button>
        </div>

        {/* WORKSPACE DETAILED SCREEN - Left column panels */}
        <div className="col-span-1 lg:col-span-3">
          
          {/* OVERVIEW COMPONENT SCREEN */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* Stats bento indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-right">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">المواد بالمعرض</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-sans">{products.length} سلعة</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-right">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">الفواتير المستقطبة</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 font-sans">
                    {orders.length} طلبية
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-right">
                  <span className="text-[10px] text-gray-500 font-bold block mb-1">إعلانات المجتمع مفعّلة</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 font-sans">{ads.length} عرض</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-xs text-right bg-emerald-50/15 border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block mb-1">الرصيد الكلي المقدر</span>
                  <div className="text-sm sm:text-lg font-black text-emerald-700 font-sans">
                    {orders.reduce((acc, c) => c.status === 'delivered' ? acc + c.total : acc, 0).toLocaleString()} {settings['currency'] || 'ل.س'}
                  </div>
                </div>
              </div>

              {/* Administrative actions guideline panel */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl" />
                <h3 className="text-base sm:text-lg font-bold mb-2">تعليمات ومسار الموظفين اليومي</h3>
                <p className="text-slate-300 text-xs leading-relaxed max-w-xl">
                  يرجى رصد وتحديث فواتير البناء الواردة، والتواصل مع الزبائن فوراً عبر رقم الهاتف المدون الفاتورة أو واتساب لتنسيق شاحنات التحميل من المستودعات لضمان ثقة العميل.
                </p>
              </div>
            </div>
          )}

          {/* ORDERS COMPONENT TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-base mb-6">سجل وخدمة فواتير الطلبيات المنجزة</h3>
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs">لم يتم تسجيل أي طلبات شراء من المتجر بعد</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map((order) => {
                    let orderItemsList: any[] = [];
                    if (typeof order.items === 'string') {
                      try { orderItemsList = JSON.parse(order.items); } catch { orderItemsList = []; }
                    } else if (Array.isArray(order.items)) {
                      orderItemsList = order.items;
                    }

                    return (
                      <div key={order.id} className="border border-gray-150 rounded-2xl overflow-hidden text-right text-xs">
                        {/* Title bar */}
                        <div className="bg-slate-50 px-4 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 font-sans">
                          <div>
                            <span className="font-bold text-slate-905">فاتورة رقم: #{order.order_number}</span>
                            <span className="mx-2 text-gray-200">|</span>
                            <span className="text-slate-600 font-semibold">{order.customer_name} ({order.customer_phone})</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, 'confirmed')}
                              className={`px-3 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition ${order.status === 'confirmed' ? 'bg-blue-500 text-white' : ''}`}
                            >
                              تأكيد الطلب
                            </button>
                            
                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, 'delivered')}
                              className={`px-3 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition ${order.status === 'delivered' ? 'bg-emerald-500 text-white' : ''}`}
                            >
                              تم التوصيل
                            </button>

                            <button
                              onClick={() => handleOrderStatusUpdate(order.id, 'rejected')}
                              className={`px-3 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition ${order.status === 'rejected' ? 'bg-rose-500 text-white' : ''}`}
                            >
                              إلغاء الطلب
                            </button>
                          </div>
                        </div>

                        {/* Content box details */}
                        <div className="p-4 flex flex-col gap-2.5">
                          <div className="flex flex-col gap-1">
                            {orderItemsList.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-slate-700">
                                <span>- {item.name} (عدد: {item.quantity || item.qty})</span>
                                <span className="font-sans">{(item.price * (item.quantity || item.qty)).toLocaleString()} {settings['currency'] || 'ل.س'}</span>
                              </div>
                            ))}
                          </div>
                          <div className="h-px bg-gray-100" />
                          <div className="flex flex-wrap justify-between items-center text-slate-700">
                            <div>
                              <strong className="text-slate-650 font-bold pr-1">العنوان:</strong> {order.customer_address}
                            </div>
                            <div className="font-extrabold text-slate-900 text-sm font-sans">
                              الإجمالي الكلي: {order.total.toLocaleString()} {settings['currency'] || 'ل.س'}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg border">
                              <strong>ملاحظات العميل:</strong> {order.notes}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS COMPONENT TAB */}
          {activeTab === 'products' && (
            <div className="flex flex-col gap-6">
              
              {/* Product Creation form block */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right">
                <h3 className="font-extrabold text-slate-900 text-base mb-6">
                  {editingItem?.type === 'product' ? 'تمكين وتعديل منتج موجود' : 'ترشيح وإدراج منتج إنشائي جديد للكتالوج'}
                </h3>
                
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">عنوان واسم المنتج الإنشائي الموحد *</label>
                    <input 
                      type="text" 
                      required
                      value={pName} 
                      onChange={(e) => setPName(e.target.value)} 
                      placeholder="حديد صناعي مبروم 12 ملم"
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">شرح المادة ومواصفات التعبئة *</label>
                    <input 
                      type="text" 
                      value={pDesc} 
                      onChange={(e) => setPDesc(e.target.value)} 
                      placeholder="وزن الطن، بلد التصنيع، درجة المقاومة..."
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">السعر الأساسي الموحد (بالعملة الافتراضية) *</label>
                    <input 
                      type="number" 
                      required
                      value={pPrice} 
                      onChange={(e) => setPPrice(Number(e.target.value))} 
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-705">سعر الحسم العرضي (اختياري، اتركه فارغاً وبدون قيمة إن لم تتوفر)</label>
                    <input 
                      type="number" 
                      value={pSalePrice !== null ? pSalePrice : ''} 
                      onChange={(e) => setPSalePrice(e.target.value !== '' ? Number(e.target.value) : null)} 
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">كميات المخزن المتاحة *</label>
                    <input 
                      type="number" 
                      required
                      value={pQty} 
                      onChange={(e) => setPQty(Number(e.target.value))} 
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">القسم والتصنيف التابع له المنتج *</label>
                    <select
                      value={pCatId !== null ? pCatId : ''}
                      onChange={(e) => setPCatId(e.target.value !== '' ? Number(e.target.value) : null)}
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-505 bg-white"
                    >
                      <option value="">لا ينتمي لأي قسم</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">الحالة التشغيلية للمنتج بالمعرض *</label>
                    <select
                      value={pStatus}
                      onChange={(e) => setPStatus(e.target.value as any)}
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500 bg-white"
                    >
                      <option value="active">فعال ومعروض بالمتجر</option>
                      <option value="hidden">مخفي بالكامل من المعرض</option>
                      <option value="out_of_stock">نفذت الكمية كلياً بالواجهة</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-slate-700">رقم واتساب لوكيل مبيعات المادة (اختياري، يترك لتوجه المتجر الأساسي)</label>
                    <input 
                      type="text" 
                      value={pWhatsApp} 
                      onChange={(e) => setPWhatsApp(e.target.value)} 
                      placeholder="مثال: 963955566778"
                      className="border border-gray-250 p-2.5 rounded-xl font-medium focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                    <label className="font-bold text-slate-700">صورة المنتج الفوتوغرافية المرفقة</label>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer border border-dashed border-gray-200 bg-slate-50 px-4 py-2.5 rounded-xl hover:bg-slate-100/50 transition">
                        <span>اختر ملف صورة المادة</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                      <span className="text-gray-500">{pImageFile ? pImageFile.name : 'لم يتم اختيار ملف بعد'}</span>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                    {editingItem?.type === 'product' && (
                      <button 
                        type="button" 
                        onClick={resetProductForm}
                        className="border border-gray-300 hover:bg-slate-50 px-5 h-11 rounded-xl text-slate-700 font-bold transition"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold h-11 px-8 rounded-xl transition shadow-md"
                    >
                      {editingItem?.type === 'product' ? 'حفظ وحقن التعديلات' : 'تضمين المادة بالمعرض'}
                    </button>
                  </div>

                </form>
              </div>

              {/* Products Table listings */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm overflow-x-auto text-right">
                <h3 className="font-extrabold text-slate-905 text-base mb-6">عرض وفلترة كافة المنتجات المدرجة</h3>
                
                <table className="w-full text-xs font-sans text-right" dir="rtl">
                  <thead>
                    <tr className="border-b border-gray-100 text-slate-500">
                      <th className="py-3 px-2">المنتج</th>
                      <th className="py-3 px-2">سعر البيع</th>
                      <th className="py-3 px-2">الكمية</th>
                      <th className="py-3 px-2">الحالة بالمعرض</th>
                      <th className="py-3 px-2 text-left">الخيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-2 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3.5 px-2 font-semibold">
                          {p.sale_price !== null ? (
                            <span>{formatPrice(p.sale_price as number)} <span className="line-through text-gray-400 font-normal pr-1">{p.price}</span></span>
                          ) : (
                            <span>{formatPrice(p.price)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 font-medium font-sans">{p.quantity} حبة/طن</td>
                        <td className="py-3.5 px-2">
                          {p.status === 'active' && <span className="bg-emerald-50 text-emerald-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">معروض</span>}
                          {p.status === 'hidden' && <span className="bg-slate-105 bg-gray-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded-full">مخفي</span>}
                          {p.status === 'out_of_stock' && <span className="bg-orange-50 text-orange-700 font-semibold text-[10px] px-2 py-0.5 rounded-full">نفذ</span>}
                        </td>
                        <td className="py-3.5 px-2 flex justify-end gap-1.5">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 hover:text-amber-700 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* CATEGORIES COMPONENT TAB */}
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-6">
              
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right">
                <h3 className="font-extrabold text-slate-900 text-base mb-6">تنسيق وإضافة أقسام المواد والتصنيفات</h3>
                
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold">اسم القسم المعياري العربي الموحد *</label>
                    <input 
                      type="text" 
                      required
                      value={catName} 
                      onChange={(e) => setCatName(e.target.value)} 
                      placeholder="الأدوات الصحية"
                      className="border border-gray-250 p-2 rounded-xl focus:outline-amber-55"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">Slug الرابط الداخلي بالإنجليزية (بدون فراغات) *</label>
                    <input 
                      type="text" 
                      required
                      value={catSlug} 
                      onChange={(e) => setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                      placeholder="sanitary-tools"
                      className="border border-gray-250 p-2 rounded-xl focus:outline-amber-55"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">ترتيب التسلسل بالفرز والترشيح المعياري *</label>
                    <input 
                      type="number" 
                      value={catOrder} 
                      onChange={(e) => setCatOrder(Number(e.target.value))} 
                      className="border border-gray-250 p-2 rounded-xl focus:outline-amber-55"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">مستوى الرؤية بالمعرض والفلترة *</label>
                    <select
                      value={catVisible}
                      onChange={(e) => setCatVisible(Number(e.target.value))}
                      className="border border-gray-250 p-2 rounded-xl focus:outline-amber-55 bg-white font-sans"
                    >
                      <option value={1}>قسم مرئي وفعال بالكامل</option>
                      <option value={0}>قسم مخفي مؤقتاً</option>
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                    {editingItem?.type === 'category' && (
                      <button 
                        type="button" 
                        onClick={resetCategoryForm}
                        className="border border-gray-300 hover:bg-slate-50 px-4 py-2 rounded-xl"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-2 rounded-xl transition">
                      حفظ القسم الإنشائي
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Table */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm overflow-x-auto text-right">
                <table className="w-full text-xs text-right font-sans" dir="rtl">
                  <thead>
                    <tr className="border-b border-gray-100 text-slate-500">
                      <th className="py-2.5 px-1">القسم</th>
                      <th className="py-2.5 px-1">الرابط الفرعي (Slug)</th>
                      <th className="py-2.5 px-1">ترتيب الظهور</th>
                      <th className="py-2.5 px-1 text-left">خيارات التعديل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition">
                        <td className="py-3 px-1 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3 px-1 text-slate-500 font-sans">{c.slug}</td>
                        <td className="py-3 px-1 font-semibold">{c.sort_order}</td>
                        <td className="py-3 px-1 flex justify-end gap-1">
                          <button onClick={() => startEditCategory(c)} className="p-1 hover:bg-slate-100 text-slate-650 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteCategory(c.id)} className="p-1 hover:bg-rose-50 text-rose-505 rounded text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* BANNERS COMPONENT TAB */}
          {activeTab === 'banners' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right">
                <h3 className="font-extrabold text-slate-909 text-base mb-2">إدراج سلايدر أو لافتة عرض جديدة</h3>
                <p className="text-[10px] text-gray-400 mb-6">الصور تضاف وتدمج بالسلايدر الإشهاري بالصفحة الرئيسية للمتجر المتكامل.</p>
                
                <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold">عنوان شريحة السلايدر (اختياري)</label>
                    <input 
                      type="text" 
                      value={bTitle} 
                      onChange={(e) => setBTitle(e.target.value)} 
                      placeholder="شحنات الاسمنت عالية المقاومة"
                      className="border border-gray-250 p-2 rounded-xl focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">رابط التوجيه الموجه للشريحة (اختياري)</label>
                    <input 
                      type="text" 
                      value={bLink} 
                      onChange={(e) => setBLink(e.target.value)} 
                      placeholder="https://alradwan.com/products/cement"
                      className="border border-gray-250 p-2 rounded-xl focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">ترتيب تسلسل الشريحة بالانزلاق</label>
                    <input 
                      type="number" 
                      value={bOrder} 
                      onChange={(e) => setBOrder(Number(e.target.value))} 
                      className="border border-gray-250 p-2 rounded-xl focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                    <label className="font-bold">صورة البانر عالية الدقة *</label>
                    <div className="flex items-center gap-3 mt-1">
                      <label className="cursor-pointer border border-dashed border-gray-200 bg-slate-50 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition">
                        <span>اختر ملف الصورة</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          required
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setBImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                      <span className="text-gray-500">{bImageFile ? bImageFile.name : 'لم يتم اختيار ملف البانر المجهر'}</span>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-2.5 rounded-xl transition shadow">
                      بث وتعليق البانر بسوق المتجر
                    </button>
                  </div>
                </form>
              </div>

              {/* Banners listings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-150 overflow-hidden flex flex-col">
                    <div className="aspect-[16/8] bg-gray-50 flex items-center justify-center relative">
                      <img src={`/api/image/${b.image_key}`} alt={b.title || 'Slide'} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => deleteBanner(b.id)}
                        className="absolute top-3 left-3 p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 text-xs font-sans text-right">
                      <h4 className="font-bold text-slate-900">{b.title || 'لوحة ترويجية بدون اسم'}</h4>
                      <p className="text-gray-500 mt-1 truncate">الرابط: {b.link || 'لا تتوجه لروابط خارجية'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARTNERS COMPONENT TAB */}
          {activeTab === 'partners' && (
            <div className="flex flex-col gap-6">
              
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right">
                <h3 className="font-extrabold text-slate-909 text-base mb-6">تنظيم شركاء النجاح والشركات الموردة للمركز</h3>
                
                <form onSubmit={handlePartnerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold">اسم الشركة الموردة أو الماركة المعتمدة *</label>
                    <input 
                      type="text" 
                      required
                      value={partnerName} 
                      onChange={(e) => setPartnerName(e.target.value)} 
                      placeholder="لافارج هولسيم للإسمنت"
                      className="border border-gray-250 p-2.5 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold">رابط موقع الشركة الإلكتروني (اختياري)</label>
                    <input 
                      type="url" 
                      value={partnerWebsiteUrl} 
                      onChange={(e) => setPartnerWebsiteUrl(e.target.value)} 
                      placeholder="https://lafargeholcim.com"
                      className="border border-gray-250 p-2.5 rounded-xl text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                    <label className="font-bold">ملف شعار المورد (Logo) *</label>
                    <div className="flex items-center gap-3 mt-1">
                      <label className="cursor-pointer border border-dashed border-gray-200 bg-slate-50 px-4 py-2 rounded-xl text-xs">
                        <span>اختر ملف لوجو الشريك</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          required
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setPartnerLogoFile(e.target.files[0]);
                            }
                          }}
                          className="hidden" 
                        />
                      </label>
                      <span className="text-gray-500 text-xs">{partnerLogoFile ? partnerLogoFile.name : 'لم يتم تحديد اللوجو مسبقاً'}</span>
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-2.5 rounded-xl transition shadow">
                      تضمين الشريك المورد بالمتجر
                    </button>
                  </div>
                </form>
              </div>

               {/* Partners current listings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {partners.map((partner) => (
                  <div key={partner.id} className="bg-white rounded-2xl border border-gray-150 p-4 flex flex-col items-center justify-between text-center relative shadow-sm">
                    <button 
                      onClick={() => deletePartner(partner.id)}
                      className="absolute top-2 left-2 p-1 text-rose-500 hover:bg-rose-50 rounded transition"
                      title="شطب الشريك"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div 
                      onClick={() => setZoomedPartnerImage(`/api/image/${partner.logo_key}`)}
                      className="h-20 w-full flex items-center justify-center p-2 mb-2 bg-slate-50 border border-gray-100 rounded-2xl cursor-zoom-in hover:bg-slate-100/70 transition group"
                      title="انقر لتكبير الشعار بجودته الأصلية المنبثقة"
                    >
                      <img 
                        src={`/api/image/${partner.logo_key}`} 
                        alt={partner.name || 'Partner'} 
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-300" 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">{partner.name || 'علامة شريكة'}</span>
                    {partner.website_url && (
                      <span className="text-[10px] text-amber-500 mt-1 truncate max-w-full block font-medium" dir="ltr">
                        {partner.website_url}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Zoomed Partner Image Lightbox Modal */}
              {zoomedPartnerImage && (
                <div 
                  className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-100 text-right" 
                  dir="rtl"
                  onClick={() => setZoomedPartnerImage(null)}
                >
                  <div 
                    className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl p-3 border border-gray-150 shadow-2xl flex flex-col items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button 
                      type="button"
                      onClick={() => setZoomedPartnerImage(null)}
                      className="absolute -top-3 -left-3 bg-rose-500 hover:bg-rose-600 text-white w-8 h-8 rounded-full shadow-lg flex items-center justify-center font-bold text-sm cursor-pointer border border-white"
                      title="إغلاق التكبير"
                    >
                      X
                    </button>
                    <div className="overflow-auto max-h-[80vh] max-w-full flex items-center justify-center">
                      <img 
                        src={zoomedPartnerImage} 
                        alt="Zoomed logo" 
                        className="max-w-full max-h-[75vh] object-contain rounded-2xl" 
                      />
                    </div>
                    <div className="mt-2 text-center text-[10px] text-gray-400 font-semibold selection:bg-amber-100">
                      تم معاينة الجودة والنسب الأصلية للملف المرفوع • انقر في أي مكان خارج لإغلاق المعاينة
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ADS MODERATION COMPONENT TAB */}
          {activeTab === 'ads' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-900 text-base mb-6">لوحة مراجعة وتنظيم إعلانات الأفراد المبوبة والمجتمعية</h3>
              
              {ads.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs text-sans">لا يتوفر أي إعلانات أفراد نشطة حالياً بالسوق</div>
              ) : (
                <table className="w-full text-xs text-right font-sans" dir="rtl">
                  <thead>
                    <tr className="border-b border-gray-100 text-slate-500">
                      <th className="py-2.5 px-1">العرض المبوب</th>
                      <th className="py-2.5 px-1">المنشئ</th>
                      <th className="py-2.5 px-1">قناة الاتصال المرفقة</th>
                      <th className="py-2.5 px-1">مميز باللوحة</th>
                      <th className="py-2.5 px-1 text-left">خيارات الإشراف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad) => (
                      <tr key={ad.id} className="border-b border-gray-50 hover:bg-slate-50 transition">
                        <td className="py-3 px-1 font-bold text-slate-900">{ad.title}</td>
                        <td className="py-3 px-1 font-semibold text-slate-600">{ad.owner_name || ad.user_name || 'زائر مسجل'}</td>
                        <td className="py-3 px-1 font-semibold font-sans">{ad.contact}</td>
                        <td className="py-3 px-1">
                          {ad.is_pinned === 1 ? (
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">متميز ومثبت</span>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-semibold">عادي</span>
                          )}
                        </td>
                        <td className="py-3 px-1 flex justify-end gap-1.5">
                          <button
                            onClick={() => startEditAd(ad)}
                            className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition"
                            title="تعديل المنشور بالكامل"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePinAd(ad)}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 rounded-lg transition"
                            title="تثبيت ترويج الإدارة"
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteAd(ad.id)}
                            className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                            title="إلغاء الإعلان وشطبه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Edit Ad Modal Overlay */}
              {editingAd && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 text-right" dir="rtl">
                  <div className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 w-full max-w-xl shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h4 className="font-extrabold text-slate-900 text-sm">تعديل الإعلان المبوب: {editingAd.title}</h4>
                      <button 
                        type="button"
                        onClick={() => setEditingAd(null)}
                        className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition cursor-pointer"
                      >
                        <span className="text-sm font-sans font-bold px-1">X</span>
                      </button>
                    </div>

                    <form onSubmit={handleEditAdSubmit} className="flex flex-col gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-800">عنوان الإعلان المبوب *</label>
                        <input 
                          type="text" 
                          required
                          value={adEditTitle} 
                          onChange={(e) => setAdEditTitle(e.target.value)} 
                          className="border border-gray-250 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 font-sans"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-800">وصف وتفاصيل الإعلان كاملة *</label>
                        <textarea 
                          rows={4}
                          required
                          value={adEditDesc} 
                          onChange={(e) => setAdEditDesc(e.target.value)} 
                          className="border border-gray-250 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-slate-800">رقم هاتف / واتساب للتواصل المباشر *</label>
                        <input 
                          type="text" 
                          required
                          value={adEditContact} 
                          onChange={(e) => setAdEditContact(e.target.value)} 
                          className="border border-gray-250 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 font-sans"
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="adEditPinned"
                          checked={adEditPinned === 1} 
                          onChange={(e) => setAdEditPinned(e.target.checked ? 1 : 0)} 
                          className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="adEditPinned" className="font-bold text-slate-800 cursor-pointer select-none">
                          تثبيت الإعلان ضمن شريط لوحة الأفراد المتميزة
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 border-t border-gray-100 pt-3 mt-2">
                        <button 
                          type="button" 
                          onClick={() => setEditingAd(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-705 font-bold rounded-xl transition cursor-pointer"
                        >
                          إلغاء التعديل
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition shadow cursor-pointer"
                        >
                          حفظ التغييرات ونشر المنشور
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CMS SYSTEM SETTINGS DETAILS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right">
              <h3 className="font-extrabold text-slate-909 text-base mb-6">حلقات تهيئة وثوابت الموقع الأساسية المعيارية</h3>
              
              <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-bold">اسم المتجر / المعرض الترويجي الموحد *</label>
                  <input 
                    type="text" 
                    required
                    value={siteName} 
                    onChange={(e) => setSiteName(e.target.value)} 
                    placeholder="مركز الرضوان لمواد البناء"
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">شريط التنويه الإعلاني العلوي بالمتجر *</label>
                  <input 
                    type="text" 
                    required
                    value={announcement} 
                    onChange={(e) => setAnnouncement(e.target.value)} 
                    placeholder="مرحباً بكم في متجر مركز الرضوان المطور للتشييد والتعمير"
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">العملة الرسمية بالمعرض والبطاقات *</label>
                  <input 
                    type="text" 
                    required
                    value={defaultCurrency} 
                    onChange={(e) => setDefaultCurrency(e.target.value)} 
                    placeholder="ل.س"
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">رقم حساب واتساب المعتمد لتلقي وإرسال الفواتير المطبوعة للتنسيق *</label>
                  <input 
                    type="text" 
                    required
                    value={defaultWa} 
                    onChange={(e) => setDefaultWa(e.target.value)} 
                    placeholder="963900000000"
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">رقم الهاتف الأرضي / الموبايل للاتصال المباشر لخدمة العملاء *</label>
                  <input 
                    type="text" 
                    required
                    value={phoneCall} 
                    onChange={(e) => setPhoneCall(e.target.value)} 
                    placeholder="0955566778"
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold">حقل تلميح شريط البحث بالمركبات والأدوات *</label>
                  <input 
                    type="text" 
                    required
                    value={placeholderSearch} 
                    onChange={(e) => setPlaceholderSearch(e.target.value)} 
                    placeholder="البحث عن اسمنت، حديد، بلوك، أنابيب صحية..."
                    className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                  <label className="font-bold">فقرة تعريفية بالموقع والمركز (CMS / من نحن بالفوتر) *</label>
                  <textarea 
                    rows={4}
                    required
                    value={descSite} 
                    onChange={(e) => setDescSite(e.target.value)} 
                    placeholder="فقرة تعريفية توضح المزايا وجودة الخدمة ومناطق التوريد..."
                    className="border border-gray-250 p-3 rounded-xl focus:ring-1 focus:ring-amber-55 resize-none text-xs"
                  />
                </div>

                {/* Platform Color Customization Panel */}
                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-4">
                  <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-gray-150">
                    <Sliders className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">تخصيص الهوية البصرية وألوان المنصة اللحظية</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">اختر الألوان المفضلة لمركز الرضوان لتتغير الواجهات وكافة الأقسام لكل الزوار تلقائياً!</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Primary Color Picker */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">اللون الأساسي (أزرار ونصوص ترويجية)</span>
                        <div className="w-6 h-6 rounded-full border border-gray-250" style={{ backgroundColor: themePrimary }} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={themePrimary} 
                          onChange={(e) => setThemePrimary(e.target.value)} 
                          className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={themePrimary} 
                          onChange={(e) => setThemePrimary(e.target.value)} 
                          className="border border-gray-250 px-2.5 py-1.5 rounded-xl font-mono text-center text-xs flex-1"
                        />
                      </div>
                    </div>

                    {/* Secondary Color Picker */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">اللون الثانوي والفوتر (الخلفيات والأشرطة)</span>
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: themeSecondary }} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={themeSecondary} 
                          onChange={(e) => setThemeSecondary(e.target.value)} 
                          className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={themeSecondary} 
                          onChange={(e) => setThemeSecondary(e.target.value)} 
                          className="border border-gray-250 px-2.5 py-1.5 rounded-xl font-mono text-center text-xs flex-1"
                        />
                      </div>
                    </div>

                    {/* Accent Color Picker */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">لون الفخامة والتميز (الحسومات وحالات التحقق)</span>
                        <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: themeAccent }} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="color" 
                          value={themeAccent} 
                          onChange={(e) => setThemeAccent(e.target.value)} 
                          className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={themeAccent} 
                          onChange={(e) => setThemeAccent(e.target.value)} 
                          className="border border-gray-250 px-2.5 py-1.5 rounded-xl font-mono text-center text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Quick themes */}
                  <div className="mt-4 flex flex-wrap gap-2.5 items-center">
                    <span className="text-[11px] font-bold text-gray-500">القوالب اللونية القياسية السريعة:</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setThemePrimary('#f59e0b');
                        setThemeSecondary('#0f172a');
                        setThemeAccent('#d97706');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-250 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                      <span>الرضوان الذهبي (الافتراضي)</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setThemePrimary('#059669');
                        setThemeSecondary('#111827');
                        setThemeAccent('#10b981');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-250 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#059669]" />
                      <span>الأخضر البنياني</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setThemePrimary('#3b82f6');
                        setThemeSecondary('#0f172a');
                        setThemeAccent('#2563eb');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-250 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                      <span>الأزرق الخدمي الحديث</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setThemePrimary('#dc2626');
                        setThemeSecondary('#111827');
                        setThemeAccent('#f87171');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-gray-250 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#dc2626]" />
                      <span>الأحمر الحديدي الناري</span>
                    </button>
                  </div>
                </div>

                {/* Social media links section */}
                <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6 mt-4">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-4 text-amber-500">روابط حسابات التواصل الاجتماعي (تابعونا بالفوتر)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رابط فيسبوك (Facebook)</label>
                      <input 
                        type="url" 
                        value={socialFacebook} 
                        onChange={(e) => setSocialFacebook(e.target.value)} 
                        placeholder="https://facebook.com/your-username"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رابط انستغرام (Instagram)</label>
                      <input 
                        type="url" 
                        value={socialInstagram} 
                        onChange={(e) => setSocialInstagram(e.target.value)} 
                        placeholder="https://instagram.com/your-username"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رابط تويتر / X</label>
                      <input 
                        type="url" 
                        value={socialTwitter} 
                        onChange={(e) => setSocialTwitter(e.target.value)} 
                        placeholder="https://x.com/your-profile"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رابط تيك توك (TikTok)</label>
                      <input 
                        type="url" 
                        value={socialTiktok} 
                        onChange={(e) => setSocialTiktok(e.target.value)} 
                        placeholder="https://tiktok.com/@your-profile"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رابط يوتيوب (YouTube)</label>
                      <input 
                        type="url" 
                        value={socialYoutube} 
                        onChange={(e) => setSocialYoutube(e.target.value)} 
                        placeholder="https://youtube.com/c/your-channel"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-xs">رقم واتساب المباشر للفوتر (كامل مع رمز الدولة بدون +، مثلاً 963955566778)</label>
                      <input 
                        type="text" 
                        value={socialWhatsapp} 
                        onChange={(e) => setSocialWhatsapp(e.target.value)} 
                        placeholder="963955566778"
                        className="border border-gray-250 p-2.5 rounded-xl focus:ring-1 focus:ring-amber-500 font-sans"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="submit" className="bg-slate-900 bg-amber-500 hover:bg-amber-600 text-white font-extrabold h-11 px-8 rounded-xl transition shadow cursor-pointer">
                    حفظ وربط قيم التهيئة والمحتوى الإشهاري
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CUSTOMERS / USERS MANAGEMENT TAB PANEL */}
          {activeTab === 'customers' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">إدارة الأعضاء والعملاء المعتمدين</h3>
                  <p className="text-[10px] text-slate-500 mt-1">عرض السيرة الكاملة، سجل الطلبيات، الإعلانات المنشورة، وتعطيل الحسابات أو تعديل البيانات.</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="ابحث باسم العميل أو بريده..."
                    className="bg-slate-50 border border-gray-200 rounded-xl px-4 py-2 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {isLoadingCustomers ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs text-gray-400">جاري مسح العضويات النشطة...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customers List Box */}
                  <div className="md:col-span-1 border border-gray-150 rounded-2xl max-h-[600px] overflow-y-auto p-3 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 px-2 mb-1 block">كل المسجلين المنضمين</span>
                    
                    {customersList
                      .filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                      .map((cust) => (
                        <button
                          key={cust.id}
                          onClick={() => fetchCustomerDetails(cust.id)}
                          className={`w-full text-right p-3 rounded-xl border transition flex items-center gap-3 ${
                            selectedCustomer?.id === cust.id 
                              ? 'bg-amber-50 border-amber-300 shadow-sm' 
                              : 'bg-white border-gray-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-xs text-slate-600 shrink-0 uppercase">
                            {cust.name.substring(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs truncate">{cust.name}</h4>
                            <span className="text-[9.5px] text-gray-500 block truncate font-sans">{cust.email}</span>
                          </div>
                          {cust.is_active === 0 && (
                            <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded-full">محظور</span>
                          )}
                        </button>
                      ))}

                    {customersList.length === 0 && (
                      <span className="text-xs text-gray-400 text-center py-6">لا يوجد أعضاء مطابقين للبحث</span>
                    )}
                  </div>

                  {/* Customer Details Inspector Board */}
                  <div className="md:col-span-2 border border-gray-150 rounded-2xl p-5 bg-slate-50/50 min-h-[400px]">
                    {selectedCustomer ? (
                      <div className="flex flex-col gap-6">
                        {/* Profile Header Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                          <div className="flex items-center gap-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center uppercase shadow-inner">
                              {selectedCustomer.name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-base">{selectedCustomer.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">البريد المعتمد: <span className="font-sans font-medium">{selectedCustomer.email}</span></p>
                              <p className="text-[10px] text-slate-400 mt-0.5">الهاتف: <span className="font-sans font-medium">{selectedCustomer.phone || 'غير مسجل'}</span></p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => toggleCustomerStatus(selectedCustomer.id, selectedCustomer.is_active)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                selectedCustomer.is_active === 1
                                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              {selectedCustomer.is_active === 1 ? 'تعطيل الحساب وحظره' : 'تمكين وتنشيط العضو'}
                            </button>
                            <button
                              onClick={() => resetCustomerPassword(selectedCustomer.id)}
                              className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition border border-slate-700 shadow-sm"
                            >
                              إعادة تعيين كلمة المرور 🔒
                            </button>
                          </div>
                        </div>

                        {/* Customer statistics brief banner */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white border rounded-xl p-3 text-center">
                            <span className="text-[9.5px] text-gray-400 block font-bold">تاريخ الانضمام</span>
                            <span className="text-xs font-black text-slate-800 font-sans mt-1 block">
                              {new Date(selectedCustomer.created_at || Date.now()).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                          <div className="bg-white border rounded-xl p-3 text-center">
                            <span className="text-[9.5px] text-gray-400 block font-bold">حالة التوثيق KYC</span>
                            <span className={`text-xs font-extrabold mt-1 block ${selectedCustomer.is_verified ? 'text-amber-600' : 'text-gray-500'}`}>
                              {selectedCustomer.is_verified ? '⭐️ حساب موثق' : 'غير موثق'}
                            </span>
                          </div>
                          <div className="bg-white border rounded-xl p-3 text-center">
                            <span className="text-[9.5px] text-gray-400 block font-bold">مجموع الطلبيات</span>
                            <span className="text-sm font-black text-slate-800 font-sans mt-0.5 block">{selectedUserOrders.length} طلب</span>
                          </div>
                          <div className="bg-white border rounded-xl p-3 text-center">
                            <span className="text-[9.5px] text-gray-400 block font-bold">الإعلانات المعروضة</span>
                            <span className="text-sm font-black text-slate-800 font-sans mt-0.5 block">{selectedUserAds.length} إعلان</span>
                          </div>
                        </div>

                        {/* Orders, Ads, Media & Activity history logs tabs */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-4">
                          <h5 className="font-extrabold text-slate-900 text-xs border-b pb-2 mb-1 flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span>سجل فواتير المعرض للعميل ({selectedUserOrders.length})</span>
                          </h5>
                          {selectedUserOrders.length === 0 ? (
                            <span className="text-xs text-gray-400 italic block py-4 text-center">لا يوجد مشتريات أو طلبيات مسجلة لهذا الحساب بعد</span>
                          ) : (
                            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                              {selectedUserOrders.map((ord: any) => (
                                <div key={ord.id} className="bg-slate-50 border p-3 rounded-xl flex items-center justify-between text-xs">
                                  <div>
                                    <span className="font-bold text-slate-850">فاتورة رقم #{ord.id}</span>
                                    <span className="text-[10px] text-gray-400 font-sans block mt-1">{new Date(ord.created_at).toLocaleString('ar-EG')}</span>
                                  </div>
                                  <div className="text-left">
                                    <span className="font-black font-sans text-amber-600 block">{ord.total_price.toLocaleString()} ل.س</span>
                                    <span className="text-[9px] text-slate-500 block mt-1">طريقة الدفع: {ord.payment_method || 'شام كاش'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Classified Ads active listing view */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-4">
                          <h5 className="font-extrabold text-slate-900 text-xs border-b pb-2 mb-1 flex items-center gap-1.5">
                            <Megaphone className="w-4 h-4 text-amber-500" />
                            <span>الإعلانات والطلبيات المرفوعة للسوق ({selectedUserAds.length})</span>
                          </h5>
                          {selectedUserAds.length === 0 ? (
                            <span className="text-xs text-gray-400 italic block py-4 text-center font-sans">لم يقم بنشر أي مواد في سوق حراج الرضوان للأعضاء</span>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto pr-1">
                              {selectedUserAds.map((ad: any) => (
                                <div key={ad.id} className="bg-slate-50 border p-3 rounded-xl flex flex-col gap-1.5">
                                  <span className="font-bold text-xs truncate text-slate-900">{ad.title}</span>
                                  <span className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{ad.description}</span>
                                  <span className="text-[10px] text-amber-600 font-bold block mt-1">📍 سعر المعاينة: {Number(ad.price).toLocaleString()} ل.س</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Media and attachments uploaded */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-4">
                          <h5 className="font-extrabold text-slate-900 text-xs border-b pb-2 mb-1 flex items-center gap-1.5">
                            <Upload className="w-4 h-4 text-emerald-500" />
                            <span>المرفقات والصور المرفوعة بالحساب ({selectedUserMedia.length})</span>
                          </h5>
                          {selectedUserMedia.length === 0 ? (
                            <span className="text-xs text-gray-400 italic block py-4 text-center">لم يقم برفع أي أوراق ثبوتية أو لقطات تأكيدية</span>
                          ) : (
                            <div className="grid grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                              {selectedUserMedia.map((mKey: string, idx: number) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setSelectedKycImage(mKey)}
                                  className="w-full h-16 bg-gray-100 rounded-lg overflow-hidden border cursor-pointer hover:border-amber-400 opacity-90 hover:opacity-100 transition"
                                >
                                  <img 
                                    src={`/api/image/${mKey}`} 
                                    alt="attachment" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Real-time Activity log track */}
                        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col gap-3">
                          <h5 className="font-extrabold text-slate-900 text-xs border-b pb-2 mb-1 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                            <span>سجل نشاط العميل وتتبع الأفعال الأمنية ({selectedUserActivities.length})</span>
                          </h5>
                          {selectedUserActivities.length === 0 ? (
                            <span className="text-xs text-slate-400 italic block py-4 text-center">لا يوجد نشاطات مسجلة لهذا الحساب حالياً</span>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1">
                              {selectedUserActivities.map((act: any) => (
                                <div key={act.id} className="bg-slate-50 border border-gray-100 p-2.5 rounded-lg flex items-start justify-between text-[11px] hover:bg-slate-100 transition">
                                  <div className="flex-1">
                                    <strong className="text-slate-955 block">{act.action_type}</strong>
                                    <p className="text-slate-500 mt-1 font-sans">{act.details}</p>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5 whitespace-nowrap mr-2">
                                    {new Date(act.created_at).toLocaleString('ar-EG')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-24 text-gray-400">
                        <Users className="w-14 h-14 mb-4 text-gray-300 mx-auto" />
                        <h4 className="font-extrabold text-slate-850 text-sm mb-1">لم يتم اختيار أي مستخدم للمراجعة</h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">اضغط على أحد الحسابات في القائمة الجانبية لقراءة تفاصيل سجله بالكامل واتخاذ الإجراءات.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAYMENT METHODS MANAGEMENT TAB PANEL */}
          {activeTab === 'payment_methods' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">بوابة التحكم في طرق الدفع والشحن المالي</h3>
                  <p className="text-[10px] text-slate-500 mt-1">ضبط وسائط الدفع للمتجر والطلبات (شام كاش، العملات الرقمية USDT، والحسابات البنكية المباشرة).</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPaymentMethod(null);
                    setPmName('');
                    setPmType('sham_cash');
                    setPmAccountName('');
                    setPmAccountNumber('');
                    setPmInstructions('');
                    setPmNetworkName('');
                    setPmCurrencyName('');
                    setPmWalletAddress('');
                    setPmQrFile(null);
                    setPmIsActive(1);
                    setShowPaymentModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة طريقة دفع جديدة</span>
                </button>
              </div>

              {/* Grid of payment ways */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="border border-gray-150 bg-slate-50/50 rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start border-b border-gray-150 pb-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{pm.name}</h4>
                        <span className="text-[9.5px] text-gray-500 mt-0.5 block font-sans">
                          النوع: {pm.type === 'sham_cash' ? 'شام كاش / محفظة محلية' : 'عملات رقمية مشفرة'}
                        </span>
                      </div>
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${pm.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {pm.is_active === 1 ? 'مفعلة' : 'معطلة'}
                      </span>
                    </div>

                    {pm.type === 'sham_cash' ? (
                      <div className="text-xs space-y-1.5 text-slate-800">
                        <p>👤 اسم الحساب المعتمد: <strong className="text-slate-950">{pm.account_name || 'غير محدد'}</strong></p>
                        <p>🔢 رقم الحساب / المحفظة: <strong className="text-slate-950 font-sans">{pm.account_number || 'غير محدد'}</strong></p>
                      </div>
                    ) : (
                      <div className="text-xs space-y-1.5 text-slate-800">
                        <p>🌐 إسم الشبكة: <strong className="text-slate-950 font-sans">{pm.network_name || 'USDT TRC20'}</strong></p>
                        <p>🪙 العملة: <strong className="text-slate-950 font-sans">{pm.currency_name || 'USDT'}</strong></p>
                        <p className="truncate">🔑 عنوان المحفظة (Address): <strong className="text-slate-950 font-mono text-[10px] block mt-0.5 bg-white border p-1 rounded font-medium truncate">{pm.wallet_address || 'غير محدد'}</strong></p>
                      </div>
                    )}

                    {pm.instructions && (
                      <div className="bg-white border rounded-xl p-2.5 text-[10px] text-slate-600 leading-relaxed">
                        ⚠️ تعليمات الدفع: {pm.instructions}
                      </div>
                    )}

                    {pm.qr_key && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">رمز الدفع السريع QR:</span>
                        <div 
                          onClick={() => setSelectedKycImage(pm.qr_key)}
                          className="w-10 h-10 border rounded bg-white overflow-hidden cursor-pointer"
                        >
                          <img src={`/api/image/${pm.qr_key}`} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2.5 border-t border-gray-150 pt-3.5 mt-auto">
                      <button
                        onClick={() => {
                          setEditingPaymentMethod(pm);
                          setPmName(pm.name);
                          setPmType(pm.type);
                          setPmAccountName(pm.account_name || '');
                          setPmAccountNumber(pm.account_number || '');
                          setPmInstructions(pm.instructions || '');
                          setPmNetworkName(pm.network_name || '');
                          setPmCurrencyName(pm.currency_name || '');
                          setPmWalletAddress(pm.wallet_address || '');
                          setPmIsActive(pm.is_active);
                          setPmQrFile(null);
                          setShowPaymentModal(true);
                        }}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border font-extrabold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل المعطيات</span>
                      </button>
                      <button
                        onClick={() => handleDeletePaymentMethod(pm.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-3 py-2 rounded-xl transition shadow-sm flex items-center justify-center"
                        title="حذف طريقة الدفع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <div className="col-span-2 text-center py-16 bg-slate-50 rounded-2xl border border-dashed text-gray-400">
                    لا يوجد طرق دفع معرفة حالياً بالمتجر، يرجى إضافة طريقة لتسهيل إرسال الأموال من المشترين.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SOCIAL LINKS TAB PANEL */}
          {activeTab === 'social_links' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">روابط مواقع التواصل الاجتماعي وخدمة العملاء</h3>
                  <p className="text-[10px] text-slate-500 mt-1">إضافة، تعديل، وإخفاء منصات الاتصال الاجتماعي المعروضة في الصفحة الرئيسية للمتجر.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingSocialLink(null);
                    setSlPlatform('facebook');
                    setSlUrl('');
                    setSlIsActive(1);
                    setShowSocialModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>ربط منصة تواصل جديدة</span>
                </button>
              </div>

              {/* Links displaying grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-2">
                {socialLinks.map((link) => (
                  <div key={link.id} className="bg-slate-50 border border-gray-150 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-black text-slate-800 text-xs uppercase">{link.platform}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${link.is_active === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {link.is_active === 1 ? 'نشط' : 'معطل'}
                      </span>
                    </div>

                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10.5px] font-sans text-amber-600 hover:underline truncate dir-ltr block text-left"
                    >
                      {link.url}
                    </a>

                    <div className="flex gap-2 border-t pt-3 mt-auto">
                      <button
                        onClick={() => {
                          setEditingSocialLink(link);
                          setSlPlatform(link.platform);
                          setSlUrl(link.url);
                          setSlIsActive(link.is_active);
                          setShowSocialModal(true);
                        }}
                        className="flex-1 bg-white hover:bg-slate-100 border text-slate-700 text-xs py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>تعديل</span>
                      </button>
                      <button
                        onClick={() => handleDeleteSocialLink(link.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs p-1.5 rounded-xl transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {socialLinks.length === 0 && (
                  <div className="col-span-3 text-center py-12 bg-slate-50 rounded-2xl border text-gray-400 text-xs">
                    يرجى إضافة حساب للفيسبوك أو الإنستغرام أو الواتساب لعرضهم للشراء والتواصل مع عملائكم.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI SETTINGS CONFIGURATION TAB PANEL */}
          {activeTab === 'ai_settings' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="font-extrabold text-slate-900 text-base">مستشار وموظف الذكاء الاصطناعي الذكي للمتجر</h3>
                <p className="text-[10px] text-slate-500 mt-1">تحديد طابع ومظهر مساعد مركز الرضوان الذكي، تفعيل الرد الصوتي والمستندات المصورة، ورسم التعليمات التأسيسية الصارمة.</p>
              </div>

              <div className="flex flex-col gap-5 max-w-3xl">
                {/* Enable toggle block */}
                <div className="bg-slate-50 border p-4.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">حالة المساعد الذكي العائم بالموقع</h4>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">عند تفعيله، تنبثق أيقونة مستشار مبيعات الرضوان الصاروخي لجميع الزوار.</span>
                  </div>
                  <button
                    onClick={() => setAiIsEnabled(prev => prev === 1 ? 0 : 1)}
                    className={`font-sans font-black text-xs px-4 py-2 rounded-xl shadow-sm transition ${
                      aiIsEnabled === 1 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {aiIsEnabled === 1 ? 'مفعــل الآن' : 'معطــل'}
                  </button>
                </div>

                {/* Analytics & Stats Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 text-right" dir="rtl">
                  {/* Total conversations count card */}
                  <div className="bg-slate-900 bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-5 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-300 font-bold block">إجمالي استخدامات ومحادثات مساعد الرضوان</span>
                      <h4 className="font-extrabold text-2xl font-mono mt-1 text-amber-400">{aiSettings?.usage_count || 0} محادثة</h4>
                    </div>
                    <Bot className="w-10 h-10 text-amber-400/40 shrink-0" />
                  </div>

                  {/* Top Popular questions list card */}
                  <div className="bg-slate-50 border border-gray-150 p-4 rounded-2xl flex flex-col gap-2 max-h-[150px] overflow-y-auto">
                    <span className="text-[10px] text-slate-500 font-extrabold block">📈 الأسئلة الأكثر تكراراً وطلباً من العملاء:</span>
                    <div className="flex flex-col gap-1.5">
                      {((aiSettings?.popular_questions && aiSettings.popular_questions.length > 0) ? aiSettings.popular_questions : [
                        { question: "كم سعر طن الحديد المقاوم للزلازل اليوم؟", count: 15 },
                        { question: "ما هي شروط توثيق الحساب بالهوية الهندسية؟", count: 11 },
                        { question: "كيف يمكنني الدفع عبر شام كاش؟", count: 8 },
                        { question: "هل يتوفر توصيل لريف دمشق؟", count: 6 },
                        { question: "ما هي أسعار الإسمنت البورتلاندي اليوم؟", count: 5 }
                      ]).map((q: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-white border border-gray-100 p-1.5 px-2.5 rounded-xl text-[10px]">
                          <span className="text-slate-755 font-medium truncate max-w-[200px]" title={q.question}>{q.question}</span>
                          <span className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-md font-mono">{q.count} مرة</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Personality Guidelines and Custom Guidelines */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-800 pr-0.5">رسالة الترحيب والافتتاح الافتراضية *</label>
                  <p className="text-[9.5px] text-gray-400 pb-1 pr-0.5">الرسالة الترحيبية اللبقة التي يعرضها مستشار الرضوان فور فتح الزوار الحوار الذكي.</p>
                  <input
                    type="text"
                    value={aiWelcomeMessage}
                    onChange={(e) => setAiWelcomeMessage(e.target.value)}
                    placeholder="مرحباً بك في مركز الرضوان البنياني الموحد! كيف يمكنني مساعدتكم في تصفح المنتجات والتسعير وحسابات فواتير البناء اليوم؟"
                    className="w-full bg-white border border-gray-250 p-3 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 text-right"
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-800 pr-0.5">تعليمات النظام وسلوك المساعد الذكي (System Instruction) *</label>
                  <p className="text-[9.5px] text-gray-400 pb-1 pr-0.5">القواعد الأساسية والقوانين التشغيلية الصارمة التي يتحلى بها محرك المساعد لتسوية الكتالوج والأسعار.</p>
                  <textarea
                    rows={4}
                    value={aiSystemInstruction}
                    onChange={(e) => setAiSystemInstruction(e.target.value)}
                    placeholder="أدخل هنا تعليمات النظام الصارمة..."
                    className="w-full bg-white border border-gray-250 p-3.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 text-right font-medium leading-relaxed"
                    dir="rtl"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-800 pr-0.5">طابع شخصية ونبرة حديث المساعد (Personality & Tone / Syrian Accent) *</label>
                  <p className="text-[9.5px] text-gray-400 pb-1 pr-0.5">التأطير اللفظي والشخصي للمستشار لضمان تفاعله بالأسلوب السوري المهني الدافئ واللطيف.</p>
                  <textarea
                    rows={4}
                    value={aiPersonality}
                    onChange={(e) => setAiPersonality(e.target.value)}
                    placeholder="مثال: خبير ومقاول سوري متمرس يتحدث بلهجة دمشقية محببة، يرحب بالزبائن بلباقة ويقدم الاستشسار الإنشائي..."
                    className="w-full bg-white border border-gray-250 p-3.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 text-right font-medium leading-relaxed"
                    dir="rtl"
                  />
                </div>

                {/* STRICT MODE TRAINING AND ADMIN INSTRUCTION SETS CARD */}
                <div className="bg-emerald-50 bg-opacity-40 border border-emerald-200 p-5 rounded-2xl flex flex-col gap-4 text-right" dir="rtl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>تأهيل وتدريب المساعد الذكي بأوامر صارمة (Strict AI Training Mode)</span>
                      </h4>
                      <span className="text-[10px] text-zinc-600 mt-0.5 block">عند تفعيل هذا الخيار، سيتم إلزام المساعد بالرد المطلق بالأوامر المدخلة أدناه فقط ورفض أي أسلوب آخر للرد تلتزم به حرفياً.</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setAiIsStrict(prev => prev === 1 ? 0 : 1)}
                      className={`font-sans font-black text-[11px] px-3.5 py-1.5 rounded-lg shadow-sm transition ${
                        aiIsStrict === 1 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {aiIsStrict === 1 ? 'وضعية الإلزام نشطة 🔒' : 'إلزام مغلق'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[11px] font-black text-emerald-950 flex items-center gap-1">
                      <span>الأوامر والتوجيهات الإلزامية التي ستجيب بها حصراً:</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md self-center font-bold">صارم للغاية</span>
                    </label>
                    <p className="text-[9px] text-emerald-800/80 leading-relaxed">
                      هنا يكتب المدير الأوامر التفصيلية أو الردود الجاهزة والأسلوب الحصري الذي يرغب بأن يتحدث المساعد به مع العملاء. سيقوم النموذج بالالتزام التام حرفياً بما تكتبه هنا بنسبة 100%.
                    </p>
                    <textarea
                      rows={5}
                      value={aiStrictCommands}
                      onChange={(e) => setAiStrictCommands(e.target.value)}
                      placeholder="اكتب هنا السيناريو أو القواعد التي تفرض على الذكاء الاصطناعي الرد بموجبها فقط، مثلاً:&#10;- إذا سأل العميل عن أسعار الحديد، قل له فوراً أنه يجب التواصل مع المشرف محمود على الواتساب ولا تعطه أسعاراً عشوائية.&#10;- تكلم بنبرة بنت عمرها عشرين سنة ودودة ترحب بالجميع بعبارة: أهلاً بك يا غالي بمركز الرضوان المتميز."
                      className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* ADVANCED ADMIN VOICE RECORDER & FILE TRIGGER ASSIGNER */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col gap-4 text-right mt-1" dir="rtl">
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-xs flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span>إدارة الردود والمسجلات الصوتية الفورية (Live Admin Mic & Speech Triggers)</span>
                    </h4>
                    <span className="text-[10px] text-zinc-600 mt-1 block">قم بتسجيل صوتك كمسؤول أو رفع ملف تعليق جاهز (MP3/WAV) وربطه بـ "مفتاح استجابة" محدد ليتم إرساله تلقائياً للأعضاء عند استشعار نية دعم فني.</span>
                  </div>

                  <div className="border border-slate-150 rounded-xl bg-white p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-2.5 border-b border-gray-100">
                      <span className="text-[11px] font-black text-slate-800">📌 مفتاح الاستجابة البرمجي للتحويل التلقائي:</span>
                      <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-800 px-2 py-0.5 rounded-lg font-mono font-bold">Trigger: Technical_Support_Request</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {/* Live microphone option */}
                      <div className="bg-slate-50 p-4.5 rounded-xl border border-dashed border-gray-250 flex flex-col items-center justify-center gap-3">
                        <span className="text-[11px] font-extrabold text-slate-700">الخيار الأول: التسجيل المباشر بالميكروفون</span>
                        {isRecording ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[11.5px] text-red-650 font-mono font-bold animate-pulse flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-650 inline-block" />
                              جاري تسجيل الصوت: {recordingDuration} ثانية...
                            </span>
                            <button
                              type="button"
                              onClick={stopMicrophoneRecording}
                              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition flex items-center gap-1.5 text-xs font-bold"
                            >
                              <Square className="w-4 h-4 hover:scale-105 transition" />
                              إيقاف التسجيل والحفظ
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startMicrophoneRecording}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-3 px-5 rounded-xl shadow-sm transition flex items-center gap-2 text-xs font-black"
                          >
                            <Mic className="w-4 h-4 text-slate-900" />
                            ابدأ تسجيل صوتي فوري
                          </button>
                        )}
                      </div>

                      {/* File Upload option */}
                      <div className="bg-slate-50 p-4.5 rounded-xl border border-dashed border-gray-250 flex flex-col items-center justify-center gap-3.5">
                        <span className="text-[11px] font-extrabold text-slate-700">الخيار الثاني: رفع ملف تسجيلي جاهز</span>
                        <label className="bg-slate-800 hover:bg-slate-900 text-white p-3 px-5 rounded-xl shadow-sm cursor-pointer transition flex items-center gap-2 text-xs font-bold">
                          <Upload className="w-4 h-4 text-white" />
                          <span>اختر ملف من جهازك (MP3/WAV)</span>
                          <input
                            type="file"
                            accept=".mp3,.wav,audio/*"
                            onChange={handleAudioFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Show saved status */}
                    <div className="mt-2 pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400">الحالة والمحفوظات الصادرة حالياً:</span>
                      {voiceTriggers && voiceTriggers.length > 0 ? (
                        voiceTriggers.map((trg: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl text-right">
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4 text-emerald-600 shrink-0 animation-bounce" />
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-extrabold text-[10px]">{trg.filename}</span>
                                <span className="text-slate-400 text-[8px] font-mono">تاريخ التوثيق: {new Date(trg.updated_at).toLocaleString('ar-SY')}</span>
                              </div>
                            </div>
                            <audio 
                              controls 
                              src={`data:${trg.mime_type};base64,${trg.audio_base64}`} 
                              className="h-8 max-w-[180px] sm:max-w-[220px]" 
                            />
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-3 text-red-500 bg-red-50/50 rounded-xl font-bold text-[10px]">
                          ⚠️ لا تتوفر أي رسالة تعليق صوتي مسجلة لطلب الدعم الفني حالياً. يرجى المبادرة بالتسجيل أو الرفع لمنع تهميش طلب المساعدة البشرية للزوار.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex bg-amber-50 border border-amber-200/60 p-4 rounded-xl items-start gap-3 mt-1">
                  <Bot className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-right text-[11px] text-slate-700 leading-relaxed">
                    <strong>💡 توجيهات بخصوص تحضير وربط الأسعار:</strong> يمتلك المساعد المدمج قدرة ممتازة لربط روابط المنتجات وإرشاد عملائكم لأسعار السلع وقراء صلب الطلبات المتاحة بالمعرض بشكل تلقائي وآمن وتفصيلي بالخلفية.
                  </div>
                </div>

                <button
                  onClick={handleSaveAiSettings}
                  className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs py-3 rounded-xl transition shadow-md mt-2"
                >
                  حفظ وتطبيق إعدادات الذكاء الاصطناعي فوراً ✨
                </button>
              </div>
            </div>
          )}

          {/* SHAM CASH / CRYPTO PAYMENT DIALOG POP MODAL */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-right" dir="rtl">
              <div className="absolute inset-0" onClick={() => setShowPaymentModal(false)} />
              <div className="relative max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl z-10 transition animate-popup max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingPaymentMethod ? 'تعديل طريقة الدفع والتحويل' : 'إضافة طريقة دفع وتحويل جديدة للمتجر'}
                  </h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePaymentMethod} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700">إسم طريقة الدفع والبنك (مثال: محفظة شام كاش، بايير USDT) *</label>
                    <input
                      type="text"
                      required
                      value={pmName}
                      onChange={(e) => setPmName(e.target.value)}
                      placeholder="املاء الإسم الشائع..."
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700 font-sans">تصنيف وتوصيف بواب الدفع الموفر *</label>
                    <select
                      value={pmType}
                      onChange={(e: any) => setPmType(e.target.value)}
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold"
                    >
                      <option value="sham_cash">حساب محلي / شام كاش أو بيمو</option>
                      <option value="crypto">العملات الرقمية المشفرة (Crypto Wallet)</option>
                    </select>
                  </div>

                  {pmType === 'sham_cash' ? (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700">إسم صاحب الحساب الثنائي والرباعي *</label>
                        <input
                          type="text"
                          value={pmAccountName}
                          onChange={(e) => setPmAccountName(e.target.value)}
                          placeholder="مثال: محمد الرضوان"
                          className="bg-slate-50 border p-2.5 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700 font-sans">رقم الحساب / كود المحفظة *</label>
                        <input
                          type="text"
                          value={pmAccountNumber}
                          onChange={(e) => setPmAccountNumber(e.target.value)}
                          placeholder="مثال: 963900111222"
                          className="bg-slate-50 border p-2.5 rounded-xl text-xs text-right font-sans"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700 font-sans">شبكة نقل العملة (Network Name) *</label>
                        <input
                          type="text"
                          value={pmNetworkName}
                          onChange={(e) => setPmNetworkName(e.target.value)}
                          placeholder="مثال: TRC20, BEP20, BSC"
                          className="bg-slate-50 border p-2.5 rounded-xl text-xs text-right font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700 font-sans">رمز العملة (Currency Name) *</label>
                        <input
                          type="text"
                          value={pmCurrencyName}
                          onChange={(e) => setPmCurrencyName(e.target.value)}
                          placeholder="مثال: USDT, BTC, ETH"
                          className="bg-slate-50 border p-2.5 rounded-xl text-xs font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-slate-700 font-sans">عنوان المحفظة الرقمية المستلم بالأحرف والرموز (Address) *</label>
                        <input
                          type="text"
                          value={pmWalletAddress}
                          onChange={(e) => setPmWalletAddress(e.target.value)}
                          placeholder="0x9374Bf...أو T..."
                          className="bg-slate-50 border p-2.5 rounded-xl text-[11px] font-mono font-bold"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700">شرح لطريقة الدفع والتحويل في الفاتورة للعميل</label>
                    <textarea
                      rows={2}
                      value={pmInstructions}
                      onChange={(e) => setPmInstructions(e.target.value)}
                      placeholder="املاء أي نصائح للعميل للتحويل وتأكيد إرسال الإشعار..."
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700">تحميل والتقاط رمز الاستجابة السريعة QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPmQrFile(file);
                      }}
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs font-sans cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="pm_active"
                      checked={pmIsActive === 1}
                      onChange={(e) => setPmIsActive(e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="pm_active" className="text-xs font-bold text-slate-700 cursor-pointer select-none">طريقة الدفع مفعلة وتظهر فوراً للمشترين</label>
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition shadow-md mt-3"
                  >
                    🚀 حفظ معطيات طريقة الدفع والتحويل بنجاح
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* SOCIAL MEDIA EDIT DIALOG POP MODAL */}
          {showSocialModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-right" dir="rtl">
              <div className="absolute inset-0" onClick={() => setShowSocialModal(false)} />
              <div className="relative max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl z-10 transition animate-popup">
                <div className="flex justify-between items-center pb-3 border-b mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingSocialLink ? 'تعديل معطيات منصة السوشيال ميديا' : 'تفعيل وربط رابط منصة تواصل جديدة'}
                  </h3>
                  <button onClick={() => setShowSocialModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveSocialLink} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700">اختر المنصة المعتمدة الموفرة *</label>
                    <select
                      value={slPlatform}
                      onChange={(e) => setSlPlatform(e.target.value)}
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs font-bold"
                    >
                      <option value="facebook">فيسبوك (Facebook)</option>
                      <option value="instagram">انستجرام (Instagram)</option>
                      <option value="whatsapp">واتساب (WhatsApp)</option>
                      <option value="telegram">تلجرام (Telegram)</option>
                      <option value="tiktok">تيك توك (TikTok)</option>
                      <option value="youtube">يوتيوب (YouTube)</option>
                      <option value="twitter">إكس X / تويتر</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-700">رابط الصفحة أو رقم الواتساب بالكامل *</label>
                    <input
                      type="url"
                      required
                      value={slUrl}
                      onChange={(e) => setSlUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-slate-50 border p-2.5 rounded-xl text-xs font-sans text-left dir-ltr"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="sl_active"
                      checked={slIsActive === 1}
                      onChange={(e) => setSlIsActive(e.target.checked ? 1 : 0)}
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="sl_active" className="text-xs font-bold text-slate-700 cursor-pointer select-none">رابط المنصة مفعل ويظهر بالرئيسية</label>
                  </div>

                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-3 rounded-xl transition shadow-md mt-3"
                  >
                    حفظ وإقرار الرابط
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* IDENTITY VERIFICATION KYC PANEL */}
          {activeTab === 'kyc' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">تدقيق هويات الأعضاء وتفعيل الحسابات</h3>
                  <p className="text-[10px] text-slate-500 mt-1 pb-1">مراجعة الملفات الواردة، تفعيل الشارة الزرقاء الموثقة، أو رفض المستند مع تبيان سبب الرفض.</p>
                </div>
                <button
                  onClick={fetchPendingKyc}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shrink-0"
                >
                  تحديث فوري للقائمة
                </button>
              </div>

              {isLoadingKyc ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs text-gray-400">جاري مسح بقايا طلبات التحقق الجارية...</span>
                </div>
              ) : pendingKycUsers.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-gray-200 rounded-2xl">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <Check className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-slate-850 text-sm mb-1">صندوق طلبات التحقق خالٍ تماماً</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">لقد تم الانتهاء والبت بجميع معاملات تدقيق الهوية لمركز الرضوان بنجاح.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingKycUsers.map((user) => {
                    const kyc = user.kycData || {};
                    return (
                      <div key={user.id} className="relative bg-slate-50 rounded-2xl border border-gray-200 p-5 flex flex-col gap-3.5 hover:shadow-md transition">
                        {/* Summary Header */}
                        <div className="flex items-start justify-between border-b border-gray-150 pb-2">
                          <div>
                            <h4 className="font-black text-slate-900 text-sm">{kyc.fullName || user.name}</h4>
                            <span className="text-[10px] text-gray-500 font-sans block mt-0.5">{user.email}</span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full">{kyc.idType || "هوية وطنية"}</span>
                        </div>

                        {/* Country context */}
                        <div className="text-xs font-semibold text-slate-800">
                          📍 بلد الإقامة والتحقق: <span className="bg-white border px-2 py-0.5 rounded-lg text-[11px] font-bold">{kyc.country || "غير محدد"}</span>
                        </div>

                        {/* Thumbnails of documents */}
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex flex-col gap-1 shrink-0">
                            <span className="text-[9px] text-slate-500 font-bold block pr-0.5">الوجه الأمامي</span>
                            <div 
                              onClick={() => kyc.idFrontImage && setSelectedKycImage(kyc.idFrontImage)}
                              className="w-20.5 h-16 bg-gray-200 rounded-xl overflow-hidden border border-gray-300 relative group cursor-pointer hover:border-amber-400 opacity-90 hover:opacity-100 transition"
                            >
                              <img 
                                src={`/api/image/${kyc.idFrontImage}`} 
                                alt="Face frontal" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0">
                            <span className="text-[9px] text-slate-500 font-bold block pr-0.5">الوجه الخلفي</span>
                            <div 
                              onClick={() => kyc.idBackImage && setSelectedKycImage(kyc.idBackImage)}
                              className="w-20.5 h-16 bg-gray-200 rounded-xl overflow-hidden border border-gray-300 relative group cursor-pointer hover:border-amber-400 opacity-90 hover:opacity-100 transition"
                            >
                              <img 
                                src={`/api/image/${kyc.idBackImage}`} 
                                alt="Face backside" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>

                          <span className="text-[9.5px] text-slate-400 font-semibold pr-1 break-words max-w-[120px] font-sans">
                            * اضغط للمشاهدة وحفظ التفاصيل ملئ الشاشة لتكبير الصور بدقة.
                          </span>
                        </div>

                        {/* Rejection input and Action Controllers */}
                        <div className="mt-4 pt-3 border-t border-slate-150 flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-600 pr-0.5">اكتب سبب الرفض في حال عدم المطابقة *</label>
                            <input
                              type="text"
                              value={rejectionReasons[user.id] || ''}
                              onChange={(e) => setRejectionReasons(prev => ({ ...prev, [user.id]: e.target.value }))}
                              placeholder="مثال: صور المستند ضبابية وغير مطابقة للإسم الكامل"
                              className="w-full bg-white border border-gray-250 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-rose-45"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => handleKycApprove(user.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>قبول التفعيل</span>
                            </button>

                            <button
                              onClick={() => handleKycReject(user.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              <span>رفض التفعيل</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECURE DATA PROTECTION & BACKUPS COMPONENT */}
          {activeTab === 'backup_protection' && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm text-right flex flex-col gap-6">
              
              {/* Header Title section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse shrink-0" />
                    <span>نظام الحفظ الموحد والأمان اللحظي للبيانات</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1">تشفير متكامل لكافة البيانات الحساسة المخزنة (At-Rest Encryption) مع تكرار وحفظ فوري لمنع فقدان أي مدخلات.</p>
                </div>
                
                <button
                  onClick={handleTriggerManualBackup}
                  disabled={isTriggeringBackup}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl transition shadow-md flex items-center gap-2 shrink-0 border border-amber-400 cursor-pointer"
                >
                  {isTriggeringBackup ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>جاري التشفير والأرشفة...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-slate-900" />
                      <span>إجراء نسخة أرشفة أمنية مشفرة فوراً</span>
                    </>
                  )}
                </button>
              </div>

              {/* Bento Indicator metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">حجم قاعدة البيانات النشطة</span>
                  <div>
                    <span className="text-xl font-black text-slate-950 font-sans block">
                      {backupsInfo ? (backupsInfo.dbSize / 1024).toFixed(2) : "0.00"} KB
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">قراءة حية للقرص الصلب للفرع</span>
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">نسق تشفير التخزين</span>
                  <div>
                    <span className="text-sm font-black text-slate-900 font-sans block text-emerald-600">
                      AES-256-CBC (نشط)
                    </span>
                    <span className="text-[9.5px] text-zinc-550 block mt-0.5">تشفير عالي الكفاءة (At-Rest)</span>
                  </div>
                </div>

                <div className="bg-emerald-50/10 border border-emerald-200/60 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-emerald-800 font-bold block mb-1">حالة تكرار البيانات (Redundancy)</span>
                  <div>
                    <span className="text-xs font-black text-emerald-700 font-sans block flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>فعال ومتطابق (Synced)</span>
                    </span>
                    <span className="text-[9px] text-emerald-600/80 block mt-0.5">جاهز للتغلب على كوارث المخدم</span>
                  </div>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-500 font-bold block mb-1">الحفظ التلقائي (Auto-Save)</span>
                  <div>
                    <span className="text-xs font-black text-slate-900 block flex items-center gap-1">
                      <span className="text-emerald-500">●</span>
                      <span>لحظي ومؤتمت</span>
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">جدولة دورية كل 12 ساعة بالخلفية</span>
                  </div>
                </div>
              </div>

              {/* Backups List Audit Logs Table */}
              <div className="flex flex-col gap-2 mt-2">
                <h4 className="text-xs font-black text-slate-800 pr-1">سجل نُسخ الحفظ والتحقق من التشفير والـ SHA-256</h4>
                
                {isLoadingBackups ? (
                  <div className="py-20 flex flex-col items-center justify-center bg-slate-50 border border-dashed rounded-2xl">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs text-gray-400">جاري مسح النسخ وتدقيق ملفات الأرشفة بالخادم...</span>
                  </div>
                ) : !backupsInfo || !backupsInfo.backups || backupsInfo.backups.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 border border-dashed rounded-2xl">
                    <p className="text-xs text-slate-400">لا يوجد نسخ أرشفة مسجلة في الوقت الراهن.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-150 rounded-2xl bg-white">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-gray-150 text-slate-705">
                          <th className="p-3.5 font-bold">اسم الملف ونموذج التوثيق</th>
                          <th className="p-3.5 font-bold">تاريخ وساعة الإنشاء</th>
                          <th className="p-3.5 font-bold">الحجم</th>
                          <th className="p-3.5 font-bold">نوع الأرشفة</th>
                          <th className="p-3.5 font-bold">مستوى التشفير والـ SHA-256 Checksum</th>
                          <th className="p-3.5 font-bold text-center">إجراءات المزامنة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans">
                        {backupsInfo.backups.map((item: any) => {
                          const displayDate = new Date(item.timestamp).toLocaleString('ar-SY', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          return (
                            <tr key={item.filename} className="hover:bg-slate-50/50">
                              <td className="p-3.5 font-bold text-slate-900 font-sans">{item.filename}</td>
                              <td className="p-3.5 text-gray-500 font-sans">{displayDate}</td>
                              <td className="p-3.5 font-sans font-bold text-slate-800">{(item.size / 1024).toFixed(2)} KB</td>
                              <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  item.type === 'automatic' 
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {item.type === 'automatic' ? 'تلقائي مجدول' : 'يدوي فوري'}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <div className="flex flex-col gap-0.5 text-right font-sans">
                                  <span className="text-emerald-600 font-bold text-[9.5px]">AES-256 (مشفر آمن)</span>
                                  <span className="text-[8px] font-mono text-slate-400 block max-w-[200px] truncate" title={item.checksum}>
                                    SHA: {item.checksum}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleRestoreBackup(item.filename)}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-750 font-sans border border-emerald-200 px-3 py-1.5 rounded-lg text-[10px] font-black transition cursor-pointer"
                                    title="استعادة حالة المنصة فوراً لهذه النسخة"
                                  >
                                    استعادة ومزامنة 🔄
                                  </button>
                                  
                                  <button
                                    onClick={() => handleDeleteBackup(item.filename)}
                                    className="bg-rose-50 hover:bg-rose-105 text-rose-600 border border-rose-150 p-1.5 rounded-lg transition cursor-pointer"
                                    title="حذف الأرشيف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Architecture diagram alert guideline info */}
              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl flex items-start gap-3 mt-1.5 font-sans">
                <div className="w-9 h-9 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center shrink-0 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h5 className="font-extrabold text-white text-xs leading-none">ملاحظة أمنية فنية لمطوري المنصة والمشرف العام</h5>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    يعمل نسيج الحماية المطور (Storage Architecture) بتكامل تام في الخلفية. يتم تشفير كافة ملفات الأرشفة والملفات المرفوعة فوراً باستخدام مفتاح حماية قياسي عسكري متطابق ومجهول. لحماية كفاءة الخادم، يتم الاحتفاظ بـ 10 نسخ لرفع الكفاءة وتلافي كوارث القرص الصلب.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* FULL SCREEN IMAGE VIEWER MODAL */}
          {selectedKycImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
              <div className="absolute inset-0" onClick={() => setSelectedKycImage(null)} />
              <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 p-3 rounded-2xl border border-slate-700 shadow-2xl flex flex-col z-10 transition animate-popup">
                <button 
                  onClick={() => setSelectedKycImage(null)} 
                  className="absolute top-4 right-4 bg-black/40 hover:bg-black/80 text-white p-2 rounded-full transition z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                <img 
                  src={`/api/image/${selectedKycImage}`} 
                  alt="KYC Document Preview" 
                  className="max-w-full max-h-[80vh] object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};



================================================================================
الملف: src/views/AdsView.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Ad } from '../types';
import { 
  Megaphone, 
  PlusCircle, 
  MessageSquare, 
  Phone, 
  Clock, 
  X, 
  Image as ImageIcon,
  User, 
  Sparkles,
  Lock,
  Pin,
  Eye
} from 'lucide-react';
import { VerifiedBadge } from '../components/VerifiedBadge';

export const AdsView: React.FC = () => {
  const { user, showToast, setShowAuthModal, setShowKycModal, setViewProfileUserId } = useApp();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAdForDetails, setSelectedAdForDetails] = useState<Ad | null>(null);
  const [adViewsMap, setAdViewsMap] = useState<Record<number, number>>({});
  
  // Create state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data);
        
        // Initialize views Map
        const views: Record<number, number> = {};
        data.forEach((item: any) => {
          views[item.id] = item.view_count || 0;
        });
        setAdViewsMap(views);
      }
    } catch (e) {
      console.error(e);
      showToast('فشل جلب الإعلانات النشطة من القنوات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdDetails = async (ad: Ad) => {
    setSelectedAdForDetails(ad);
    
    // Register details view count increments (+1)
    try {
      const res = await fetch(`/api/ads/${ad.id}/view`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.view_count === 'number') {
          setAdViewsMap(prev => ({
            ...prev,
            [ad.id]: data.view_count
          }));
        }
      }
    } catch (e) {
      console.error('Error recording ad views:', e);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contact.trim()) {
      showToast('يرجى كتابة العنوان والوصف وقنوات الاتصال بالفرد', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let image_key: string | null = null;

      // Handle image upload if selected
      if (selectedImage) {
        // Compress image first
        const compressImage = (file: File): Promise<File> => {
          return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
              resolve(file);
              return;
            }
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
              URL.revokeObjectURL(img.src);
              const MAX_WIDTH = 1600;
              const MAX_HEIGHT = 1600;
              let width = img.width;
              let height = img.height;
              
              if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                if (width > height) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                } else {
                  width = Math.round((width * MAX_HEIGHT) / height);
                  height = MAX_HEIGHT;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(file);
                return;
              }
              ctx.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], file.name || "image.jpg", {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  }));
                } else {
                  resolve(file);
                }
              }, 'image/jpeg', 0.85);
            };
            img.onerror = () => resolve(file);
          });
        };

        const compressed = await compressImage(selectedImage);
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressed);
          reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
          reader.onerror = e => reject(e);
        });

        const uploadRes = await fetch('/api/image/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            mimeType: compressed.type
          })
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          image_key = uploadData.key;
        } else {
          showToast('فشل تحميل الصورة المرفقة، جاري استكمال تخزين الإعلان بدون صورة', 'info');
        }
      }

      // Create ad call
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, contact, image_key })
      });

      if (res.ok) {
        showToast('تم إشهار ونشر إعلانك بنجاح في سوق مركز الرضوان', 'success');
        setTitle('');
        setDescription('');
        setContact('');
        setSelectedImage(null);
        setShowCreateModal(false);
        fetchAds();
      } else {
        const err = await res.json();
        showToast(err.error || 'عذراً، لم تنجح عملية النشر', 'error');
      }
    } catch {
      showToast('خطأ بالشبكة عند إرسال الإعلان المبوب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'مؤخراً';
    const date = new Date(timestamp);
    return date.toLocaleDateString('ar-SY', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="w-full bg-slate-50 font-sans text-right min-h-screen pb-16" dir="rtl">
      {/* Page Header */}
      <div className="bg-gradient-to-l from-slate-900 to-amber-955 text-white bg-slate-900 py-10 px-4 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2">
              <Megaphone className="w-6.5 h-6.5 text-amber-500 animate-pulse" />
              <span>سوق الإعلانات المبوبة للمجتمع</span>
            </h1>
            <p className="text-slate-300 text-xs mt-2 max-w-lg leading-relaxed">
              تصفح أو انشر مستلزمات البناء المستعملة، العقارات، الشاحنات والعتاد، أو الآلات والعمالة المتوفرة في المنطقة مجاناً!
            </p>
          </div>
          
          <button
            onClick={() => {
              if (!user) {
                showToast('يلزمك تسجيل الدخول أولاً لتتمكن من إضافة إعلان', 'info');
                setShowAuthModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl transition shadow-lg shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            <span>نشر إعلان مجاني الآن</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-xs text-gray-500 font-sans">جاري استخلاص لوحة الإعلانات الفعالة...</span>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-150 py-24 px-6 text-center shadow-xs">
            <Megaphone className="w-14 h-14 text-orange-200 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-800 text-base mb-1">السوق خالٍ من الإعلانات النشطة</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
              كن السبّاق وانشر سلعك أو آلاتك المعروضة لمطوري البناء والتشييد المشتركين في المنطقة.
            </p>
            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="bg-slate-900 text-white hover:bg-amber-500 px-6 py-3 rounded-xl text-xs font-bold transition"
            >
              طرح أول إعلان مبوب
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <div 
                key={ad.id}
                onClick={() => handleOpenAdDetails(ad)}
                className={`bg-white rounded-2xl border ${ad.is_pinned === 1 ? 'border-amber-400 bg-amber-50/5' : 'border-gray-150'} overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer hover:border-amber-400`}
              >
                {/* Badge corner */}
                {ad.is_pinned === 1 && (
                  <div className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1.5 flex items-center justify-center gap-1">
                    <Pin className="w-3 h-3 text-amber-600 fill-amber-500" />
                    <span>إشهار مميز من الإدارة</span>
                  </div>
                )}

                {/* Ad Image Content */}
                <div className="aspect-[16/10] bg-gray-50 w-full relative overflow-hidden flex items-center justify-center">
                  {ad.image_key ? (
                    <img 
                      src={`/api/image/${ad.image_key}`} 
                      alt={ad.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-300">
                      <ImageIcon className="w-12 h-12" />
                      <span className="text-[10px] text-gray-400 mt-2">لا تتوفر صورة فوتوغرافية</span>
                    </div>
                  )}
                </div>

                {/* Body details */}
                <div className="p-5 flex flex-col flex-1 text-right" dir="rtl">
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2 font-semibold">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>تاريخ النشر: {formatDate(ad.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1 select-none">
                      <Eye className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono">{adViewsMap[ad.id] !== undefined ? adViewsMap[ad.id] : (ad.view_count || 0)} مشاهدة</span>
                    </div>
                  </div>

                  {/* Dynamic Clickable Publisher Profile Badge with Blue Checkmark */}
                  {(ad.owner_id || ad.creator_id || ad.user_id) && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const publisherId = ad.owner_id || ad.creator_id || ad.user_id;
                        if (publisherId) {
                          setViewProfileUserId(publisherId);
                        }
                      }}
                      className="flex items-center gap-1.5 py-1.5 px-2.5 bg-slate-50 hover:bg-amber-50/40 rounded-xl border border-gray-150 cursor-pointer transition mb-3.5 self-start shrink-0 text-right font-sans"
                      title="عرض الملف الشخصي للناشر"
                    >
                      {/* Avatar */}
                      <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center overflow-hidden shrink-0 border border-amber-200/50">
                        {(ad as any).user_avatar ? (
                          <img 
                            src={`/api/image/${(ad as any).user_avatar}`} 
                            alt={ad.owner_name || ''} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[8px] text-amber-600 font-extrabold font-mono">
                            {(ad.owner_name || ad.user_name || "م").substring(0, 1)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-800 truncate leading-none">
                        {ad.owner_name || ad.user_name || 'زائر مسجل'}
                      </span>
                      {((ad as any).user_is_verified || (ad as any).user_kycStatus === 'verified') && (
                        <VerifiedBadge size={14} className="mr-0.5 inline-block" />
                      )}
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-1 leading-snug">{ad.title}</h3>
                  <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed mb-6 flex-1 whitespace-pre-line">
                    {ad.description}
                  </p>

                  {/* Connect buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/${ad.contact.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-250 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 font-semibold text-xs transition"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>محادثة واتساب</span>
                    </a>
                    
                    <a
                      href={`tel:${ad.contact}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال مباشر</span>
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* CREATE AD DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-3xs" onClick={() => setShowCreateModal(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden border border-gray-150 shadow-2xl animate-popup">
            <div className="bg-slate-900 text-white py-5 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-amber-500">نشر عرض / طلب جديد</h3>
                <p className="text-[10px] text-slate-300 mt-0.5">يرجى كتابة معلومات العرض بدقة لتسهيل تواصل الأعضاء</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-white/10 rounded-full text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            {user?.kycStatus === 'verified' ? (
              <form onSubmit={handleCreateAd} className="p-6 flex flex-col gap-4 text-right">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">عنوان الإعلان *</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: خلاطة باطون مستعملة بحالة ممتازة للبيع"
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs sm:text-sm focus:outline-amber-55"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">تفاصيل العرض / المواصفات الفنية المجهرة *</label>
                  <textarea 
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب مواصفات السلعة، الموديل، السعر المطلوب، سبب البيع، الخ..."
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs sm:text-sm focus:outline-amber-55 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">رقم الاتصال والواتساب (مبتدئاً برمز البلد) *</label>
                  <input 
                    type="tel" 
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="مثال: 963955566778"
                    className="w-full px-4 py-2 border border-gray-250 rounded-xl text-xs sm:text-sm focus:outline-amber-55"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700">إرفاق صورة فوتوغرافية (اختياري)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-gray-200 border-dashed rounded-xl px-4 py-2.5 hover:bg-slate-100 transition text-xs text-slate-700">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>اختر ملف الصورة</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                      />
                    </label>
                    <span className="text-xs text-gray-500 truncate max-w-[200px]">
                      {selectedImage ? selectedImage.name : 'ولم يتم اختيار أي كائن'}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full bg-slate-900 hover:bg-amber-500 text-white py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md"
                >
                  <span>تعميم وإشهار الإعلان</span>
                </button>
              </form>
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
                <div className="w-14 h-14 bg-amber-50 border border-amber-200/50 rounded-full flex items-center justify-center text-amber-600 mb-4 animate-pulse">
                  <Megaphone className="w-6.5 h-6.5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">يتطلب تفعيل وثيقة العضوية 🔒</h4>
                <p className="text-xs text-amber-800 bg-amber-50/50 px-5 py-3 rounded-2xl border border-amber-200/30 max-w-sm mt-3 mb-6 font-semibold">
                  يجب توثيق حسابك لتتمكن نشر إعلان
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowKycModal(true);
                  }}
                  className="bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-xl transition shadow-md"
                >
                  توثيق الحساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Ad Details Overlay Modal */}
      {selectedAdForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs text-right font-sans" dir="rtl">
          {/* Click outside backdrop close */}
          <div className="absolute inset-0" onClick={() => setSelectedAdForDetails(null)} />
          
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl z-10 transition animate-popup max-h-[90vh] flex flex-col">
            
            {/* Header toolbar */}
            <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>تفاصيل الإعلان المبوب</span>
              </h3>
              <button 
                onClick={() => setSelectedAdForDetails(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body - scrollable */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              
              {/* Ad Image container */}
              <div className="aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden relative border border-gray-150 flex items-center justify-center shadow-3xs">
                {selectedAdForDetails.is_pinned === 1 && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md z-10">
                    <Pin className="w-3.5 h-3.5" />
                    <span>إعلان مميز</span>
                  </span>
                )}

                {selectedAdForDetails.image_key ? (
                  <img 
                    src={`/api/image/${selectedAdForDetails.image_key}`} 
                    alt={selectedAdForDetails.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="w-16 h-16 stroke-1" />
                    <span className="text-xs text-gray-400 mt-2">لا تتوفر صورة فوتوغرافية</span>
                  </div>
                )}
              </div>

              {/* Title & Metadata indicators */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-450" />
                    <span>تاريخ النشر: {formatDate(selectedAdForDetails.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-mono">{adViewsMap[selectedAdForDetails.id] !== undefined ? adViewsMap[selectedAdForDetails.id] : (selectedAdForDetails.view_count || 0)} مشاهدة</span>
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-slate-900 leading-snug mt-1">
                  {selectedAdForDetails.title}
                </h2>
              </div>

              {/* Description Body text */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black text-slate-800">الوصف التفصيلي للإعلان:</span>
                <p className="text-xs text-slate-605 leading-relaxed bg-slate-50/50 border p-4 rounded-2xl whitespace-pre-line">
                  {selectedAdForDetails.description}
                </p>
              </div>

              {/* Contact information details */}
              <div className="bg-amber-50/30 border border-amber-200/50 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-900 font-bold block leading-none">رقم تواصل المعلن للتسليم</span>
                  <span className="text-sm font-black text-slate-950 font-mono inline-block mt-2.5">
                    {selectedAdForDetails.contact}
                  </span>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-600">
                  <Phone className="w-5 h-5" />
                </div>
              </div>

              {/* Publisher profile section */}
              {(selectedAdForDetails.owner_id || selectedAdForDetails.creator_id || selectedAdForDetails.user_id) && (
                <div className="border border-gray-150 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-extrabold font-mono select-none">
                      {(selectedAdForDetails.owner_name || selectedAdForDetails.user_name || 'م').substring(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-extrabold text-slate-900">
                          {selectedAdForDetails.owner_name || selectedAdForDetails.user_name || 'زائر في مجتمعنا'}
                        </span>
                        {((selectedAdForDetails as any).user_is_verified || (selectedAdForDetails as any).user_kycStatus === 'verified') && (
                          <VerifiedBadge size={13} className="mr-0.5 inline-block" />
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400 block mt-0.5">ناشر موثق بمتجر الرضوان المبوب</span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const publisherId = selectedAdForDetails.owner_id || selectedAdForDetails.creator_id || selectedAdForDetails.user_id;
                      if (publisherId) {
                        setViewProfileUserId(publisherId);
                        setSelectedAdForDetails(null);
                      }
                    }}
                    className="text-[10px] text-amber-600 font-extrabold hover:underline"
                  >
                    زيارة الحساب المالك ➔
                  </button>
                </div>
              )}

            </div>

            {/* Modal actions footer footer */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 grid grid-cols-2 gap-3 shrink-0">
              <a
                href={`https://wa.me/${selectedAdForDetails.contact.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3 mr-auto w-full rounded-2xl font-black text-xs sm:text-sm transition bg-emerald-500 text-white hover:bg-emerald-600 shadow-md"
              >
                <MessageSquare className="w-4 h-4 ml-0.5" />
                <span>محادثة واتساب فورية</span>
              </a>

              <a
                href={`tel:${selectedAdForDetails.contact}`}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-250 bg-white text-slate-850 hover:bg-slate-50 font-black text-xs sm:text-sm transition shadow-sm"
              >
                <Phone className="w-4 h-4 ml-0.5 text-slate-600" />
                <span>اتصال هاتفي مباشر</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};



================================================================================
الملف: src/views/CategoriesView.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { LayoutGrid, Package, ChevronLeft, PlusCircle } from 'lucide-react';
import { AddProductModal } from '../components/AddProductModal';

export const CategoriesView: React.FC = () => {
  const { categories, products, settings } = useApp();
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const siteCurrency = settings['currency'] || 'ل.س';

  const visibleCategories = categories.filter(c => c.is_visible === 1);

  // Filter products by active categorized selection
  const shownProducts = activeCatId === null
    ? products.filter(p => p.status !== 'hidden')
    : products.filter(p => p.category_id === activeCatId && p.status !== 'hidden');

  return (
    <div className="w-full bg-slate-50 font-sans text-right min-h-screen pb-16" dir="rtl">
      {/* View Banner Header */}
      <div className="bg-slate-900 text-white py-10 px-4 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
              <LayoutGrid className="w-6.5 h-6.5 text-amber-500" />
              <span>سوق ومواد المعرض</span>
            </h1>
            <p className="text-slate-300 text-xs max-w-md">
              الوصول لكافة المعروضات في مركز الرضوان، أو المبادرة بمشاركة ونشر منتجاتك الإعلانية الخاصة.
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-600 hover:scale-[1.03] active:scale-95 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/10 transition duration-300 flex items-center justify-center gap-2 w-fit cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>أضف منتج الآن</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Right Sidebar Category selectors on desktop, top rows on mobile */}
        <div className="lg:col-span-1 flex flex-col gap-2.5">
          <h3 className="font-extrabold text-slate-900 text-sm hidden lg:block mb-1">فلترة حسب الأقسام</h3>
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveCatId(null)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold text-right cursor-pointer whitespace-nowrap lg:whitespace-normal transition ${
                activeCatId === null
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-gray-150 hover:bg-slate-100'
              }`}
            >
              جميع المواد والأقسام ({products.filter(p => p.status !== 'hidden').length})
            </button>

            {visibleCategories.map((cat) => {
              const count = products.filter(p => p.category_id === cat.id && p.status !== 'hidden').length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCatId(cat.id)}
                  className={`px-4 py-3 rounded-2xl text-xs font-bold text-right cursor-pointer whitespace-nowrap lg:whitespace-normal transition flex items-center justify-between gap-4 ${
                    activeCatId === cat.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-gray-150 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCatId === cat.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Display Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1.5 text-slate-800">
              <Package className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-base sm:text-lg">
                {activeCatId === null ? 'كافة المعروضات' : visibleCategories.find(c => c.id === activeCatId)?.name}
              </h2>
            </div>
            <span className="text-xs text-gray-500">{shownProducts.length} مواد متوفرة</span>
          </div>

          {shownProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 py-20 text-center px-4">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">القسم فارغ مؤقتاً</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                لم نجد أي مادة كالمخزنة لهذا القسم في الوقت الراهن بمخازن مركز الرضوان.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {shownProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};



================================================================================
الملف: src/views/HomeView.tsx
================================================================================

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HomeSlider } from '../components/HomeSlider';
import { ProductCard } from '../components/ProductCard';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  MessageSquare,
  Sparkles,
  Search,
  Package,
  Award,
  Facebook,
  Instagram,
  Youtube,
  Send,
  MessageCircle,
  Phone,
  ArrowUpRight
} from 'lucide-react';

interface HomeViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCart?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ searchQuery, setSearchQuery, onOpenCart }) => {
  const { 
    products, 
    categories, 
    partners, 
    settings,
    setView,
    socialLinks
  } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  // Default parameters
  const siteCurrency = settings['currency'] || 'ل.س';
  const siteDesc = settings['site_description'] || 'مركز الرضوان لمواد البناء والأدوات الصحية والكهربائية. خدمة ممتازة وجودة مضمونة في غوطة دمشق وكافة المناطق.';

  // Filter products based on search query OR selected category
  const filteredProducts = products.filter(p => {
    // If not active or hidden, skip
    if (p.status === 'hidden') return false;

    // Filter by category
    if (selectedCatId !== null && p.category_id !== selectedCatId) return false;

    // Filter by query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
    }

    return true;
  });

  return (
    <div className="w-full bg-slate-50 font-sans text-right pb-14" dir="rtl">
      {/* Slider / Static Hero Display */}
      <HomeSlider />

      {/* Trust Markers row */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-950 text-xs sm:text-sm">جودة مضمونة 100%</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">مواد إسمنتية وصحية معتمدة</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <Truck className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-950 text-xs sm:text-sm">توصيل للموقع الإنشائي</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">شاحنات مجهزة للتوصيل الآمن</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
              <Clock className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-950 text-xs sm:text-sm">تجهيز سريع للطلبيات</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">تحميل وتوصيل خلال ساعات فقط</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
              <MessageSquare className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-950 text-xs sm:text-sm">خدمة عملاء واتساب</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">فريق فني متكامل للإجابة فوراً</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Categories Bar Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">تصفح الفئات والأقسام</h2>
            </div>
            <button 
              onClick={() => setView('categories')} 
              className="text-amber-600 hover:text-amber-700 font-bold text-xs"
            >
              عرض الكل
            </button>
          </div>
          
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            <button
              onClick={() => setSelectedCatId(null)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCatId === null 
                  ? 'bg-slate-900 text-white shadow' 
                  : 'bg-white text-slate-700 border border-gray-150 hover:bg-slate-50'
              }`}
            >
              جميع المواد ({products.filter(p => p.status !== 'hidden').length})
            </button>

            {categories.map((cat) => {
              const catProductsCount = products.filter(p => p.category_id === cat.id && p.status !== 'hidden').length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCatId === cat.id 
                      ? 'bg-slate-900 text-white shadow' 
                      : 'bg-white text-slate-700 border border-gray-150 hover:bg-slate-50'
                  }`}
                >
                  {cat.name} ({catProductsCount})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search feedback header */}
        {searchQuery && (
          <div className="mb-6 flex items-center gap-2 text-slate-650 bg-white/70 border border-gray-200 rounded-2xl py-3 px-4 text-xs font-sans">
            <Search className="w-3.5 h-3.5" />
            <span>نتائج البحث عن: <strong className="text-amber-500">"{searchQuery}"</strong> ({filteredProducts.length} نتيجة)</span>
            <button 
              onClick={() => setSearchQuery('')}
              className="mr-auto text-rose-500 font-bold hover:underline"
            >
              إلغاء البحث
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-amber-500" />
            <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {selectedCatId === null ? 'المواد والأدوات الأكثر طلباً' : categories.find(c => c.id === selectedCatId)?.name}
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-150 py-16 px-6 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm mb-1">لم يتم العثور على أي مواد</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                عذراً، لم نجد أي مادة مطابقة لمعايير البحث في الوقت الراهن بمخازن مركز الرضوان.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} onOpenCart={onOpenCart} />
              ))}
            </div>
          )}
        </div>

        {/* Partners section - Infinite Scroll feel logos */}
        {partners.filter(p => p.is_active === 1).length > 0 && (
          <div className="mb-14 bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">شركاء النجاح والموردين المعتمدين</h2>
            </div>
            
            <style>{`
              @keyframes marqueeScrollRTL {
                0% {
                  transform: translateX(0%);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .partners-marquee-container {
                display: flex;
                width: max-content;
                animation: marqueeScrollRTL 24s linear infinite;
              }
              .partners-marquee-container:hover {
                animation-play-state: paused;
              }
            `}</style>
            
            <div className="relative w-full overflow-hidden py-3" dir="ltr">
              {/* Fade gradient masks for edges */}
              <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
              
              <div className="partners-marquee-container flex items-center gap-6 sm:gap-8">
                {/* Repeat elements multiple times to construct an uninterrupted visual loop */}
                {[...partners.filter(p => p.is_active === 1), ...partners.filter(p => p.is_active === 1), ...partners.filter(p => p.is_active === 1), ...partners.filter(p => p.is_active === 1)].map((partner, index) => {
                  const hasLink = !!partner.website_url;
                  
                  const content = (
                    <div 
                      className={`h-24 w-36 sm:h-28 sm:w-44 shrink-0 overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center relative group ${hasLink ? 'cursor-pointer' : ''}`}
                      title={partner.name || 'شريك مركز الرضوان'}
                    >
                      <img 
                        src={`/api/image/${partner.logo_key}`} 
                        alt={partner.name || 'Partner logo'} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                        <span className="text-[10px] sm:text-xs font-bold text-white text-right w-full block truncate">
                          {partner.name || 'شريك معتمد'}
                        </span>
                      </div>
                    </div>
                  );

                  if (hasLink) {
                    return (
                      <a 
                        key={`${partner.id}-${index}`}
                        href={partner.website_url as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block shrink-0 transition"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div 
                      key={`${partner.id}-${index}`}
                      className="block shrink-0 transition"
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* About block */}
        <div className="bg-slate-900 rounded-3xl text-white p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-2xl">
            <span className="text-amber-500 text-xs font-bold uppercase tracking-wider mb-2 block">عن مركزنا</span>
            <h3 className="text-lg sm:text-2xl font-extrabold text-white mb-4">مركز الرضوان لمواد البناء والتوريد</h3>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
              {siteDesc}
            </p>

            {/* Social Media "Follow Us" Section */}
            {socialLinks && socialLinks.filter(l => l.is_active === 1).length > 0 && (
              <div className="mb-8 pt-6 border-t border-white/10 text-right">
                <h4 className="text-sm font-bold text-amber-500 mb-4 flex items-center justify-start gap-2">
                  <span>تابعنا على وسائل التواصل الاجتماعي</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </h4>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.filter(l => l.is_active === 1).map((link) => {
                    const getIcon = () => {
                      switch (link.platform.toLowerCase()) {
                        case 'facebook': return <Facebook className="w-4 h-4 text-blue-400 shrink-0" />;
                        case 'instagram': return <Instagram className="w-4 h-4 text-pink-400 shrink-0" />;
                        case 'youtube': return <Youtube className="w-4 h-4 text-red-400 shrink-0" />;
                        case 'telegram': return <Send className="w-4 h-4 text-sky-400 shrink-0" />;
                        case 'whatsapp': return <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
                        case 'tiktok': return <span className="font-extrabold text-[10px] text-white shrink-0">TikTok</span>;
                        case 'x': return <span className="font-extrabold text-[10px] text-slate-300 shrink-0">X</span>;
                        default: return <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0" />;
                      }
                    };

                    const getPlatformLabel = () => {
                      switch (link.platform.toLowerCase()) {
                        case 'facebook': return 'فيسبوك';
                        case 'instagram': return 'إنستغرام';
                        case 'youtube': return 'يوتيوب';
                        case 'telegram': return 'تلغرام';
                        case 'whatsapp': return 'واتساب';
                        case 'tiktok': return 'تيك توك';
                        case 'x': return 'منصة X';
                        default: return link.platform;
                      }
                    };

                    return (
                      <a 
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl hover:bg-white/10 hover:border-amber-500 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                        title={getPlatformLabel()}
                      >
                        {getIcon()}
                        <span className="text-xs font-semibold text-slate-200">{getPlatformLabel()}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-xs font-sans text-slate-400">
              <span className="bg-white/5 px-3.5 py-1.5 rounded-full">ساعات العمل: 8:00 صباحاً - 5:00 مساءً</span>
              <span className="bg-white/5 px-3.5 py-1.5 rounded-full">الموقع: دمشق، الغوطة الشرقية</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};



================================================================================
الملف: src/views/MeView.tsx
================================================================================

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, Product } from '../types';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { AddProductModal } from '../components/AddProductModal';
import { 
  User, 
  Trash2, 
  ShoppingBag, 
  FileText, 
  LogOut, 
  Heart, 
  MapPin, 
  Mail, 
  Calendar,
  Lock,
  ChevronLeft,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Bell
} from 'lucide-react';

export const MeView: React.FC = () => {
  const { 
    user, 
    setUser, 
    products, 
    favorites, 
    toggleFavorite, 
    addToCart, 
    showToast,
    settings,
    setShowKycModal,
    fetchInitialData
  } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [editingName, setEditingName] = useState(user?.name || '');
  const [editingBio, setEditingBio] = useState((user as any)?.bio || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditingName(user.name);
      setEditingBio((user as any).bio || '');
    }
  }, [user]);

  const handleUpdatePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingName.trim()) {
      showToast('يرجى تحديد الاسم الشخصي أو التجاري', 'error');
      return;
    }
    try {
      setIsEditingProfile(true);
      const res = await fetch('/api/user/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName, bio: editingBio })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        showToast('تم تحديث بياناتك الشخصية بنجاح 💾', 'success');
        fetchInitialData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'فشل تحديث البيانات الشخصية', 'error');
      }
    } catch {
      showToast('خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً', 'error');
    } finally {
      setIsEditingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String })
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          showToast('تم تحديث صورتك الشخصية بنجاح 📸', 'success');
        } else {
          showToast('فشل تحميل الصورة الشخصية، حاول ثانية.', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('عذراً، حدث خطأ فني بالاتصال لرفع الصورة.', 'error');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const siteCurrency = settings['currency'] || 'ل.س';

  // Fetch client orders
  useEffect(() => {
    if (!user) return;
    const fetchUserOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const res = await fetch('/api/user/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error('Error fetching user orders history', e);
      } finally {
        setIsLoadingOrders(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  const handleLogout = async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' });
      setUser(null);
      showToast('تم الخروج الآمن من الحساب الشخصي بنجاح', 'success');
    } catch {
      showToast('حدث خطأ أثناء رغبتك بالخروج', 'error');
    }
  };

  // Filter listed favorite products
  const favoriteProducts = products.filter(p => favorites.includes(p.id) && p.status !== 'hidden');

  const handleClearNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications/clear', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        showToast('تم مسح وقراءة أرشيف التنبيهات بنجاح.', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="w-full bg-slate-50 font-sans text-right min-h-screen py-20 px-4 flex flex-col items-center justify-center" dir="rtl">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border border-gray-150 mb-5 text-gray-400">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="font-extrabold text-slate-900 text-lg sm:text-xl mb-2">تسجيل الدخول مطلوب</h2>
        <p className="text-xs text-gray-500 max-w-sm text-center mb-6 leading-relaxed">
          يلزمك امتلاك حساب آمن مفعّل في منصة مركز الرضوان لتتمكن من مراجعة المواد المفضلة ومراقبة فواتير الطلبات الجارية أو مراجعتها لاحقاً.
        </p>
      </div>
    );
  }

  const formatPrice = (val: number) => {
    return val.toLocaleString() + ' ' + siteCurrency;
  };

  const myProducts = products.filter(p => p.user_id === user.id);

  return (
    <div className="w-full bg-slate-50 font-sans text-right min-h-screen pb-16" dir="rtl">
      {/* Top Profile Banner Header */}
      <div className="bg-slate-900 text-white pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Identity details */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-amber-500 overflow-hidden text-2xl font-bold shrink-0 shadow-lg relative">
                  {user.avatar_key ? (
                    <img 
                      src={`/api/image/${user.avatar_key}`} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    </div>
                  )}
                </div>
                
                {/* Desktop upload overlay */}
                <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[10px] font-bold">
                  <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>تغيير الصورة</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
              <label className="cursor-pointer bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-[9.5px] font-bold px-3 py-1 rounded-full border border-slate-700/60 transition inline-flex items-center gap-1 shadow-sm select-none">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V4m0 0l-3 3m3-3l3 3" />
                </svg>
                <span>تغيير الصورة</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center">
                  <span>{user.name}</span>
                  {user.kycStatus === 'verified' && <VerifiedBadge size={22} className="mr-2 inline" />}
                </h1>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30">عملائنا المميزين</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-405" />
                  <span>{user.email}</span>
                </span>
                <span className="hidden sm:flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-405" />
                  <span>عضو منذ: {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SY') : '٢٠٢٦'}</span>
                </span>
                
                {/* Visual verification badge pill in top bar */}
                {user.kycStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/25 text-emerald-400 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مكتمل التحقق</span>
                  </span>
                )}
                {user.kycStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1 bg-yellow-500/25 text-yellow-400 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border border-yellow-500/30">
                    <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                    <span>قيد المراجعة الفورية</span>
                  </span>
                )}
                {user.kycStatus === 'rejected' && (
                  <span 
                    onClick={() => setShowKycModal(true)}
                    className="inline-flex items-center gap-1 bg-rose-500/25 text-rose-400 text-[10.5px] font-bold px-2 py-0.5 rounded-lg border border-rose-500/30 cursor-pointer hover:bg-rose-500/35 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>التوثيق ملغى (اضغط للتصحيح)</span>
                  </span>
                )}
                {(!user.kycStatus || user.kycStatus === 'unverified') && (
                  <button 
                    onClick={() => setShowKycModal(true)}
                    className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10.5px] font-bold px-3 py-0.5 rounded-lg transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                    <span>توثيق الهوية الآن</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 bg-red-650 px-5 py-2.5 rounded-xl text-xs font-bold transition text-red-500 bg-red-50 hover:bg-red-150 border border-red-200/50 self-start md:self-auto shadow-xs"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>تسجيل الخروج المفعّل</span>
          </button>
        </div>
      </div>

      {/* Main grids */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-60px] relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Right card column: List Favorites */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Identity verification control panel */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">حالة توثيق هويتك</h3>
            </div>

            {user.kycStatus === 'verified' ? (
              <div className="flex flex-col gap-3 py-2 text-right">
                <div className="flex items-center gap-2.5 text-emerald-600">
                  <ShieldCheck className="w-8 h-8 shrink-0 text-emerald-500" />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm">هويتك موثقة بنجاح!</h4>
                    <p className="text-[10.5px] text-gray-500 font-sans mt-0.5">لقد منحت لك الشارة الزرقاء، ولديك الصلاحية الكاملة لنشر العروض وسحب المستحقات.</p>
                  </div>
                </div>
              </div>
            ) : user.kycStatus === 'pending' ? (
              <div className="flex flex-col gap-3 py-1 text-right">
                <div className="flex items-start gap-2.5 text-yellow-600 bg-yellow-50/50 p-3 rounded-2xl border border-yellow-200/25">
                  <Loader2 className="w-5 h-5 shrink-0 text-yellow-500 animate-spin mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs">الطلب قيد المراجعة الفورية</h4>
                    <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                      ملفاتك قيد التدقيق حالياً من المسؤولين. سيتم تطبيق الشارة الزرقاء فوراً دون حاجة لتحديث الصفحة.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 py-1 text-right">
                {user.kycStatus === 'rejected' && (
                  <div className="bg-rose-50 border border-rose-200/40 p-3.5 rounded-2xl text-[10.5px] text-rose-800 leading-relaxed">
                    <strong>طلبك السابق تم رفضه ⚠️</strong>
                    <p className="font-sans mt-1">سبب الرفض: <span>{user.kycData?.kycRejectionReason || "المستندات غير واضحة لتدقيق الهوية الوطنية"}</span></p>
                  </div>
                )}
                <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                  قم بتوثيق حسابك بنسخة من هويتك الوطنية لتجنب تقييد العمليات، لتتمكن من نشر إعلانات مبوبة مجانية وتأكيد فواتير سحوباتك.
                </p>
                <button
                  onClick={() => setShowKycModal(true)}
                  className="w-full bg-slate-900 hover:bg-amber-500 text-white font-extrabold text-xs py-3 rounded-xl transition"
                >
                  {user.kycStatus === 'rejected' ? 'إعادة تقديم طلب التوثيق' : 'ابدأ توثيق هويتك الآن'}
                </button>
              </div>
            )}
          </div>

          {/* Edit account details / bio */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <User className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">نبذتك الشخصية ومسمى الحساب</h3>
            </div>
            
            <form onSubmit={handleUpdatePublicProfile} className="space-y-3.5 text-right">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">الاسم التجاري أو الشخصي:</label>
                <input 
                  type="text" 
                  value={editingName} 
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-gray-150 rounded-xl outline-none focus:border-amber-500 transition"
                  placeholder="مثال: جهاد أحمد، المطور العقاري"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">نبذة قصيرة للمشترين والمتابعين:</label>
                <textarea 
                  value={editingBio} 
                  onChange={(e) => setEditingBio(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-sans p-2.5 bg-slate-50 border border-gray-150 rounded-xl outline-none focus:border-amber-500 resize-none transition"
                  placeholder="اكتب نبذة مختصرة عن هويتك أو نشاطك لمشاركتها مع مجتمع الرضوان..."
                />
              </div>

              <button 
                type="submit" 
                disabled={isEditingProfile}
                className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition text-white disabled:opacity-50 cursor-pointer"
              >
                {isEditingProfile ? 'جاري الحفظ...' : 'تحديث الملف الشخصي'}
              </button>
            </form>
          </div>

          {/* Real-time In-App Notifications Box */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">التنبيهات المباشرة</h3>
              </div>
              {user.notifications && user.notifications.length > 0 && (
                <button 
                  onClick={handleClearNotifications}
                  className="text-[10px] font-bold text-rose-505 text-red-500 hover:underline"
                >
                  مسح المجموع
                </button>
              )}
            </div>

            {!user.notifications || user.notifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <span className="text-[10.5px] text-gray-500 font-sans">علبة التنبيهات خالية حالياً</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
                {user.notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-3 rounded-xl bg-slate-50 border border-gray-150/50 flex flex-col gap-1 text-right text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 pr-1 text-[11.5px]">{n.title}</span>
                      <span className="text-[8.5px] text-gray-400 font-sans">
                        {new Date(n.created_at).toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-relaxed font-sans mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
              <h3 className="font-extrabold text-slate-900 text-sm">المواد المفضلة ({favorites.length})</h3>
            </div>

            {favoriteProducts.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-10 h-10 text-gray-250 mx-auto mb-2" />
                <span className="text-xs text-gray-500">لا يوجد مواد مفضلة حالياً</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {favoriteProducts.map((p) => (
                  <div key={p.id} className="flex gap-3 items-center p-2 rounded-xl bg-slate-50 border border-gray-150/40">
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center border shrink-0">
                      {p.image_key ? (
                        <img 
                          src={`/api/image/${p.image_key}`} 
                          alt={p.name} 
                          className="w-full h-full object-contain" 
                        />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                      <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
                        {p.sale_price !== null ? formatPrice(p.sale_price) : formatPrice(p.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => addToCart(p)}
                        className="p-2 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg transition"
                        title="إضافة للسلة"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => toggleFavorite(p.id)}
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Left card grid: Orders History */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm min-h-[400px]">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
              <FileText className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">سجل طلبيات وفواتير البناء</h3>
            </div>

            {isLoadingOrders ? (
              <div className="flex flex-col items-center justify-center py-14">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-xs text-gray-500">جاري استيراد سجل الفواتير من الخادم...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-250 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">لم تسجِل أي طلبيات سابقة بعد</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  تصفح المنتجات في الصفحة الرئيسية، أضف السوائل والحديد والسول، وسيتم مراجعتها هنا فور إبرام الطلبية.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {orders.map((order) => {
                  let itemsArray: any[] = [];
                  if (typeof order.items === 'string') {
                    try {
                      itemsArray = JSON.parse(order.items);
                    } catch {
                      itemsArray = [];
                    }
                  } else if (Array.isArray(order.items)) {
                    itemsArray = order.items;
                  }

                  return (
                    <div 
                      key={order.id} 
                      className="border border-gray-150 rounded-2xl overflow-hidden hover:shadow-xs transition"
                    >
                      {/* Order main row bar */}
                      <div className="bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-gray-150">
                        <div>
                          <span className="font-bold text-slate-900">رقم الفاتورة: #{order.order_number}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-slate-500 font-sans">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'مؤخراً'}</span>
                        </div>

                        {/* Status elements badge */}
                        <div>
                          {order.status === 'pending' && <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-extrabold text-[10px]">قيد المراجعة</span>}
                          {order.status === 'confirmed' && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-extrabold text-[10px]">مؤكد ومجهز</span>}
                          {order.status === 'delivered' && <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-extrabold text-[10px]">تم التوصيل</span>}
                          {order.status === 'rejected' && <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full font-extrabold text-[10px]">مرفوض أو ملغي</span>}
                        </div>
                      </div>

                      {/* Details order block */}
                      <div className="p-4 flex flex-col gap-2.5 text-xs">
                        {/* Order items nested list */}
                        <div className="flex flex-col gap-1">
                          {itemsArray.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-slate-700">
                              <span>• {item.name || 'مادة بناء مجهولة'} (الكمية: {item.quantity || item.qty || 1})</span>
                              <span className="font-sans">{(item.price * (item.quantity || item.qty || 1)).toLocaleString()} {siteCurrency}</span>
                            </div>
                          ))}
                        </div>

                        <div className="h-px bg-gray-100 my-1" />

                        <div className="flex flex-wrap justify-between items-center text-slate-700">
                          <div>
                            <span className="text-gray-500">عنوان الشحن:</span> 
                            <span className="ml-2 pr-1 text-slate-900 font-medium">{order.customer_address}</span>
                          </div>
                          
                          <div className="font-extrabold text-slate-950 font-sans">
                            المجموع النهائي: {order.total.toLocaleString()} {siteCurrency}
                          </div>
                        </div>

                        {order.notes && (
                          <div className="bg-orange-50/20 text-slate-650 p-2.5 rounded-xl text-[11px] mt-1">
                            <strong className="text-amber-700">توجيهات العمل والملاحظات:</strong> {order.notes}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: My added materials for construction & custom elements */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-sm">إعلاناتي وموادي الإنشائية في الكتالوج ({myProducts.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddNewOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition flex items-center gap-1 shadow-sm select-none cursor-pointer"
              >
                <span>إدراج منتج جديد ➕</span>
              </button>
            </div>

            {myProducts.length === 0 ? (
              <div className="text-center py-10 bg-slate-50/55 rounded-2xl border border-dashed border-gray-200">
                <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="font-bold text-slate-700 text-xs">لم تقم بإضافة أي مواد للبيع بعد</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  يمكنك كعضو موثق إدراج منتجات مواد البناء والطلبيات الخاصة بك مع تفصيل طرق الدفع التي تفضلها والصور والوصف المتكامل للكتالوج.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myProducts.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-150/40 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center border shrink-0">
                        {p.image_key ? (
                          <img 
                            src={`/api/image/${p.image_key}`} 
                            alt={p.name} 
                            className="w-full h-full object-contain" 
                          />
                        ) : p.video_key ? (
                          <div className="bg-slate-150 w-full h-full flex items-center justify-center text-slate-600 font-extrabold text-[9px]">
                            فيديو 🎥
                          </div>
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{p.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold font-sans">
                            {p.sale_price !== null ? formatPrice(p.sale_price) : formatPrice(p.price)}
                          </span>
                          <span>• {p.status === 'hidden' ? 'مخفي' : 'نشط ومعروض'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setProductToEdit(p)}
                        className="py-1 px-3 bg-white border border-gray-200 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] rounded-lg transition"
                      >
                        تعديل ✏️
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً من حسابك؟")) {
                            try {
                              const res = await fetch(`/api/products/${p.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                showToast('تم إزالة المادة بنجاح 🗑️', 'success');
                                fetchInitialData();
                              } else {
                                showToast('فشل حذف مواصفات المنتج', 'error');
                              }
                            } catch {
                              showToast('خطأ بالاتصال أثناء طلب الحذف الكاتلوجي', 'error');
                            }
                          }
                        }}
                        className="py-1 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[10px] rounded-lg transition"
                      >
                        حذف 🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {isAddNewOpen && (
        <AddProductModal onClose={() => setIsAddNewOpen(false)} />
      )}

      {productToEdit && (
        <AddProductModal productToEdit={productToEdit} onClose={() => setProductToEdit(null)} />
      )}
    </div>
  );
};



