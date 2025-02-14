// Firebase SDK 라이브러리 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getFirestore, doc, setDoc, deleteDoc, updateDoc, where, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


// Firebase 구성 정보 설정

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC_AWLt1X27LrQB9j4H67Zf0N5v0Hc4Vig",
    authDomain: "tododata-e3181.firebaseapp.com",
    projectId: "tododata-e3181",
    storageBucket: "tododata-e3181.firebasestorage.app",
    messagingSenderId: "133114291716",
    appId: "1:133114291716:web:0485a5fb4b197dbf563751",
    measurementId: "G-SZE4X10TDF"
};

// Firebase 인스턴스 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 날씨 환산 함수
function getTodayDate() {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let hour = today.getHours();
    let minute = today.getMinutes();

    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
}


// 버튼 클릭시, DB에 전달 
$('#todoBtn').click(async function () {
    let taskText = $('#todoText').val();
    let customId = Date.now().toString();  // 예시로 customId를 생성합니다 (고유값)
    let complete = false;
    let date = getTodayDate();
    // customId 로 id 지정해서 추가하기.
    const docRef = doc(db, "todos", customId);
    try {
        await setDoc(docRef, {
            id: customId,
            text: taskText,
            complete: complete,
            date: date
        });
        showToast("[ " + taskText.slice(0, 15) + "... ] ", "일정을 추가 하였습니다.");
    } catch (error) {
        console.error("에러가 발생했습니다. ", error);
    }
})


// Data 화면에 띄우기
let todos = await getDocs(collection(db, "todos"))
todos.forEach((todo) => {
    let text = todo.data()['text'];
    let complete = todo.data()['complete'];
    let id = todo.data()['id'];
    let date = todo.data()['date'];
    let temp_html = ``
    if (complete === true) {
        temp_html = `
            <li class="list-group-item" id="${id}">
                <div>
                    <input class="form-check-input" type="checkbox" id="checkbox" checked>
                    <input type="text" id="eidt_text" value="${text}">
                    <p class="date-p">${date}</p>
                </div>
                <button type="button" class="btn btn-secondary float-end deleteBtn" id="deleteBtn" data-bs-target="#dynamicModal">삭제</button>
                <button type="button" class="btn btn-secondary float-end editBtn" id="editBtn">수정</button>
            </li>`;
        $('#text-stack-done').append(temp_html);
    } else {
        temp_html = `
            <li class="list-group-item" id="${id}">
                <div>
                    <input class="form-check-input" type="checkbox" id="checkbox">
                    <input type="text" id="eidt_text" value="${text}">
                    <p class="date-p">${date}</p>
                </div>
                <button type="button" class="btn btn-secondary float-end deleteBtn" id="deleteBtn" >삭제</button>
                <button type="button" class="btn btn-secondary float-end editBtn" id="editBtn">수정</button>
            </li>`;
        $('#text-stack').append(temp_html);
    }
});


// 만약에 체크가 되어 있다면, 이 부분은 > 체크로 표시해주기
$('.form-check-input').change(async function () {
    let check_id = $(this).closest('li').attr('id');
    let check_text = $(this).closest('li').find('input[type="text"]').val().trim();
    const docRef = doc(db, "todos", check_id);
    if ($(this).is(':checked')) {
        await updateDoc(docRef, {
            complete: true,
        });
        showToast("[ " + check_text.slice(0, 20) + "... ] ", "일정을 완료 하였습니다.");
        setTimeout(() => {
            window.location.reload();
        }, 3000); // 3초 후 새로고침        
    } else {
        await updateDoc(docRef, {
            complete: false,
        });
        showToast("[ " + check_text.slice(0, 20) + "... ] ", "일정을 미완료 하였습니다.");
        setTimeout(() => {
            window.location.reload();
        }, 3000); // 3초 후 새로고침
    }
});


// Delete btn 작동
$(document).on('click', '.deleteBtn', async function () {
    let check_id = $(this).closest('li').attr('id');
    let task_text = $(this).closest('li').find('input[type="text"]').val().trim();

    actionModal("이 일정을 삭제하시겠습니까?", "[ " + task_text + " ]", "삭제하기");
    $(document).one('click', '#modal-actionBtn', async function () {
        const docRef = doc(db, 'todos', check_id);
        myModal.remove()
        try {
            await deleteDoc(docRef); 
            showToast("[ " + task_text.slice(0, 20) + "... ]  삭제여부", "삭제되었습니다.");
            setTimeout(() => {
                window.location.reload();
            }, 3000); // 3초 후 새로고침
        } catch (error) {
            console.error("삭제 실패: ", error);
        }
    })
    $(document).on('click','#modal-closeBtn', async function (){
        showToast("[ " + task_text.slice(0, 20) + "... ]  삭제여부", "수정 취소 하였습니다.");
        
    })
});

// Edit Btn 수정 버튼
$(document).on('click', '.editBtn', async function () {
    let task_text = $(this).closest('li').find('input[type="text"]').val().trim();
    let check_id = $(this).closest('li').attr('id');
    let date = getTodayDate();
    console.log(task_text,check_id);
    actionModal("해당 일정으로 수정하실건가요?", "[ " + task_text + " ]", "수정하기");

    // 실제로 변경할건지 아닌지 물어보기.
    $(document).on('click', '#modal-actionBtn', async function () { 
        myModal.remove()
        const docRef = doc(db, "todos", check_id);
        updateDoc(docRef, {
            text: task_text,
            date: date
        });
        showToast("[ " + task_text.slice(0, 20) + "... ]  수정여부", "수정되었습니다.");
        setTimeout(() => {
            window.location.reload();
        }, 3000); // 3초 후 새로고침
    })
    $(document).on('click','#modal-closeBtn', async function (){
        showToast("[ " + task_text.slice(0, 20) + "... ]  수정여부", "수정 취소 하였습니다.");
    })
});


// 토스트 닫기 누르면 리로드 됨.
$(document).on("click","#toast-closeBtn", async function (){
    window.location.reload();
})


// 날씨와 온도 가져오기.
var apiUrl = "https://api.openweathermap.org/data/2.5/weather?id=1835848&APPID=2b26f0cb27375511054fc26654fb56b6&lang=kr&units=metric";
fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
        var temperature = data.main.temp;
        var description = data.weather[0].description;
        $('#tempInfo').text(temperature);
        $('#weatherInfo').text(description);
    })


// Toast 만들기
function showToast(title, message) {
    var htmlToast = `
        <div id="toast"class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <small class="text-body-secondary">ToDoApp</small>
                <hr class="sep-3" />
                <button type="button" id="toast-closeBtn" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
        `
    $("#dynamicToast").remove()
    // jQuery로 Toast를 페이지에 추가
    $("#toast-container").html(htmlToast);

    // Bootstrap Toast 활성화
    let toastElement = new bootstrap.Toast($('#toast-container .toast')[0]);
    toastElement.show();
}


// Modal을 전달.
function actionModal(title, message, action) {
    // 모달의 HTML 구조를 동적으로 생성
    const modalHTML = `
        <div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="myModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="myModalLabel">${title}</h5>
                    </div>
                    <div class="modal-body">
                        ${message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="modal-closeBtn" data-bs-dismiss="modal">닫기</button>
                        <button type="button" class="btn btn-primary" id="modal-actionBtn" >${action}</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 모달 HTML을 body에 추가
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Bootstrap 모달 인스턴스를 생성하고 표시
    const modalElement = document.getElementById("myModal");
    const myModal = new bootstrap.Modal(modalElement);

    // 모달을 표시
    myModal.show();

    // // 모달이 닫힐 때 포커스를 제거하는 처리
    document.addEventListener('hide.bs.modal', function (event) {
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
}
