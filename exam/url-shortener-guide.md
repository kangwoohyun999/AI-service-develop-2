# URL 단축기: 명령어 순서대로 따라 하기

## 만들 앱 (한눈에)

- **기능:** 긴 URL을 입력하면 짧은 코드(예: `aB3xYz`)가 생기고, `내사이트/aB3xYz`로 접속하면 원래 URL로 이동합니다. 클릭 수도 셉니다.
- **테이블:** `links` (id, code, original_url, click_count, created_at)
- **페이지:** `/` (입력 폼 + 목록), `/[code]` (접속하면 원래 URL로 이동)
- **API:** `POST /api/links` (생성), `GET /api/links` (목록)

---

## STEP 1. 터미널: 프로젝트 만들기

```bash
npx create-next-app@latest url-shortener --typescript --app --eslint --tailwind --no-src-dir --import-alias "@/*"
cd url-shortener
npm i @neondatabase/serverless
```

`.env.local` 파일을 만들고 Neon 연결 문자열을 넣습니다.

```bash
echo 'DATABASE_URL=postgresql://여기에_Neon_연결문자열' > .env.local
```

확인:

```bash
npm run dev
```

브라우저에서 `localhost:3000`이 뜨면 `Ctrl+C`로 끄세요.

---

## STEP 2. 터미널: GitHub 연결

먼저 github.com에서 `url-shortener` 빈 저장소를 만드세요 (README 체크 끄기).

```bash
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/내아이디/url-shortener.git
git push -u origin main
```

`.env.local`이 올라가지 않았는지 GitHub 화면에서 꼭 확인하세요.

---

## STEP 3. Claude Code 실행

```bash
claude
```

---

## STEP 4. Claude Code 안에서 Skills 5개 입력

### ① 요구사항 인터뷰

```
/grill-with-docs
URL 단축기 웹앱을 처음부터 만들려고 해. 긴 URL을 입력하면 6자리 랜덤 코드로 된 짧은 링크가 만들어지고, 그 짧은 링크로 접속하면 원래 URL로 리다이렉트되는 앱이야. 클릭 수도 저장해서 목록에 보여줘. 로그인 없이 익명으로 쓰고, 삭제/수정/만료/커스텀 코드는 이번에 안 해. 기술 스택은 Next.js App Router, API Routes, TypeScript, Neon Postgres(@neondatabase/serverless, ORM 없이 raw SQL)야.
```

에이전트가 질문하면 아래처럼 짧게 답하면 됩니다.

- http/https로 시작하는 URL만 허용
- 같은 URL을 또 넣으면 새 코드를 만들어도 됨
- 코드가 겹치면 다시 생성
- 목록은 최신순

### ② 스펙 만들기

```
/to-spec
```

### ③ 티켓 나누기

```
/to-tickets
티켓은 3개로 작게 나눠줘. 1) DB 스키마 + 단축 링크 생성 API 2) 리다이렉트 + 클릭 수 증가 3) 메인 페이지 UI(입력 폼 + 링크 목록)
```

### ④ 구현 (한 티켓씩)

```
/implement
TICKET 1: links 테이블 생성 SQL(db/schema.sql) + POST /api/links (URL 검증, 6자리 코드 생성, 코드 중복 시 재생성)
```

**여기서 멈추고** `db/schema.sql`의 SQL을 **Neon SQL Editor에 붙여넣고 실행**하세요. 안 하면 다음 단계에서 에러가 납니다. 참고용 SQL은 이렇습니다.

```sql
create table links (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  original_url text not null,
  click_count integer not null default 0,
  created_at timestamptz not null default now()
);
```

이어서 티켓 2, 3을 진행합니다.

```
/implement
TICKET 2: app/[code]/route.ts 에서 code로 원래 URL을 찾아 리다이렉트하고 click_count를 1 증가. 없는 코드는 404
```

```
/implement
TICKET 3: 메인 페이지(/)에 URL 입력 폼과 최신순 링크 목록(짧은 링크, 원래 URL, 클릭 수). 링크가 0개여도 에러 없이 "아직 링크가 없습니다" 표시. Tailwind로 간단히 꾸미기
```

각 티켓이 끝날 때마다 아래 명령어로 브라우저에서 동작을 확인하세요.

```bash
npm run dev
```

### ⑤ 코드 리뷰

```
/code-review
```

나온 지적 중 **스펙 위반**은 바로 고치게 하세요.

```
방금 리뷰에서 나온 스펙 위반 항목을 수정해줘. 나머지 제안은 이번엔 반영하지 마.
```

---

## STEP 5. 배포 전 점검 (터미널에서)

Claude Code를 `/exit`로 나온 뒤 실행합니다.

```bash
npm run build
```

에러가 나면 빨간 글씨를 복사해서 Claude Code에 붙여넣고 고치면 됩니다.

---

## STEP 6. GitHub에 push

```bash
git add .
git commit -m "URL 단축기 완성"
git push
```

---

## STEP 7. Vercel 배포

1. vercel.com에서 GitHub로 로그인
2. **Add New → Project** → `url-shortener` Import
3. **Deploy 누르기 전에** Optional Integrations에서 **Neon Storage → Add → Link Existing Neon Account**로 연결 (`DATABASE_URL`이 자동으로 들어갑니다)
4. **Deploy** 클릭
5. `*.vercel.app` 주소로 접속해서 링크 생성 → 단축 링크 클릭 → 리다이렉트되는지 확인

---

## STEP 8. 제출 전 체크

- [ ] 배포 주소에서 링크 생성이 되는가
- [ ] 단축 링크로 접속하면 원래 URL로 이동하는가
- [ ] 클릭 수가 올라가는가
- [ ] GitHub에 `CONTEXT.md`, `docs/adr/`, 스펙/티켓 파일이 올라가 있는가
- [ ] `.env.local`이 저장소에 없는가
- [ ] **제출:** GitHub Repository URL + Vercel 배포 URL

---

## 자주 막히는 곳

- **"relation links does not exist" 에러:** Neon SQL Editor에서 테이블 생성 SQL을 실행하지 않은 것입니다.
- **배포본에서만 안 될 때:** Vercel에 `DATABASE_URL`이 있는지 확인하고, 추가했다면 Deployments에서 Redeploy 하세요.
- **단축 링크의 도메인이 `localhost`로 나올 때:** 시험 때 Claude Code에게 "링크 도메인을 하드코딩하지 말고 현재 접속 주소(origin) 기준으로 만들어줘"라고 요청하면 됩니다.
