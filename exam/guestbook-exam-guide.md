# 미니 방명록 실기시험 가이드 — 위에서부터 순서대로 입력하기

**시험 시간:** 14:40 ~ 16:30 (110분)
**제출물:** GitHub Repository URL (**public**) + Vercel 배포 URL, 이 두 가지만 이러닝캠퍼스에 제출
**채점:** 게이트 5점 (배포 URL 접속 + 핵심 기능 동작, 아니면 0점) + 기능 완성도 5점 (CRUD, 수정·삭제 비밀번호 검증)

> **가장 중요한 원칙:** 배포 URL이 안 열리면 **전체 0점**입니다. 그래서 **중간에 한 번 일찍 배포**해서 확인하는 순서로 짰습니다.

---

## 먼저 내 정보 메모해두기

아래 값이 가이드 곳곳에 나옵니다. **예시를 내 걸로 바꿔서** 입력하세요.

| 항목 | 예시 | 내 값 |
|---|---|---|
| 학번 | `20231234` | |
| 이름 | `강우현` | |
| 프로젝트 이름 | `guestbook-20231234` | `guestbook-` + 내 학번 |

### ⚠️ 이름 규칙 (틀리면 감점 위험)

**GitHub 저장소 / Vercel 프로젝트 / Neon 프로젝트** 이름 3개를 모두 `guestbook-<학번>` 으로 통일합니다.

| 어디서 | 이름 |
|---|---|
| Neon 프로젝트 | `guestbook-20231234` |
| GitHub 저장소 | `guestbook-20231234` (**Public**) |
| Vercel 프로젝트 | `guestbook-20231234` |

---

## 만들 것 한눈에 보기

| 항목 | 내용 |
|---|---|
| 테이블 | `entries` (id, name, message, password_hash, created_at, updated_at) |
| 페이지 | `/` 하나 (작성 폼 + 최신순 목록 + 글마다 수정/삭제 버튼) |
| API | `GET /api/entries`, `POST /api/entries`, `PATCH /api/entries/[id]`, `DELETE /api/entries/[id]` |
| 비밀번호 | 글 쓸 때 입력 → **암호화(해시)해서 저장**. 수정·삭제 때 다시 입력해서 맞는지 비교 |
| 틀린 비밀번호 | 서버가 403으로 거부 + 화면에 "비밀번호가 일치하지 않습니다" 표시 |
| 개발자 표시 | 화면 위쪽(또는 아래쪽)에 `만든 사람: 이름 (학번)` |
| 이번에 안 하는 것 | 회원가입/로그인, 페이지 나누기, 댓글, 이미지 |

> 비밀번호 저장 예시: 사용자가 `1234` 를 입력하면 DB에는 `1234` 가 아니라 `a3f9...:9c1b...` 같은 암호화된 문자열이 저장됩니다. DB가 유출돼도 원래 비밀번호를 알 수 없게 하려는 것입니다.

---

## 추천 시간표

| 시간 | 할 일 |
|---|---|
| 14:40 ~ 15:00 | STEP 1~4 (Neon, 프로젝트 생성, GitHub push, Claude Code 실행) |
| 15:00 ~ 15:15 | STEP 5 ①~③ (grill → spec → tickets) |
| 15:15 ~ 15:45 | STEP 5 ④ TICKET 1, 2 구현 |
| **15:45 ~ 15:55** | **STEP 6 첫 배포** (배포 확인에 10분 정도 걸릴 수 있음. 여기서 문제를 미리 발견!) |
| 15:55 ~ 16:15 | TICKET 3 구현 + `/code-review` + push (push하면 자동 재배포) |
| 16:15 ~ 16:30 | 배포 URL에서 작성/조회/수정/삭제 최종 확인 + 제출 |

---

## STEP 1. Neon DB 만들기 (웹 브라우저)

1. https://neon.tech 로그인 → **New Project** → 이름 **`guestbook-20231234`** (내 학번으로)
2. 프로젝트 화면의 **Connection string** 복사 (`postgresql://...` 로 시작하는 긴 문자열)
3. 이 창은 닫지 말고 열어두기 (STEP 5에서 SQL Editor를 다시 씀)

---

## STEP 2. 프로젝트 만들기 (터미널)

폴더를 만들고 싶은 위치(예: 바탕화면)에서 실행합니다. **`guestbook-20231234` 를 내 학번으로 바꾸세요.**

```bash
npx create-next-app@latest guestbook-20231234 --typescript --app --eslint --tailwind --no-src-dir --import-alias "@/*" --use-npm
cd guestbook-20231234
npm i @neondatabase/serverless
```

> 중간에 질문이 나오면 **전부 Enter (기본값)** 로 넘어가면 됩니다.

### 환경변수 파일 만들기

**Mac / Linux**
```bash
echo "DATABASE_URL=여기에_STEP1에서_복사한_연결문자열" > .env.local
```

**Windows (PowerShell)**
```powershell
"DATABASE_URL=여기에_STEP1에서_복사한_연결문자열" | Out-File -Encoding ascii .env.local
```

> 예시로 완성하면 이런 모양입니다.
> ```
> DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
> ```
> 밑줄로 된 안내 글자를 **통째로 지우고** 진짜 연결 문자열을 넣어야 합니다.

### 잘 됐는지 확인

```bash
npm run dev
```

브라우저에서 http://localhost:3000 이 열리면 성공입니다. 확인했으면 터미널에서 `Ctrl + C` 로 끕니다.

---

## STEP 3. GitHub에 첫 push (터미널)

먼저 github.com에서 **New repository** 를 만듭니다.
- 이름: **`guestbook-20231234`** (내 학번으로)
- 공개 설정: **Public** ← 꼭!
- README 체크는 끄기

만들어진 저장소 주소(예: `https://github.com/내아이디/guestbook-20231234.git`)를 아래 `<저장소주소>` 자리에 넣습니다.

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

아무것도 안 나오면 정상입니다. (`.env.local` 이 나오면 안 됩니다. DB 주소가 공개돼요.)

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
미니 방명록 웹앱을 처음부터 만들려고 해. 이름, 메시지, 작성 시각이 함께 쌓이는 방명록이야.
기술 스택은 Next.js(App Router) + TypeScript + API Routes(Route Handlers) +
Neon Postgres(@neondatabase/serverless, ORM 없이 raw SQL)야.
회원가입/로그인은 없고, 글을 쓸 때 함께 입력하는 비밀번호로 본인 글의 수정·삭제 권한만 확인해.
- 작성: 누구나 이름, 메시지, 비밀번호를 입력해 새 글을 남긴다.
- 조회: 누구나 전체 글 목록을 볼 수 있고, 최신 작성 순으로 정렬된다.
- 수정: 비밀번호가 맞으면 메시지 내용만 수정할 수 있다. 틀리면 거부하고 화면에 안내한다.
- 삭제: 비밀번호가 맞으면 삭제할 수 있다. 틀리면 거부하고 화면에 안내한다.
- UI에 개발자 이름과 학번을 표시한다: 【이름】 (【학번】)
댓글, 페이지 나누기, 이미지 업로드, 관리자 기능은 이번에 안 해.
```

에이전트가 질문하면 아래처럼 **짧게** 답합니다. (그대로 복사해서 쓰세요)

| 예상 질문 | 답변 |
|---|---|
| 비밀번호는 어떻게 저장? | 평문으로 저장하지 말고 해시로 저장. 추가 패키지 없이 Node 내장 `crypto`(scrypt + 랜덤 salt)를 쓴다. API 응답에는 해시를 절대 포함하지 않는다 |
| 이름/메시지/비밀번호 길이 제한? | 이름 1~20자, 메시지 1~500자, 비밀번호 4~20자. 공백만 있는 값은 거부. 서버에서도 검사 |
| 비밀번호가 틀리면? | 수정/삭제 API는 403과 "비밀번호가 일치하지 않습니다" 메시지를 돌려주고, 화면에 그 메시지를 표시 |
| 없는 글을 수정/삭제하면? | 404 |
| 수정할 수 있는 것은? | 메시지만. 이름과 작성 시각은 바뀌지 않음. 수정하면 `updated_at` 을 기록하고 화면에 "(수정됨)" 표시 |
| 삭제 전에 확인창? | 브라우저 `confirm()` 으로 한 번 물어본다 |
| 수정/삭제 UI는? | 글마다 [수정] [삭제] 버튼. 누르면 그 글 아래에 비밀번호 입력칸(+ 수정일 땐 새 메시지 입력칸)이 나온다 |
| 페이지 구성? | `/` 한 페이지에 작성 폼 + 목록 + 개발자 이름/학번 |
| 글이 0개일 때? | "아직 작성된 글이 없어요" 문구, 화면은 깨지지 않게 |
| 화면 갱신 방식? | 작성/수정/삭제 성공 후 목록을 다시 불러온다 |

**결과:** `CONTEXT.md`, `docs/adr/` 가 생깁니다.

### ② `/to-spec` — 스펙 문서

```
/to-spec
```

끝나면 스펙 파일에 아래 두 가지가 있는지 눈으로 확인합니다.
- **범위 밖(스코프 제외)** 항목 (로그인, 댓글, 이미지, 페이지 나누기)
- **성공 기준** (예: "틀린 비밀번호로 수정/삭제하면 서버에서 403", "목록 API 응답에 비밀번호(해시)가 없음", "빈 이름/메시지는 서버에서 거부", "글 0개여도 화면이 안 깨짐", "목록은 최신순")

### ③ `/to-tickets` — 티켓 3개로 나누기

```
/to-tickets
티켓은 3개로만 나눠줘.
1) entries 테이블 + 작성/목록 API (POST/GET /api/entries, 비밀번호 해시 저장, 서버 검증)
2) 메인 페이지 UI (작성 폼 + 최신순 목록 + 개발자 이름/학번 표시)
3) 수정/삭제 (PATCH/DELETE /api/entries/[id] 비밀번호 검증 + UI, 틀리면 안내 문구 표시)
```

### ④ `/implement` — 티켓 하나씩 구현

#### TICKET 1

```
/implement
TICKET 1: entries 테이블 + 작성/목록 API (POST/GET /api/entries, 비밀번호 해시 저장, 서버 검증)
```

**끝나면 반드시 (놓치기 쉬움!)** Neon 웹사이트 → **SQL Editor** 에 아래를 붙여넣고 **Run**:

```sql
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);
```

> Claude가 `db/schema.sql` 등에 만든 SQL이 이것과 다르면(컬럼 이름 등), **Claude가 만든 SQL을 실행**하세요.
> 이 SQL을 실행하지 않으면 화면에서 `relation "entries" does not exist` 에러가 납니다.

확인:
```bash
npm run dev
```
새 터미널을 열어서:

**Mac / Linux**
```bash
curl -X POST http://localhost:3000/api/entries -H "Content-Type: application/json" -d '{"name":"홍길동","message":"안녕하세요","password":"1234"}'
```

**Windows (PowerShell)**
```powershell
curl.exe -X POST http://localhost:3000/api/entries -H "Content-Type: application/json" -d "{\"name\":\"홍길동\",\"message\":\"안녕하세요\",\"password\":\"1234\"}"
```

- 글 정보가 담긴 JSON이 돌아오면 성공
- 그 JSON에 `password` 나 `password_hash` 가 **들어 있으면 안 됩니다**
- `http://localhost:3000/api/entries` 를 브라우저로 열면 방금 쓴 글이 보여야 함

#### TICKET 2

```
/implement
TICKET 2: 메인 페이지 UI (작성 폼 + 최신순 목록 + 개발자 이름/학번 표시)
```

확인: http://localhost:3000 에서
1. 개발자 이름과 학번이 보이는지
2. 이름/메시지/비밀번호를 넣고 작성하면 목록 맨 위에 생기는지
3. 비어 있는 값으로 작성하면 에러 문구가 뜨는지

**✅ 여기까지 되면 STEP 6(첫 배포)으로 먼저 갑니다.** (15:45 전후)

#### TICKET 3 (첫 배포 확인 후)

```
/implement
TICKET 3: 수정/삭제 (PATCH/DELETE /api/entries/[id] 비밀번호 검증 + UI, 틀리면 안내 문구 표시)
```

확인 (브라우저에서 직접 해보기):
1. **수정 성공:** 글의 [수정] → 맞는 비밀번호 + 새 메시지 → 목록에 바뀐 내용이 보임
2. **수정 실패:** 일부러 틀린 비밀번호 → "비밀번호가 일치하지 않습니다" 표시, 내용은 그대로
3. **삭제 실패:** 일부러 틀린 비밀번호 → 안내 문구 표시, 글은 그대로
4. **삭제 성공:** 맞는 비밀번호 → 글이 목록에서 사라짐

### ⑤ `/code-review` — 리뷰

```
/code-review
```

- **스펙 위반**으로 나온 것 → 바로 고치기 (특히 비밀번호 검증 관련)
- **취향/스타일 제안** → 시간이 없으면 넘어가기

스펙 위반을 고칠 때:

```
방금 code-review에서 나온 스펙 위반 항목만 수정해줘. 다른 건 건드리지 마.
```

---

## STEP 6. Vercel 배포 (웹 브라우저) — 첫 배포는 TICKET 2 직후!

먼저 지금까지의 코드를 올립니다. Claude Code를 종료(`/exit`)한 뒤 (또는 새 터미널에서):

```bash
npm run build
```

에러 없이 끝나야 합니다. (Vercel 빌드 실패를 미리 막는 단계)

```bash
git add .
git commit -m "방명록 작성/조회 완성"
git push
```

그다음 Vercel에서:

1. https://vercel.com → **Continue with GitHub** 로그인
2. **Add New... → Project** → `guestbook-20231234` 저장소 **Import**
3. **Project Name** 이 `guestbook-20231234` 인지 확인 (아니면 이 화면에서 직접 수정)
4. Application Preset이 **Next.js** 인지 확인
5. **⚠️ Deploy 누르기 전에** **Environment Variables** 를 펼치고
   - Name: `DATABASE_URL`
   - Value: `.env.local` 에 넣은 **연결 문자열과 똑같은 값**
   - **Add** 클릭

   > 이렇게 직접 넣으면 로컬과 **같은 DB**를 쓰게 되어, STEP 5에서 만든 테이블이 그대로 있습니다. 가장 확실한 방법입니다.
6. **Deploy** 클릭 → 배포에 **10분 정도** 걸릴 수 있으니 기다리는 동안 TICKET 3을 진행해도 됩니다
7. `*.vercel.app` 주소로 접속해서 글 작성이 되는지 확인

> 환경변수를 배포 **후에** 추가하거나 바꿨다면: **Deployments → 맨 위 배포 → ⋯ → Redeploy**.
> 환경변수는 **재배포해야** 반영됩니다.

이후 TICKET 3, 코드 리뷰까지 끝내고 `git add . && git commit -m "수정/삭제 완성" && git push` 하면 Vercel이 **자동으로 재배포**합니다.

---

## STEP 7. 제출 전 최종 체크리스트

**배포 URL에서 직접 확인** (내 컴퓨터 localhost 말고!)

- [ ] 개발자 이름과 학번이 화면에 보인다
- [ ] 글 **작성**이 된다
- [ ] 목록이 **최신순**으로 보인다
- [ ] 맞는 비밀번호로 **수정**이 된다
- [ ] 틀린 비밀번호로 수정하면 **거부 안내**가 뜬다
- [ ] 맞는 비밀번호로 **삭제**가 된다
- [ ] 틀린 비밀번호로 삭제하면 **거부 안내**가 뜬다

**이름·공개 설정**

- [ ] GitHub 저장소 이름이 `guestbook-<학번>` 이고 **Public** 이다 (브라우저 시크릿 창에서 저장소 URL을 열어 로그인 없이 보이는지 확인)
- [ ] Vercel 프로젝트 이름이 `guestbook-<학번>` 이다
- [ ] Neon 프로젝트 이름이 `guestbook-<학번>` 이다
- [ ] `.env.local` 이 저장소에 없다

**제출 (이러닝캠퍼스)**

- [ ] GitHub Repository URL 1개 + Vercel 배포 URL 1개 (이 두 가지만)

---

## 막혔을 때

| 증상 | 해결 |
|---|---|
| 화면에 `relation "entries" does not exist` | Neon SQL Editor에서 STEP 5-④ 의 SQL 실행 안 한 것. 또는 Vercel의 `DATABASE_URL` 이 다른 DB를 가리킴 |
| 로컬은 되는데 배포본에서만 DB 에러 | Vercel에 `DATABASE_URL` 이 없거나, 넣은 뒤 Redeploy 안 한 것 |
| 배포 URL이 처음에 아주 느리거나 에러 | Neon 콜드 스타트일 수 있음. 30초~1분 뒤 새로고침 |
| 수정/삭제할 때 비밀번호가 항상 틀렸다고 나옴 | 저장할 때와 비교할 때 해시 방식이 다른 것. Claude Code에 "비밀번호 해시 저장과 검증 로직이 같은 방식인지 확인하고 고쳐줘" 라고 요청 |
| `Build Failed` | Vercel 빌드 로그의 **빨간 글씨**를 그대로 복사해서 Claude Code에 붙여넣기 |
| `git push` 가 거부됨 | `git pull --rebase origin main` 후 다시 `git push` |
| 시간이 너무 부족함 | TICKET 3(수정/삭제)을 **삭제 먼저 → 수정** 순서로 요청. 게이트(5점)는 배포 + 핵심 기능 동작이므로 **배포 URL이 열리는 것이 최우선** |
