# Jar Monorepo

A professional monorepo containing the full-stack Jar application with backend (NestJS), frontend (Next.js), and mobile (React Native) applications.

## 🏗️ Project Structure

```
jar-mono/
├── apps/
│   ├── backend/          # NestJS API with PostgreSQL & Prisma
│   ├── frontend/         # Next.js web application
│   └── mobile/           # React Native mobile app (to be added)
├── packages/             # Shared packages (future)
├── tools/                # Build tools and scripts
├── scripts/              # Utility scripts
├── docs/                 # Documentation
├── package.json          # Root package.json with workspaces
├── turbo.json           # Turbo build configuration
└── tsconfig.json        # Root TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- PostgreSQL (for backend)
- Docker (optional, for database)

### Installation

1. **Clone and setup the repository:**
```bash
git clone git@github.com:fss88/Jar.git
cd jar-mono
npm install
```

2. **Setup environment variables:**
```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env.local
# Edit apps/backend/.env.local with your database credentials

# Frontend environment  
cp apps/frontend/.env.example apps/frontend/.env.local
# Edit apps/frontend/.env.local with your API URL
```

3. **Setup database:**
```bash
# Generate Prisma client
cd apps/backend
npx prisma generate

# Run database migrations (when database is ready)
npx prisma migrate deploy
```

## 🛠️ Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all applications in development mode |
| `npm run build` | Build all applications |
| `npm run backend:dev` | Start only backend in development mode |
| `npm run frontend:dev` | Start only frontend in development mode |
| `npm run mobile:dev` | Start only mobile in development mode |
| `npm run backend:build` | Build only backend |
| `npm run frontend:build` | Build only frontend |
| `npm run mobile:build` | Build only mobile |
| `npm run lint` | Lint all applications |
| `npm run test` | Run tests for all applications |
| `npm run clean` | Clean all build artifacts and node_modules |

### Individual Application Development

#### Backend (NestJS)
```bash
cd apps/backend
npm run start:dev
```
- Runs on: http://localhost:3000
- API prefix: `/api/v1`

#### Frontend (Next.js)
```bash
cd apps/frontend
npm run dev
```
- Runs on: http://localhost:3000 (or next available port)

#### Mobile (React Native)
```bash
cd apps/mobile
npm run android  # for Android
npm run ios      # for iOS
```

## 📦 Workspace Configuration

The monorepo uses npm workspaces for dependency management:

- **Root package.json**: Contains shared dev dependencies and workspace configuration
- **App package.json**: Each app has its own dependencies and scripts
- **Shared packages**: Future shared packages will be in the `packages/` directory

## 🔧 Configuration Files

### Root Configuration
- `package.json`: Workspace configuration and shared scripts
- `turbo.json`: Build pipeline configuration
- `tsconfig.json`: Root TypeScript configuration
- `.prettierrc`: Code formatting rules
- `.gitignore`: Git ignore patterns

### Application Configuration
Each app maintains its own configuration files:
- `apps/backend/`: NestJS, Prisma, Docker configuration
- `apps/frontend/`: Next.js, Tailwind, i18n configuration
- `apps/mobile/`: React Native, Metro configuration

## 🗄️ Database Setup

The backend uses PostgreSQL with Prisma ORM:

1. **Install PostgreSQL** (or use Docker):
```bash
# Using Docker
docker run --name jar-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=jar_db -p 5432:5432 -d postgres:15
```

2. **Update database URL** in `apps/backend/.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/jar_db?schema=public"
```

3. **Run migrations**:
```bash
cd apps/backend
npx prisma migrate deploy
```

## 🌐 Environment Variables

### Backend (.env.local)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/jar_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=8080
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"
GOOGLE_TRANSLATE_API_KEY="your-google-translate-api-key"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api/v1/"
NEXT_PUBLIC_DEFAULT_LANGUAGE="en"
```
### Mobile (.env.local)
```env
base_url="http://localhost:3000/api/v1"

## 🚀 Deployment

### Backend Deployment
1. Build the application: `npm run backend:build`
2. Deploy using Docker or your preferred platform
3. Run database migrations in production

### Frontend Deployment
1. Build the application: `npm run frontend:build`
2. Deploy the `.next` folder to your hosting platform
3. Configure environment variables

### Mobile Deployment
1. Build for production: `npm run mobile:build`
2. Follow platform-specific deployment guides

## 🔄 Migration from Separate Repos

This monorepo was created by migrating existing repositories:

1. **Backend**: Migrated from separate NestJS repo
2. **Frontend**: Migrated from separate Next.js repo  
3. **Mobile**: To be migrated from separate React Native repo

### Migration Benefits
- ✅ Shared dependencies and tooling
- ✅ Unified build and deployment pipeline
- ✅ Easier code sharing between applications
- ✅ Simplified development workflow
- ✅ Better dependency management

## 🛠️ Troubleshooting

### Common Issues

1. **Prisma Client not found**:
   ```bash
   cd apps/backend
   npx prisma generate
   ```

2. **Port conflicts**:
   - Backend: 8080
   - Mobile: 3000 (Metro bundler)
   - Frontend: 3000 (or next available)
   

3. **Build failures**:
   - Ensure all environment variables are set
   - Check database connection
   - Run `npm run clean` and reinstall dependencies

4. **TypeScript errors**:
   - Run `npm run type-check` to identify issues
   - Ensure all dependencies are properly installed

## 📚 Additional Resources

- [Turbo Documentation](https://turbo.build/repo/docs)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
