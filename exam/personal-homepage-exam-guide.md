# 개인 홈피 시험 가이드 — 위에서부터 순서대로 입력하기

**만들 앱:** 나를 소개하는 개인 홈페이지

- 맨 위: 내 이름과 한 줄 소개
- 그 아래: **인스타그램 / 유튜브** 링크 버튼
- 그 아래: 내가 쓴 **게시물 목록** (글을 클릭하면 상세 페이지)
- 글쓰기는 **나만** 할 수 있음 (비밀번호를 아는 사람만)

**기술 스택:** Next.js (App Router) + TypeScript + API Routes + Neon Postgres + Vercel

**제출물:** GitHub Repository URL + Vercel 배포 URL

---

## 만들 것 한눈에 보기 (미리 정해두기)

| 항목 | 내용 |
|---|---|
| 테이블 | `posts` (id, title, content, created_at) |
| 페이지 | `/` 홈 (소개 + 링크 버튼 + 게시물 목록), `/posts/[id]` 게시물 상세, `/write` 글쓰기 |
| API | `GET /api/posts` (목록), `POST /api/posts` (작성, 비밀번호 필요), `GET /api/posts/[id]` (상세) |
| 소개·링크 | DB가 아니라 코드 파일 하나(`lib/profile.ts`)에 적어둠 → 바꾸기 쉬움 |
| 글쓰기 보호 | 환경변수 `ADMIN_PASSWORD` 와 같은 비밀번호를 보낸 경우에만 글 저장 |
| 이번에 안 하는 것 | 회원가입/로그인 계정, 글 수정·삭제, 댓글, 이미지 업로드 |

### ⚠️ 시작 전에 내 정보 메모해두기 (STEP 5에서 그대로 붙여넣음)

| 항목 | 내 값 (예시를 지우고 내 걸로 채우기) |
|---|---|
| 이름 | 예: 강우현 |
| 한 줄 소개 | 예: 강남대 인공지능융합공학부 학생입니다. AI와 웹 개발을 공부하고 있어요. |
| 인스타그램 주소 | 예: `https://www.instagram.com/내아이디` |
| 유튜브 주소 | 예: `https://www.youtube.com/@내채널` |
| 글쓰기 비밀번호 | 예: `myhome-2026` (나만 아는 것으로, 너무 쉬운 건 피하기) |

---

## STEP 1. Neon DB 만들기 (웹 브라우저)

1. https://neon.tech 로그인 → **New Project** → 이름 `personal-homepage`
2. 프로젝트 화면의 **Connection string** 복사 (`postgresql://...` 로 시작하는 긴 문자열)
3. 이 창은 닫지 말고 열어두기 (STEP 5에서 SQL Editor를 다시 씀)

---

## STEP 2. 프로젝트 만들기 (터미널)

폴더를 만들고 싶은 위치(예: 바탕화면)에서 실행합니다.

```bash
npx create-next-app@latest personal-homepage --typescript --app --eslint --tailwind --no-src-dir --import-alias "@/*" --use-npm
cd personal-homepage
npm i @neondatabase/serverless
```

> 중간에 질문이 나오면 **전부 Enter (기본값)** 로 넘어가면 됩니다.

### 환경변수 파일 만들기 (DB 주소 + 글쓰기 비밀번호, 두 줄)

**Mac / Linux**
```bash
printf "DATABASE_URL=여기에_STEP1에서_복사한_연결문자열\nADMIN_PASSWORD=내가정한비밀번호\n" > .env.local
```

**Windows (PowerShell)**
```powershell
@("DATABASE_URL=여기에_STEP1에서_복사한_연결문자열", "ADMIN_PASSWORD=내가정한비밀번호") | Out-File -Encoding ascii .env.local
```

> 예시로 완성하면 이런 모양입니다.
> ```
> DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
> ADMIN_PASSWORD=myhome-2026
> ```
> 밑줄로 된 안내 글자를 **통째로 지우고** 진짜 값을 넣어야 합니다.

### 잘 됐는지 확인

```bash
npm run dev
```

브라우저에서 http://localhost:3000 이 열리면 성공입니다. 확인했으면 터미널에서 `Ctrl + C` 로 끕니다.

---

## STEP 3. GitHub에 첫 push (터미널)

먼저 github.com에서 **New repository** → 이름 `personal-homepage` → **README 체크는 끄기** → 만들기.
만들어진 저장소 주소(예: `https://github.com/내아이디/personal-homepage.git`)를 아래 `<저장소주소>` 자리에 넣습니다.

```bash
git add .
git commit -m "first commit"
git branch -M main
git remote add origin <저장소주소>
git push -u origin main
```

### 꼭 확인: 비밀 파일이 안 올라갔는지

```bash
git ls-files | grep .env
```

아무것도 안 나오면 정상입니다. (`.env.local` 이 나오면 안 됩니다. 비밀번호와 DB 주소가 공개돼요.)

---

## STEP 4. Claude Code 실행 (터미널)

```bash
claude
```

Claude Code가 열리면 `/` 를 입력해서 목록에 아래 스킬이 보이는지 확인합니다.

`grill-with-docs`, `to-spec`, `to-tickets`, `implement`, `code-review`

> 안 보이면 수업 때 Pocock Skills를 설치한 방식 그대로 다시 설치한 뒤 `claude`를 다시 실행합니다.

---

## STEP 5. Pocock Skills 5단계

아래 프롬프트를 **Claude Code 안에서 위에서부터 차례로** 붙여넣습니다.
`【 】` 로 표시된 부분은 위에서 메모해둔 **내 값으로 바꿔서** 붙여넣으세요.

### ① `/grill-with-docs` — 요구사항 인터뷰

```
/grill-with-docs
개인 홈페이지 웹앱을 처음부터 만들려고 해. 내 이름과 한 줄 소개, 인스타그램/유튜브 링크 버튼,
내가 쓴 게시물 목록을 보여주는 앱이야. 게시물을 클릭하면 상세 페이지가 열려.
기술 스택은 Next.js(App Router) + TypeScript + API Routes(Route Handlers) +
Neon Postgres(@neondatabase/serverless, ORM 없이 raw SQL)야.
글쓰기는 나만 할 수 있어야 해. 환경변수 ADMIN_PASSWORD와 같은 비밀번호를 입력한 경우에만
글이 저장되게 해줘. 방문자는 로그인 없이 글을 읽기만 해.
회원 계정, 글 수정/삭제, 댓글, 이미지 업로드는 이번에 안 해.

내 정보:
- 이름: 【이름】
- 한 줄 소개: 【한 줄 소개】
- 인스타그램: 【인스타 주소】
- 유튜브: 【유튜브 주소】
```

에이전트가 질문하면 아래처럼 **짧게** 답합니다. (그대로 복사해서 쓰세요)

| 예상 질문 | 답변 |
|---|---|
| 소개와 링크는 어디에 저장? | DB에 넣지 말고 `lib/profile.ts` 파일에 상수로 둔다 |
| 글쓰기 인증 방식은? | 로그인/세션 없이, 글 작성 요청에 비밀번호를 같이 보내고 서버에서 `ADMIN_PASSWORD` 와 비교. 틀리면 401 |
| 글쓰기 페이지 `/write` 는 누구나 볼 수 있어도 되나? | 볼 수는 있지만 비밀번호가 틀리면 저장이 안 된다 |
| 제목/내용 제한은? | 제목 1~100자, 내용 1~5000자. 공백만 있는 값은 거부. 서버에서도 검사 |
| 게시물 내용 표시 방식은? | 일반 텍스트. 줄바꿈은 유지하고, HTML은 실행하지 않고 글자 그대로 보여준다 |
| 게시물 정렬은? | 최신순 |
| 게시물이 0개일 때? | "아직 게시물이 없어요" 문구를 보여주고 화면은 깨지지 않게 |
| 없는 게시물 주소로 접속하면? | 404 페이지 |
| 인스타/유튜브 링크는? | 새 탭으로 열림 (`target="_blank"`, `rel="noopener noreferrer"`) |

**결과:** `CONTEXT.md`, `docs/adr/` 가 생깁니다.

### ② `/to-spec` — 스펙 문서

```
/to-spec
```

끝나면 스펙 파일에 아래 두 가지가 있는지 눈으로 확인합니다.
- **범위 밖(스코프 제외)** 항목 (계정, 수정·삭제, 댓글, 이미지 업로드)
- **성공 기준** (예: "비밀번호가 틀리면 서버에서 401로 거부", "빈 제목/내용은 서버에서 거부", "게시물 0개여도 홈 화면이 안 깨짐", "없는 게시물은 404")

### ③ `/to-tickets` — 티켓 3개로 나누기

```
/to-tickets
티켓은 3개로만 나눠줘.
1) posts 테이블 + API (GET /api/posts, GET /api/posts/[id], POST /api/posts 비밀번호 검증 포함)
2) 홈 페이지(소개 + 인스타/유튜브 링크 버튼 + 게시물 목록) + 게시물 상세 페이지 /posts/[id]
3) 글쓰기 페이지 /write (제목, 내용, 비밀번호 입력 폼)
```

### ④ `/implement` — 티켓 하나씩 구현

#### TICKET 1

```
/implement
TICKET 1: posts 테이블 + API (GET /api/posts, GET /api/posts/[id], POST /api/posts 비밀번호 검증 포함)
```

**끝나면 반드시 (놓치기 쉬움!)** Neon 웹사이트 → **SQL Editor** 에 아래를 붙여넣고 **Run**:

```sql
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);
```

> Claude가 `db/schema.sql` 등에 만든 SQL이 이것과 다르면, **Claude가 만든 SQL을 실행**하세요.
> 이 SQL을 실행하지 않으면 화면에서 `relation "posts" does not exist` 에러가 납니다.

확인:
```bash
npm run dev
```
새 터미널을 열어서 (비밀번호 자리는 `.env.local` 에 넣은 것으로):

**Mac / Linux**
```bash
curl -X POST http://localhost:3000/api/posts -H "Content-Type: application/json" -d '{"title":"첫 글","content":"안녕하세요","password":"내가정한비밀번호"}'
```

**Windows (PowerShell)**
```powershell
curl.exe -X POST http://localhost:3000/api/posts -H "Content-Type: application/json" -d "{\"title\":\"첫 글\",\"content\":\"안녕하세요\",\"password\":\"내가정한비밀번호\"}"
```

- 글 정보가 담긴 JSON이 돌아오면 성공
- 비밀번호를 일부러 틀리게 넣으면 **401** 에러가 나와야 정상
- `http://localhost:3000/api/posts` 를 브라우저로 열면 방금 쓴 글이 목록에 보여야 함

#### TICKET 2

```
/implement
TICKET 2: 홈 페이지(소개 + 인스타/유튜브 링크 버튼 + 게시물 목록) + 게시물 상세 페이지 /posts/[id]
```

확인: http://localhost:3000 에서 이름·소개·링크 버튼이 보이고, 버튼을 누르면 새 탭에서 인스타/유튜브가 열리는지, 목록의 글을 누르면 상세 페이지로 가는지 봅니다. 엉뚱한 주소(`/posts/abc`)는 404가 나와야 합니다.

#### TICKET 3

```
/implement
TICKET 3: 글쓰기 페이지 /write (제목, 내용, 비밀번호 입력 폼)
```

확인: http://localhost:3000/write 에서
1. 비밀번호를 틀리게 넣으면 → 에러 문구가 뜨고 글이 저장되지 않음
2. 맞게 넣으면 → 저장되고 홈 목록 맨 위에 새 글이 보임
3. 제목을 비우면 → 에러 문구가 뜸

### ⑤ `/code-review` — 리뷰

```
/code-review
```

- **스펙 위반**으로 나온 것 → 바로 고치기
- **취향/스타일 제안** → 시간이 없으면 넘어가기

스펙 위반을 고칠 때:

```
방금 code-review에서 나온 스펙 위반 항목만 수정해줘. 다른 건 건드리지 마.
```

---

## STEP 6. 최종 확인 후 GitHub에 push

Claude Code를 종료(`/exit` 또는 `Ctrl + C` 두 번)한 뒤 터미널에서:

```bash
npm run build
```

에러 없이 끝나야 합니다. (Vercel 빌드 실패를 미리 막는 단계)

```bash
git ls-files | grep .env
```

아무것도 안 나와야 합니다. (`.env.local` 이 올라가면 안 됨)

```bash
git add .
git commit -m "개인 홈피 완성"
git push
```

---

## STEP 7. Vercel 배포 (웹 브라우저)

1. https://vercel.com → **Continue with GitHub** 로그인
2. **Add New... → Project** → `personal-homepage` 저장소 **Import**
3. Application Preset이 **Next.js** 인지 확인
4. **⚠️ Deploy 누르기 전에** → **Optional Integrations** 에서 **Neon** → **Add** → **Link Existing Neon Account** → 연결 진행
   (`DATABASE_URL` 이 자동으로 들어갑니다)
5. **⚠️ 글쓰기 비밀번호도 등록:** 같은 화면의 **Environment Variables** 에서
   - Name: `ADMIN_PASSWORD`
   - Value: `.env.local` 에 넣은 것과 **똑같은 비밀번호**
   - **Add** 클릭
   (Neon 연결은 `DATABASE_URL` 만 자동으로 넣어주고, `ADMIN_PASSWORD` 는 **직접** 넣어야 합니다.)
6. **Deploy** 클릭 → 1~2분 기다리기
7. `*.vercel.app` 주소로 접속해서 확인:
   - 홈에 소개와 링크 버튼이 보임
   - `/write` 에서 글 작성 → 홈 목록에 생김
   - 글을 클릭하면 상세 페이지가 열림

> 환경변수를 배포 **후에** 추가하거나 바꿨다면: **Deployments → 맨 위 배포 → ⋯ → Redeploy**.
> 환경변수는 **재배포해야** 반영됩니다.

---

## STEP 8. 제출 전 체크리스트

- [ ] 배포 URL 홈에 이름, 한 줄 소개, 인스타/유튜브 버튼이 보인다
- [ ] 인스타/유튜브 버튼이 **내 진짜 주소**로 열린다 (예시 주소가 남아 있지 않은지)
- [ ] 배포 URL의 `/write` 에서 글을 쓰면 목록에 나타난다
- [ ] 틀린 비밀번호로는 글이 저장되지 않는다
- [ ] 게시물 클릭 시 상세 페이지가 열리고, 엉뚱한 주소는 404가 뜬다
- [ ] GitHub 저장소에 `CONTEXT.md`, `docs/adr/`, 스펙/티켓 파일이 올라가 있다 (Skills 사용 증거)
- [ ] `.env.local` 이 저장소에 없다
- [ ] **제출:** GitHub Repository URL + Vercel 배포 URL

---

## 막혔을 때

| 증상 | 해결 |
|---|---|
| 화면에 `relation "posts" does not exist` | Neon SQL Editor에서 STEP 5-④ 의 SQL 실행 안 한 것 |
| 로컬은 되는데 배포본에서 글쓰기가 항상 401 | Vercel에 `ADMIN_PASSWORD` 가 없거나, 넣은 뒤 Redeploy 안 한 것 |
| 로컬은 되는데 배포본에서 DB 에러 | Vercel에 `DATABASE_URL` 이 없거나 Redeploy 안 한 것. Storage/Integrations에서 Neon이 이 프로젝트에 연결되어 있는지 확인 |
| 링크 버튼을 눌렀더니 예시 주소로 감 | `lib/profile.ts` 의 주소를 내 것으로 바꾸고 `git add . && git commit -m "링크 수정" && git push` |
| `Build Failed` | Vercel 빌드 로그의 **빨간 글씨**를 그대로 복사해서 Claude Code에 붙여넣기 |
| `git push` 가 거부됨 | `git pull --rebase origin main` 후 다시 `git push` |
