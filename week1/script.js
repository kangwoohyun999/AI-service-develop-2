// ========================================
// TODO 앱 스크립트
// - DB 없이 자바스크립트 배열(todos)로만 데이터 관리
// - 새로고침하면 데이터는 초기화됨 (로컬 메모리 저장)
// ========================================

// 할 일 데이터를 저장할 배열
// 각 항목은 { id, text, completed } 형태의 객체
let todos = [];

// 각 할 일을 구분하기 위한 고유 id (추가할 때마다 1씩 증가)
let nextId = 1;

// 자주 사용할 DOM 요소들을 미리 참조
const inputEl = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const listEl = document.getElementById("todo-list");
const countText = document.getElementById("count-text");

// ----------------------------------------
// 1. 할 일 추가 기능
// ----------------------------------------
function addTodo() {
  const text = inputEl.value.trim(); // 앞뒤 공백 제거

  // 빈 값이면 추가하지 않음
  if (text === "") {
    alert("할 일을 입력해주세요!");
    return;
  }

  // 새로운 할 일 객체를 배열에 추가
  todos.push({
    id: nextId++,
    text: text,
    completed: false,
  });

  inputEl.value = ""; // 입력창 비우기
  inputEl.focus();
  render(); // 화면 다시 그리기
}

// ----------------------------------------
// 2. 할 일 완료 토글 기능
// ----------------------------------------
function toggleTodo(id) {
  // id가 일치하는 항목의 completed 값을 반전시킴
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  render();
}

// ----------------------------------------
// 3. 할 일 삭제 기능
// ----------------------------------------
function deleteTodo(id) {
  // id가 일치하지 않는 항목들만 남겨서 배열을 갱신
  todos = todos.filter((todo) => todo.id !== id);
  render();
}

// ----------------------------------------
// 4. 화면 렌더링 (목록 + 개수 업데이트)
// ----------------------------------------
function render() {
  // 목록 초기화 후 다시 그리기
  listEl.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");

    // 할 일 텍스트
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.addEventListener("click", () => toggleTodo(todo.id)); // 클릭하면 완료 토글

    // 삭제 버튼
    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "✕";
    delBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(span);
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });

  // 완료되지 않은 할 일 개수 표시
  const remaining = todos.filter((todo) => !todo.completed).length;
  countText.textContent = `할 일: ${remaining}개`;
}

// ----------------------------------------
// 5. 이벤트 리스너 등록
// ----------------------------------------
addBtn.addEventListener("click", addTodo);

// 입력창에서 Enter 키를 눌러도 추가되도록 설정
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTodo();
  }
});

// 최초 렌더링 (빈 목록 상태 표시)
render();
