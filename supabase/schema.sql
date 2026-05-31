-- =========================================================================
-- HANZIFLOW SUPABASE / POSTGRESQL SCHEMA & SEED DATA
-- =========================================================================
-- This script sets up the database schema for the HanziFlow Chinese learning platform.
-- It includes definitions, relationships, updated_at triggers, auto-sync triggers for Auth.users,
-- Row Level Security (RLS) policies, and comprehensive seed data for HSK 1 and HSK 2.
-- =========================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. HELPER TRIGGERS & FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────

-- Automatically update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. CORE DATABASE TABLES
-- ─────────────────────────────────────────────────────────────────────────

-- user_profiles (extending Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  hsk_level integer DEFAULT 1,
  learning_goal text DEFAULT 'HSK',
  streak integer DEFAULT 0,
  last_active timestamp with time zone DEFAULT now(),
  points integer DEFAULT 0,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- roadmaps
CREATE TABLE IF NOT EXISTS public.roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  level integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- roadmap_stages
CREATE TABLE IF NOT EXISTS public.roadmap_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id uuid REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid REFERENCES public.roadmap_stages(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL,
  level integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- vocabulary
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  character text NOT NULL,
  pinyin text NOT NULL,
  meaning_vi text NOT NULL,
  meaning_en text,
  example_zh text NOT NULL,
  example_vi text NOT NULL,
  hsk_level integer DEFAULT 1,
  topic text NOT NULL,
  audio_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- grammar_points
CREATE TABLE IF NOT EXISTS public.grammar_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  formula text NOT NULL,
  explanation_vi text NOT NULL,
  example_1_zh text NOT NULL,
  example_1_vi text NOT NULL,
  example_2_zh text NOT NULL,
  example_2_vi text NOT NULL,
  example_3_zh text NOT NULL,
  example_3_vi text NOT NULL,
  quiz_question text,
  quiz_options jsonb, -- Array of strings: ['Option A', 'Option B', ...]
  quiz_answer text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- listening_lessons
CREATE TABLE IF NOT EXISTS public.listening_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  audio_url text NOT NULL,
  transcript_zh text NOT NULL,
  pinyin text NOT NULL,
  meaning_vi text NOT NULL,
  questions jsonb NOT NULL, -- Array of objects: [{question: '...', options: [...], answer: '...'}]
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- speaking_topics
CREATE TABLE IF NOT EXISTS public.speaking_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  prep_time integer DEFAULT 10,
  record_time integer DEFAULT 30,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- reading_lessons
CREATE TABLE IF NOT EXISTS public.reading_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content_zh text NOT NULL,
  translation_vi text NOT NULL,
  questions jsonb NOT NULL, -- Array of objects: [{question: '...', options: [...], answer: '...'}]
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- writing_tasks
CREATE TABLE IF NOT EXISTS public.writing_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  min_words integer DEFAULT 10,
  checklist jsonb NOT NULL, -- Array of strings: ['Do x', 'Write y']
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- quiz_questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL, -- 'vocabulary', 'grammar', 'listening', 'reading'
  options jsonb NOT NULL, -- Array of strings: ['Opt 1', 'Opt 2']
  correct_answer text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. USER ACTIVITY & TRACKING TABLES (LEARNING PROGRESS)
-- ─────────────────────────────────────────────────────────────────────────

-- quiz_results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  max_score integer NOT NULL,
  answers jsonb NOT NULL, -- Map of answers: {'question_id': 'answer_text'}
  recommendation text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- user_progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- flashcard_reviews (spaced repetition)
CREATE TABLE IF NOT EXISTS public.flashcard_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  vocabulary_id uuid REFERENCES public.vocabulary(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'not_learned' CHECK (status IN ('not_learned', 'learning', 'mastered')),
  interval integer DEFAULT 0,
  ease_factor double precision DEFAULT 2.5,
  repetitions integer DEFAULT 0,
  next_review timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_user_vocab UNIQUE (user_id, vocabulary_id)
);

-- speaking_recordings
CREATE TABLE IF NOT EXISTS public.speaking_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  speaking_topic_id uuid REFERENCES public.speaking_topics(id) ON DELETE CASCADE NOT NULL,
  audio_url text NOT NULL,
  duration integer NOT NULL,
  self_pron_score integer CHECK (self_pron_score BETWEEN 0 AND 100),
  self_tone_score integer CHECK (self_tone_score BETWEEN 0 AND 100),
  self_fluency_score integer CHECK (self_fluency_score BETWEEN 0 AND 100),
  self_vocab_score integer CHECK (self_vocab_score BETWEEN 0 AND 100),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- writing_submissions
CREATE TABLE IF NOT EXISTS public.writing_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  writing_task_id uuid REFERENCES public.writing_tasks(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_vocabulary_checked boolean DEFAULT false,
  is_grammar_checked boolean DEFAULT false,
  is_sentence_count_checked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 4. BIND TRIGGERS FOR TIMESTAMP UPDATES
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.bind_updated_at_triggers() RETURNS void AS $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
  LOOP
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = t 
        AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS tr_updated_at ON public.%I', t);
      EXECUTE format('CREATE TRIGGER tr_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

SELECT public.bind_updated_at_triggers();
DROP FUNCTION public.bind_updated_at_triggers();

-- ─────────────────────────────────────────────────────────────────────────
-- 5. SYNCHRONIZE AUTH.USERS & USER_PROFILES
-- ─────────────────────────────────────────────────────────────────────────

-- Trigger function to auto-create profile row when a new user signs up in auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Học viên HanziFlow'),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger binding
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_submissions ENABLE ROW LEVEL SECURITY;

-- Helper admin checker function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- A. LEARNING CONTENT ACCESS (Read for everyone authenticated, write only for admins)

-- Roadmaps
CREATE POLICY "Roadmaps are viewable by authenticated users" ON public.roadmaps
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Roadmaps are manageable by admins" ON public.roadmaps
  FOR ALL TO authenticated USING (public.is_admin());

-- Roadmap Stages
CREATE POLICY "Stages are viewable by authenticated users" ON public.roadmap_stages
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Stages are manageable by admins" ON public.roadmap_stages
  FOR ALL TO authenticated USING (public.is_admin());

-- Lessons
CREATE POLICY "Lessons are viewable by authenticated users" ON public.lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lessons are manageable by admins" ON public.lessons
  FOR ALL TO authenticated USING (public.is_admin());

-- Vocabulary
CREATE POLICY "Vocabulary is viewable by authenticated users" ON public.vocabulary
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Vocabulary is manageable by admins" ON public.vocabulary
  FOR ALL TO authenticated USING (public.is_admin());

-- Grammar Points
CREATE POLICY "Grammar points are viewable by authenticated users" ON public.grammar_points
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Grammar points are manageable by admins" ON public.grammar_points
  FOR ALL TO authenticated USING (public.is_admin());

-- Listening Lessons
CREATE POLICY "Listening lessons are viewable by authenticated users" ON public.listening_lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Listening lessons are manageable by admins" ON public.listening_lessons
  FOR ALL TO authenticated USING (public.is_admin());

-- Speaking Topics
CREATE POLICY "Speaking topics are viewable by authenticated users" ON public.speaking_topics
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Speaking topics are manageable by admins" ON public.speaking_topics
  FOR ALL TO authenticated USING (public.is_admin());

-- Reading Lessons
CREATE POLICY "Reading lessons are viewable by authenticated users" ON public.reading_lessons
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reading lessons are manageable by admins" ON public.reading_lessons
  FOR ALL TO authenticated USING (public.is_admin());

-- Writing Tasks
CREATE POLICY "Writing tasks are viewable by authenticated users" ON public.writing_tasks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Writing tasks are manageable by admins" ON public.writing_tasks
  FOR ALL TO authenticated USING (public.is_admin());

-- Quizzes
CREATE POLICY "Quizzes are viewable by authenticated users" ON public.quizzes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Quizzes are manageable by admins" ON public.quizzes
  FOR ALL TO authenticated USING (public.is_admin());

-- Quiz Questions
CREATE POLICY "Quiz questions are viewable by authenticated users" ON public.quiz_questions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Quiz questions are manageable by admins" ON public.quiz_questions
  FOR ALL TO authenticated USING (public.is_admin());


-- B. USER PROFILE ACCESS (Viewable by self, updates by self, manage by admin)
CREATE POLICY "Profiles viewable by self or admin" ON public.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Profiles updateable by self or admin" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());


-- C. STUDY ACTIVITY TRACKING ACCESS (Viewable & updateable only by the owner or admin)

-- Quiz Results
CREATE POLICY "Quiz results owner or admin access" ON public.quiz_results
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- User Progress
CREATE POLICY "User progress owner or admin access" ON public.user_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Flashcard Reviews
CREATE POLICY "Flashcard reviews owner or admin access" ON public.flashcard_reviews
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Speaking Recordings
CREATE POLICY "Speaking recordings owner or admin access" ON public.speaking_recordings
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());

-- Writing Submissions
CREATE POLICY "Writing submissions owner or admin access" ON public.writing_submissions
  FOR ALL TO authenticated USING (auth.uid() = user_id OR public.is_admin());


-- ─────────────────────────────────────────────────────────────────────────
-- 7. SEED DATA - ROADMAPS & LESSONS (HSK 1 & HSK 2)
-- ─────────────────────────────────────────────────────────────────────────

-- Roadmaps
INSERT INTO public.roadmaps (id, title, description, level) VALUES
('11111111-1111-1111-1111-111111111111', 'Lộ trình củng cố HSK 1-2', 'Dành cho người mới bắt đầu, nắm vững 300 từ vựng và ngữ pháp nền tảng.', 2),
('22222222-2222-2222-2222-222222222222', 'Lộ trình chinh phục HSK 3', 'Mở rộng từ vựng lên 600 từ, tự tin giao tiếp các chủ đề cơ bản hàng ngày.', 3)
ON CONFLICT (id) DO NOTHING;

-- Roadmap Stages
INSERT INTO public.roadmap_stages (id, roadmap_id, title, description, "order") VALUES
('33333333-1111-1111-1111-333333333333', '11111111-1111-1111-1111-111111111111', 'Giai đoạn 1: Làm quen & Chào hỏi HSK 1', 'Làm quen với Pinyin, thanh điệu và chào hỏi cơ bản.', 1),
('33333333-2222-2222-2222-333333333333', '11111111-1111-1111-1111-111111111111', 'Giai đoạn 2: Gia đình & Đời sống HSK 1', 'Học cách giới thiệu bản thân và các thành viên trong gia đình.', 2),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Giai đoạn 3: Cuộc sống & Thời tiết HSK 2', 'Nâng cao khả năng giao tiếp mô tả thời tiết, sức khỏe.', 3)
ON CONFLICT (id) DO NOTHING;

-- Lessons
INSERT INTO public.lessons (id, stage_id, title, description, "order", level) VALUES
('44444444-1111-1111-1111-444444444444', '33333333-1111-1111-1111-333333333333', 'Bài 1: Bạn khỏe không? (你好吗？)', 'Học cách chào hỏi cơ bản và giới thiệu đại từ nhân xưng.', 1, 1),
('44444444-2222-2222-2222-444444444444', '33333333-2222-2222-2222-333333333333', 'Bài 2: Gia đình của tôi (我的家)', 'Học cách giới thiệu các thành viên trong gia đình và hỏi han.', 1, 1),
('44444444-3333-3333-3333-444444444444', '33333333-3333-3333-3333-333333333333', 'Bài 3: Hôm nay trời nắng đẹp (今天天气很好)', 'Cách mô tả thời tiết nắng mưa, sức khỏe cơ thể và cảm giác.', 1, 2),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Bài 4: Sở thích của tôi là du lịch (我的爱好是旅游)', 'Học về các hoạt động giải trí: hát, nhảy múa, chạy bộ, du lịch.', 2, 2),
('44444444-5555-5555-5555-444444444444', '33333333-3333-3333-3333-333333333333', 'Bài 5: Mua đồng hồ (买手表)', 'Luyện giao tiếp khi đi mua sắm, so sánh đắt rẻ, đồ vật.', 3, 2)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. SEED DATA - VOCABULARY (HSK 1 & HSK 2)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO public.vocabulary (lesson_id, character, pinyin, meaning_vi, meaning_en, example_zh, example_vi, hsk_level, topic, audio_url) VALUES
-- Lesson 1 (HSK 1)
('44444444-1111-1111-1111-444444444444', '我', 'wǒ', 'Tôi, tớ, mình', 'I, me', '我是学生。', 'Tôi là học sinh.', 1, 'study', '/audio/vocab/wo.mp3'),
('44444444-1111-1111-1111-444444444444', '你', 'nǐ', 'Bạn, anh, chị', 'you', '你好吗？', 'Bạn khỏe không?', 1, 'study', '/audio/vocab/ni.mp3'),
('44444444-1111-1111-1111-444444444444', '他', 'tā', 'Anh ấy, cậu ấy', 'he, him', '他是我的老师。', 'Anh ấy là giáo viên của tôi.', 1, 'study', '/audio/vocab/ta_he.mp3'),
('44444444-1111-1111-1111-444444444444', '她', 'tā', 'Cô ấy, chị ấy', 'she, her', '她很漂亮。', 'Cô ấy rất đẹp.', 1, 'study', '/audio/vocab/ta_she.mp3'),
('44444444-1111-1111-1111-444444444444', '我们', 'wǒmen', 'Chúng tôi, chúng ta', 'we, us', '我们都是留学生。', 'Chúng tôi đều là du học sinh.', 1, 'study', '/audio/vocab/women.mp3'),
('44444444-1111-1111-1111-444444444444', '是', 'shì', 'Là, đúng', 'to be, yes', '他是医生。', 'Anh ấy là bác sĩ.', 1, 'study', '/audio/vocab/shi.mp3'),
('44444444-1111-1111-1111-444444444444', '老师', 'lǎoshī', 'Giáo viên, thầy cô', 'teacher', '王老师您好！', 'Em chào thầy Vương!', 1, 'study', '/audio/vocab/laoshi.mp3'),
('44444444-1111-1111-1111-444444444444', '学生', 'xuéshēng', 'Học sinh, sinh viên', 'student', '他是学校的学生。', 'Cậu ấy là học sinh của trường.', 1, 'study', '/audio/vocab/xuesheng.mp3'),
('44444444-1111-1111-1111-444444444444', '不', 'bù', 'Không (phủ định)', 'not, no', '我不是中国人。', 'Tôi không phải là người Trung Quốc.', 1, 'study', '/audio/vocab/bu.mp3'),
('44444444-1111-1111-1111-444444444444', '好', 'hǎo', 'Tốt, khỏe, ngon', 'good, well', '今天天气很好。', 'Hôm nay thời tiết rất tốt.', 1, 'study', '/audio/vocab/hao.mp3'),

-- Lesson 2 (HSK 1)
('44444444-2222-2222-2222-444444444444', '爸爸', 'bàba', 'Bố, cha', 'father', '我爸爸工作很忙。', 'Bố tôi công việc rất bận.', 1, 'family', '/audio/vocab/baba.mp3'),
('44444444-2222-2222-2222-444444444444', '妈妈', 'māma', 'Mẹ', 'mother', '我爱我妈妈。', 'Tôi yêu mẹ tôi.', 1, 'family', '/audio/vocab/mama.mp3'),
('44444444-2222-2222-2222-444444444444', '家', 'jiā', 'Nhà, gia đình', 'home, family', '我家有三口人。', 'Nhà tôi có ba người.', 1, 'family', '/audio/vocab/jia.mp3'),
('44444444-2222-2222-2222-444444444444', '谢谢', 'xièxie', 'Cảm ơn', 'thank you', '谢谢你的礼物！', 'Cảm ơn món quà của bạn!', 1, 'family', '/audio/vocab/xiexie.mp3'),
('44444444-2222-2222-2222-444444444444', '再见', 'zàijiàn', 'Tạm biệt', 'goodbye', '老师，再见！', 'Em chào thầy, tạm biệt thầy!', 1, 'family', '/audio/vocab/zaijian.mp3'),
('44444444-2222-2222-2222-444444444444', '有', 'yǒu', 'Có', 'to have', '我有一本书。', 'Tôi có một cuốn sách.', 1, 'family', '/audio/vocab/you.mp3'),
('44444444-2222-2222-2222-444444444444', '医生', 'yīshēng', 'Bác sĩ', 'doctor', '他在医院做医生。', 'Anh ấy làm bác sĩ ở bệnh viện.', 1, 'work', '/audio/vocab/yisheng.mp3'),
('44444444-2222-2222-2222-444444444444', '学校', 'xuéxiào', 'Trường học', 'school', '我们的学校很大。', 'Trường học của chúng tôi rất lớn.', 1, 'study', '/audio/vocab/xuexiao.mp3'),
('44444444-2222-2222-2222-444444444444', '苹果', 'píngguǒ', 'Quả táo', 'apple', '我喜欢吃苹果。', 'Tôi thích ăn táo.', 1, 'food', '/audio/vocab/pingguo.mp3'),
('44444444-2222-2222-2222-444444444444', '水', 'shuǐ', 'Nước', 'water', '请喝水。', 'Xin mời uống nước.', 1, 'food', '/audio/vocab/shui.mp3'),

-- Lesson 3 (HSK 2)
('44444444-3333-3333-3333-444444444444', '生病', 'shēngbìng', 'Ốm, bị bệnh', 'to fall ill', '他生病了，没去上课。', 'Anh ấy ốm rồi, không đi lên lớp.', 2, 'health', '/audio/vocab/shengbing.mp3'),
('44444444-3333-3333-3333-444444444444', '药', 'yào', 'Thuốc', 'medicine', '吃药了吗？感觉好点吗？', 'Uống thuốc chưa? Cảm thấy đỡ hơn chút nào không?', 2, 'health', '/audio/vocab/yao.mp3'),
('44444444-3333-3333-3333-444444444444', '身体', 'shēntǐ', 'Cơ thể, sức khỏe', 'body, health', '你要多运动，身体才会好。', 'Bạn phải vận động nhiều thì sức khỏe mới tốt.', 2, 'health', '/audio/vocab/shenti.mp3'),
('44444444-3333-3333-3333-444444444444', '晴', 'qíng', 'Nắng, quang đãng', 'sunny', '今天是晴天。', 'Hôm nay là ngày nắng.', 2, 'travel', '/audio/vocab/qing.mp3'),
('44444444-3333-3333-3333-444444444444', '阴', 'yīn', 'Râm, âm u', 'cloudy', '阴天不冷也不热。', 'Trời nhiều mây không lạnh cũng không nóng.', 2, 'travel', '/audio/vocab/yin.mp3'),
('44444444-3333-3333-3333-444444444444', '雪', 'xuě', 'Tuyết', 'snow', '昨晚下雪了。', 'Tối qua tuyết rơi rồi.', 2, 'travel', '/audio/vocab/xue.mp3'),
('44444444-3333-3333-3333-444444444444', '零', 'líng', 'Số 0', 'zero', '今天气温是零下五度。', 'Nhiệt độ hôm nay là âm 5 độ.', 2, 'travel', '/audio/vocab/ling.mp3'),

-- Lesson 4 (HSK 2)
('44444444-4444-4444-4444-444444444444', '咖啡', 'kāfēi', 'Cà phê', 'coffee', '你喜欢喝茶还是喝咖啡？', 'Bạn thích uống trà hay uống cà phê?', 2, 'food', '/audio/vocab/kafei.mp3'),
('44444444-4444-4444-4444-444444444444', '跑步', 'pǎobù', 'Chạy bộ', 'running', '我每天早上跑步。', 'Tôi chạy bộ mỗi sáng.', 2, 'health', '/audio/vocab/paobu.mp3'),
('44444444-4444-4444-4444-444444444444', '唱歌', 'chànggē', 'Hát', 'to sing', '她在房间里唱歌。', 'Cô ấy đang hát ở trong phòng.', 2, 'entertainment', '/audio/vocab/changge.mp3'),
('44444444-4444-4444-4444-444444444444', '跳舞', 'tiàowǔ', 'Nhảy múa', 'to dance', '他们正在跳舞。', 'Họ đang nhảy múa.', 2, 'entertainment', '/audio/vocab/tiaowu.mp3'),
('44444444-4444-4444-4444-444444444444', '旅游', 'lǚyóu', 'Du lịch', 'to travel', '今年夏天我想去中国旅游。', 'Mùa hè năm nay tôi muốn đi du lịch Trung Quốc.', 2, 'travel', '/audio/vocab/lvyou.mp3'),
('44444444-4444-4444-4444-444444444444', '机场', 'jīchǎng', 'Sân bay', 'airport', '我去机场送朋友。', 'Tôi đi sân bay tiễn bạn.', 2, 'travel', '/audio/vocab/jichang.mp3'),

-- Lesson 5 (HSK 2)
('44444444-5555-5555-5555-444444444444', '手表', 'shǒubiǎo', 'Đồng hồ đeo tay', 'watch', '这块手表太贵了。', 'Chiếc đồng hồ này đắt quá.', 2, 'shopping', '/audio/vocab/shoubiao.mp3'),
('44444444-5555-5555-5555-444444444444', '房间', 'fángjiān', 'Phòng, căn phòng', 'room', '这是我的房间。', 'Đây là căn phòng của tôi.', 2, 'family', '/audio/vocab/fangjian.mp3'),
('44444444-5555-5555-5555-444444444444', '牛奶', 'niúnǎi', 'Sữa bò', 'milk', '喝一杯牛奶对身体好。', 'Uống một ly sữa tốt cho cơ thể.', 2, 'food', '/audio/vocab/niunai.mp3'),
('44444444-5555-5555-5555-444444444444', '报纸', 'bàozhǐ', 'Báo giấy', 'newspaper', '我爸爸喜欢看报纸。', 'Bố tôi thích đọc báo.', 2, 'study', '/audio/vocab/baozhi.mp3'),
('44444444-5555-5555-5555-444444444444', '便宜', 'piányi', 'Rẻ', 'cheap', '苹果很便宜，我们买一点吧。', 'Táo rất rẻ, chúng ta mua một ít đi.', 2, 'shopping', '/audio/vocab/pianyi.mp3'),
('44444444-5555-5555-5555-444444444444', '贵', 'guì', 'Đắt, quý', 'expensive', '这件衣服太贵了。', 'Chiếc áo này đắt quá.', 2, 'shopping', '/audio/vocab/gui.mp3'),
('44444444-5555-5555-5555-444444444444', '眼睛', 'yǎnjing', 'Mắt, đôi mắt', 'eye', '她的眼睛很大。', 'Đôi mắt của cô ấy rất to.', 2, 'health', '/audio/vocab/yanjing.mp3');

-- ─────────────────────────────────────────────────────────────────────────
-- 9. SEED DATA - GRAMMAR POINTS (HSK 1 & HSK 2)
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO public.grammar_points (lesson_id, title, formula, explanation_vi, example_1_zh, example_1_vi, example_2_zh, example_2_vi, example_3_zh, example_3_vi, quiz_question, quiz_options, quiz_answer) VALUES
('44444444-1111-1111-1111-444444444444', 
 'Trợ từ sở hữu 的 (de)', 
 'N/Adj/Pron + 的 + Danh từ', 
 'Dùng để nối định ngữ và trung tâm ngữ, biểu thị quan hệ sở hữu hoặc bổ nghĩa.', 
 '这是我的书。', 'Đây là sách của tôi.', 
 '漂亮的花儿。', 'Hoa đẹp.', 
 '彼の老师。', 'Giáo viên của anh ấy.', 
 'Chọn câu đúng:', '["我书", "我的书", "书的我"]', '我的书'),

('44444444-2222-2222-2222-444444444444', 
 'Cấu trúc nhấn mạnh 太...了 (tài...le)', 
 '太 + Tính từ + 了', 
 'Biểu thị mức độ cao (quá, cực kỳ), thường dùng để cảm thán.', 
 '太好了！', 'Tốt quá rồi!', 
 '今天天气太热了。', 'Thời tiết hôm nay nóng quá.', 
 '这件衣服太贵了。', 'Bộ quần áo này đắt quá.', 
 'Điền từ: "这苹果太好吃___。"', '["的", "了", "不"]', '了'),

('44444444-3333-3333-3333-444444444444', 
 'Liên từ tuy... nhưng... 虽然...但是...', 
 '虽然 + Mệnh đề 1, 但是 + Mệnh đề 2', 
 'Dùng để biểu thị quan hệ chuyển ngoặt (tuy... nhưng...).', 
 '虽然外面下雪，但是屋里很暖和。', 'Tuy bên ngoài tuyết rơi, nhưng trong phòng rất ấm áp.', 
 '虽然他生病了，但是he坚持去学校。', 'Tuy anh ấy bị ốm, nhưng anh ấy vẫn kiên trì đến trường.', 
 '虽然 tiếng Trung rất khó, nhưng tôi rất thích học。', 'Tuy tiếng Trung rất khó, nhưng tôi rất thích học.', 
 'Điền từ: "虽然今天下雨，______他还是出门了。"', '["但是", "所以", "如果"]', 'đáp án: 但是'),

('44444444-4444-4444-4444-444444444444', 
 'So sánh hơn 比 (bǐ)', 
 'A + 比 + B + Tính từ', 
 'Dùng để so sánh tính chất giữa A và B.', 
 '今天比昨天热。', 'Hôm nay nóng hơn hôm qua.', 
 '我比你高。', 'Tôi cao hơn bạn.', 
 '坐飞机比坐火车快。', 'Đi máy bay nhanh hơn đi tàu hỏa.', 
 'Sắp xếp: "哥哥 (1) 弟弟 (2) 比 (3) 矮 (4)" để nói "Anh thấp hơn em"', '["1-3-2-4", "2-3-1-4", "1-2-3-4"]', '1-3-2-4'),

('44444444-5555-5555-5555-444444444444', 
 'Cấu trúc nhấn mạnh 是...的 (shì...de)', 
 'Chủ ngữ + 是 + [Thời gian/Địa điểm/Phương thức] + Động từ + 的', 
 'Nhấn mạnh một chi tiết nào đó của hành động đã xảy ra trong quá khứ.', 
 '我是去年来的。', 'Tôi đến vào năm ngoái (nhấn mạnh thời gian).', 
 '我们是坐飞机来的。', 'Chúng tôi đi bằng máy bay đến (nhấn mạnh phương thức).', 
 '这本书是在书店买的。', 'Cuốn sách này mua ở hiệu sách (nhấn mạnh địa điểm).', 
 'Nhấn mạnh địa điểm: "Tôi mua điện thoại ở Hà Nội"', '["我在河内买手机了。", "我的手机是在河内买的。", "我在河内是买手机。"]', '我的手机是在河内买的。');

-- ─────────────────────────────────────────────────────────────────────────
-- 10. SEED DATA - SKILL LESSONS
-- ─────────────────────────────────────────────────────────────────────────

-- Listening Lessons
INSERT INTO public.listening_lessons (lesson_id, title, audio_url, transcript_zh, pinyin, meaning_vi, questions) VALUES
('44444444-1111-1111-1111-444444444444', 
 'Nghe đoạn hội thoại chào hỏi', 
 '/audio/mock_listening_1.mp3', 
 'A: 你好，请问你是王老师的学生吗？\nB: 是的，我是王老师的学生。你ende吗？\nA: 不，我不是学生，我是这里的老师，我姓李。', 
 'A: Nǐ hǎo, qǐngwèn nǐ shì Wáng lǎoshī de xuéshēng ma?\nB: Shì de, wǒ shì Wáng lǎoshī de xuéshēng. Nǐ yě shì ma?\nA: Bù, wǒ bú shì xuéshēng, wǒ shì zhèlǐ de lǎoshī, wǒ xìng Lǐ.', 
 'A: Chào bạn, xin hỏi bạn có phải học sinh của thầy Vương không?\nB: Vâng đúng vậy, tôi là học sinh của thầy Vương. Bạn cũng vậy à?\nA: Không, tôi không phải học sinh, tôi là giáo viên ở đây, tôi họ Lý.', 
 '[{"question": "B làm nghề gì?", "options": ["学生", "老师", "医生"], "answer": "学生"}, {"question": "A họ gì?", "options": ["王", "李", "张"], "answer": "李"}]'),

('44444444-2222-2222-2222-444444444444', 
 'Trò chuyện về gia đình', 
 '/audio/mock_listening_2.mp3', 
 'A: 你家有几口人？\nB: 我家有四口人：爸爸、妈妈、哥哥和我。你家呢？\nA: 我家有三口人：爸爸、妈妈和我。我没有兄弟姐妹。', 
 'A: Nǐ jiā yǒu jǐ kǒu rén?\nB: Wǒ jiā yǒu sì kǒu rén: bàba, māma, gēge hé wǒ. Nǐ jiā ne?\nA: Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ. Wǒ méiyǒu xiōngdì jiěmèi.', 
 'A: Nhà bạn có mấy người?\nB: Nhà tôi có 4 người: bố, mẹ, anh trai và tôi. Còn nhà bạn?\nA: Nhà tôi có 3 người: bố, mẹ và tôi. Tôi không có anh chị em.', 
 '[{"question": "Nhà B có mấy người?", "options": ["三口", "四口", "五口"], "answer": "四口"}, {"question": "A có anh trai không?", "options": ["u", "没有"], "answer": "没有"}]'),

('44444444-3333-3333-3333-444444444444', 
 'Hôm nay có lạnh không?', 
 '/audio/mock_listening_3.mp3', 
 'A: 今天外面下雪了，气温零下三度。\nB: 哇，今天真冷。虽然很冷，但是我很喜欢雪。你呢？\nA: 我不喜欢下雪，我喜欢晴天。', 
 'A: Jīntiān wàimiàn xiàxuě le, qìwēn língxià sān dù.\nB: Wa, jīntiān zhēn lěng. Suīrán hěn lěng, dànshì wǒ hěn xǐhuān xuě. Nǐ ne?\nA: Wǒ bù xǐhuān xià xuě, wǒ xǐhuān qíngtiān.', 
 'A: Hôm nay bên ngoài tuyết rơi rồi, nhiệt độ âm 3 độ.\nB: Oa, hôm nay lạnh thật. Tuy rất lạnh, nhưng tôi rất thích tuyết. Còn bạn?\nA: Tôi không thích tuyết rơi, tôi thích ngày nắng.', 
 '[{"question": "Nhiệt độ hôm nay là bao nhiêu độ?", "options": ["零下三度", "零下五度", "零度"], "answer": "零下三度"}, {"question": "A thích thời tiết thế nào?", "options": ["下雪天", "阴天", "晴天"], "answer": "晴天"}]');

-- Speaking Topics
INSERT INTO public.speaking_topics (lesson_id, title, prompt, prep_time, record_time) VALUES
('44444444-1111-1111-1111-444444444444', 'Giới thiệu bản thân', '请用中文介绍一下你自己（姓名、年龄、国籍、学习汉语的原因等）。\nHãy giới thiệu bản thân bằng tiếng Trung (tên, tuổi, quốc tịch, lý do học tiếng Trung, v.v.).', 10, 60),
('44444444-2222-2222-2222-444444444444', 'Gia đình của bạn', '你家有几口人？他们是谁？请简单说说你的家人。\nNhà bạn có mấy người? Họ là những ai? Hãy nói đơn giản về người nhà của bạn.', 15, 90),
('44444444-3333-3333-3333-444444444444', 'Sức khỏe và Thời tiết hôm nay', '今天天气怎么样？你喜欢什么样的天气？为什么？\nThời tiết hôm nay thế nào? Bạn thích thời tiết như thế nào? Tại sao?', 20, 120),
('44444444-4444-4444-4444-444444444444', 'Kế hoạch du lịch của bạn', '你喜欢旅游吗？你最想去哪里旅游？为什么？\nBạn thích đi du lịch không? Nơi bạn muốn đi du lịch nhất là đâu? Tại sao?', 20, 120),
('44444444-5555-5555-5555-444444444444', 'Sở thích mua sắm', '你喜欢买东西吗？你最近买的贵的东西是什么？请说一说。\nBạn thích mua sắm không? Món đồ đắt nhất gần đây bạn mua là gì? Hãy kể về nó.', 20, 120);

-- Reading Lessons
INSERT INTO public.reading_lessons (lesson_id, title, content_zh, translation_vi, questions) VALUES
('44444444-1111-1111-1111-444444444444', 
 'Chào hỏi thầy giáo', 
 '王老师是我们的汉语老师。他今年四十岁，是北京人。王老师对学生很好，大家都非常喜欢他。每天早上，我们看见王老师都会说：“王老师，您好！”', 
 'Thầy Vương là giáo viên tiếng Trung của chúng tôi. Thầy năm nay 40 tuổi, là người Bắc Kinh. Thầy Vương rất tốt với học sinh, mọi người đều vô cùng thích thầy. Mỗi sáng, chúng tôi nhìn thấy thầy Vương đều sẽ nói: "Em chào thầy Vương ạ!"', 
 '[{"question": "Thầy Vương năm nay bao nhiêu tuổi?", "options": ["三十岁", "四十岁", "五十岁"], "answer": "四十岁"}, {"question": "Thầy Vương là người ở đâu?", "options": ["北京人", "上海人", "越南人"], "answer": "北京人"}]'),

('44444444-2222-2222-2222-444444444444', 
 'Gia đình của Tiểu Minh', 
 '小明家在上海。他家有三口人：爸爸、妈妈和小明。他爸爸是医生，在医院工作，每天都很忙。他妈妈不工作，是家庭主妇。小明是大学生，他学习很努力。', 
 'Nhà Tiểu Minh ở Thượng Hải. Nhà cậu ấy có ba người: bố, mẹ và Tiểu Minh. Bố cậu ấy là bác sĩ, làm việc ở bệnh viện, mỗi ngày đều rất bận. Mẹ cậu ấy không đi làm, là nội trợ. Tiểu Minh là sinh viên đại học, cậu ấy học tập rất nỗ lực.', 
 '[{"question": "Bố của Tiểu Minh làm nghề gì?", "options": ["老师", "医生", "学生"], "answer": "医生"}, {"question": "Nhà Tiểu Minh có mấy người?", "options": ["三口", "四口", "五口"], "answer": "三口"}]'),

('44444444-3333-3333-3333-444444444444', 
 'Thời tiết bốn mùa', 
 '北京的一年有四个季节：春、夏、秋、冬。这里的夏天很热，最高气温有三十八度。冬天很冷，常常下雪，气温有时候在零下十度。秋天是北京最好的季节，天气不冷也不热，总是晴天。', 
 'Một năm ở Bắc Kinh có mùa xuân, mùa hạ, mùa thu, mùa đông. Mùa hè ở đây rất nóng, nhiệt độ cao nhất có 38 độ. Mùa đông rất lạnh, thường xuyên có tuyết rơi, nhiệt độ có lúc âm 10 độ. Mùa thu là mùa đẹp nhất ở Bắc Kinh, thời tiết không lạnh cũng không nóng, luôn luôn là trời nắng.', 
 '[{"question": "Mùa đẹp nhất ở Bắc Kinh là mùa nào?", "options": ["春天", "夏天", "秋天", "冬天"], "answer": "秋天"}, {"question": "Mùa đông ở Bắc Kinh thời tiết thế nào?", "options": ["很热", "很冷，常常下雪", "非常舒服"], "answer": "很冷，常常下雪"}]');

-- Writing Tasks
INSERT INTO public.writing_tasks (lesson_id, title, prompt, min_words, checklist) VALUES
('44444444-1111-1111-1111-444444444444', 'Viết lời chào gửi thầy giáo', 'Hãy viết một bức thư ngắn (khoảng 15-20 chữ) chào hỏi thầy Vương và giới thiệu tên bạn.', 15, '["Chào thầy Vương (王老师，您好)", "Giới thiệu tên mình (我叫...)", "Viết tối thiểu 15 ký tự Hán"]'),
('44444444-2222-2222-2222-444444444444', 'Mô tả gia đình của em', 'Hãy viết một đoạn văn ngắn (30-40 chữ) giới thiệu về gia đình em (nhà có mấy người, bố mẹ làm nghề gì, sống ở đâu).', 30, '["Nêu số người trong gia đình (我家有...)", "Kể tên các thành viên (爸爸，妈妈...)", "Dùng từ ""谢谢"" hoặc ""再见"""]'),
('44444444-3333-3333-3333-444444444444', 'Kể về thời tiết yêu thích', 'Hãy viết một đoạn văn ngắn (40-50 chữ) kể về thời tiết hôm nay và thời tiết bạn thích nhất, kết hợp sử dụng cấu trúc "although... nhưng...".', 40, '["Mô tả thời tiết hôm nay (晴/阴/雪)", "Sử dụng cấu trúc mặc dù... nhưng... (although...但是...)", "Nêu lý do thích thời tiết đó"]');

-- ─────────────────────────────────────────────────────────────────────────
-- 11. SEED DATA - QUIZZES
-- ─────────────────────────────────────────────────────────────────────────

-- Quizzes
INSERT INTO public.quizzes (id, lesson_id, title, description) VALUES
('55555555-1111-1111-1111-555555555555', '44444444-1111-1111-1111-444444444444', 'Kiểm tra bài 1: Chào hỏi & Đại từ', 'Luyện tập từ vựng chào hỏi, đại từ nhân xưng và cấu trúc sở hữu 的.'),
('55555555-2222-2222-2222-555555555555', '44444444-2222-2222-2222-444444444444', 'Kiểm tra bài 2: Gia đình & Công việc', 'Luyện tập các từ chỉ người thân, ngành nghề, cấu trúc 太... l.'),
('55555555-3333-3333-3333-555555555555', '44444444-3333-3333-3333-444444444444', 'Kiểm tra bài 3: Thời tiết & Sức khỏe', 'Bài kiểm tra về từ vựng thời tiết, ốm đau, và liên từ mặc dù... nhưng...')
ON CONFLICT (id) DO NOTHING;

-- Quiz Questions
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer) VALUES
-- Quiz 1
('55555555-1111-1111-1111-555555555555', '“学生” trong tiếng Việt nghĩa là gì?', 'vocabulary', '["Giáo viên", "Học sinh", "Bác sĩ", "Giám đốc"]', 'Học sinh'),
('55555555-1111-1111-1111-555555555555', 'Điền từ thích hợp: “他是______老师，我是学生。”', 'grammar', '["的", "是", "不", "吗"]', '的'),
('55555555-1111-1111-1111-555555555555', 'Pinyin của chữ “她” là gì?', 'vocabulary', '["wǒ", "nǐ", "tā", "shì"]', 'tā'),

-- Quiz 2
('55555555-2222-2222-2222-555555555555', '“Bố tôi là bác sĩ” dịch sang tiếng Trung là?', 'grammar', '["我爸爸是医生。", "我爸爸有医生。", "爸爸我医生 là。", "我妈妈是医生。"]', '我爸爸是医生。'),
('55555555-2222-2222-2222-555555555555', 'Từ “谢谢” được phát âm là:', 'vocabulary', '["zàijiàn", "xièxie", "bàba", "māma"]', 'xièxie'),
('55555555-2222-2222-2222-555555555555', 'Cấu trúc “太好了” có nghĩa là:', 'grammar', '["Không tốt", "Tốt quá rồi", "Bình thường", "Rất tệ"]', 'Tốt quá rồi'),

-- Quiz 3
('55555555-3333-3333-3333-555555555555', '“生病” có nghĩa là gì?', 'vocabulary', '["Sinh nhật", "Mệt mỏi", "Ốm, bị bệnh", "Khỏe mạnh"]', 'Ốm, bị bệnh'),
('55555555-3333-3333-3333-555555555555', 'Từ trái nghĩa với “晴” (Trời nắng) trong bài là:', 'vocabulary', '["阴", "零", "药", "雪"]', '阴'),
('55555555-3333-3333-3333-555555555555', 'Điền vế câu thích hợp: “虽然他生病了, ______.”', 'grammar', '["所以他不去上学。", "但是他还是坚持去上学。", "因为他很累。"]', '但是他还是坚持去上学。');
