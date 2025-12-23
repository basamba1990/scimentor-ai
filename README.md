# SciMentor AI - Scientific Notebook Analysis Platform

A professional platform for analyzing Jupyter notebooks with AI-powered scientific feedback using GPT-4o-mini.

## Features

- **AI-Powered Analysis**: Analyze notebooks using GPT-4o-mini for scientific accuracy
- **Secure Authentication**: Supabase OAuth integration with Google Sign-In
- **File Storage**: Secure notebook storage on Supabase Storage
- **Analysis History**: Persistent storage of all analyses with pagination and search
- **Detailed Feedback**: Structured feedback including global evaluation, criterion-specific comments, and improvement suggestions
- **Scoring System**: Automatic grading from A+ to F based on scientific validity
- **Row Level Security**: Data protection with RLS policies
- **Real-time Processing**: Edge Functions for serverless analysis

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript, TailwindCSS 4
- **Backend**: Supabase (PostgreSQL, Storage, Edge Functions)
- **Authentication**: Supabase Auth with Google OAuth
- **AI**: OpenAI GPT-4o-mini API
- **Deployment**: Supabase Edge Functions

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- OpenAI API key

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-proj-your-key
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Supabase Setup

#### Create Tables

Run the migration SQL in Supabase SQL Editor:

```bash
supabase db push
```

Or manually execute `supabase/migrations/001_init_schema.sql` in the Supabase dashboard.

#### Create Storage Bucket

In Supabase Storage, create a bucket named `notebooks` with private access.

#### Deploy Edge Function

```bash
supabase functions deploy analyze-notebook
```

Or manually:
1. Go to Supabase Dashboard → Edge Functions
2. Create a new function named `analyze-notebook`
3. Copy content from `supabase/functions/analyze-notebook/index.ts`
4. Add environment variable: `OPENAI_API_KEY`

### 5. Development

```bash
pnpm dev
```

Access the app at `http://localhost:5173`

### 6. Production Build

```bash
pnpm build
```

## API Reference

### Supabase Tables

#### `notebooks`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `filename`: TEXT
- `file_size`: INTEGER
- `s3_key`: TEXT
- `s3_url`: TEXT
- `content_hash`: TEXT
- `cell_count`: INTEGER
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

#### `analyses`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `notebook_path`: TEXT
- `feedback_data`: JSONB (Analysis results)
- `processing_time_ms`: INTEGER
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Edge Function: `analyze-notebook`

**Method**: POST

**Request Body**:
```json
{
  "notebook_content": "string (JSON stringified notebook)",
  "user_id": "string (UUID)"
}
```

**Response**:
```json
{
  "global_evaluation": "string",
  "feedback_points": [
    {
      "criterion": "string",
      "cell_index": 0,
      "severity": "high|medium|low",
      "comment": "string",
      "suggestion": "string"
    }
  ],
  "final_score": "A+|A|B+|B|B-|C+|C|C-|D|F"
}
```

## File Structure

```
scimentor-ai/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── NotebookUploader.tsx
│   │   ├── FeedbackDisplay.tsx
│   │   └── AnalysisHistory.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── functions/
│   │   ├── analyze-notebook/
│   │   │   └── index.ts
│   │   └── _shared/
│   │       └── cors.ts
│   ├── migrations/
│   │   └── 001_init_schema.sql
│   └── config.toml
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Security Considerations

1. **Row Level Security (RLS)**: All database tables have RLS policies to ensure users can only access their own data
2. **File Validation**: Notebooks are validated for type (.ipynb), size (max 5MB), and JSON format
3. **API Key Protection**: OpenAI API key is stored securely in Supabase Edge Function environment
4. **CORS Headers**: Proper CORS configuration for Edge Functions
5. **Authentication**: All endpoints require valid Supabase session

## Troubleshooting

### "Failed to upload notebook"
- Check file size (max 5MB)
- Verify file is valid Jupyter notebook (.ipynb)
- Ensure Supabase Storage bucket exists and is accessible

### "Analysis failed"
- Verify OpenAI API key is set in Edge Function environment
- Check Edge Function logs in Supabase dashboard
- Ensure notebook content is valid JSON

### "Cannot fetch history"
- Verify RLS policies are correctly configured
- Check user authentication status
- Ensure database tables exist

## Performance Optimization

- Notebook uploads are streamed to Supabase Storage
- Analysis requests are processed asynchronously via Edge Functions
- History pagination reduces database load
- Search filtering is performed client-side for better UX

## Future Enhancements

- Batch notebook analysis
- Custom evaluation criteria
- Export feedback as PDF
- Collaboration and sharing features
- Advanced analytics dashboard
- Rate limiting and quotas

## License

MIT

## Support

For issues or questions, please refer to the Supabase and OpenAI documentation.
